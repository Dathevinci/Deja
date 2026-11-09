package com.music.bitchord.data

import android.app.Activity
import android.content.ClipData
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.music.bitchord.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.Request
import java.io.File

/**
 * BitChord ships as a sideloaded APK off GitHub Releases rather than through
 * a store, so there's nothing to push an update notice on its own — this
 * polls the repo's "latest release" once per launch and compares its tag
 * against the running build.
 *
 * The update itself is also handled here: the release's `.apk` asset is
 * downloaded into the app's cache and handed to the system package installer,
 * so the whole round trip stays inside the app instead of bouncing out to a
 * browser.
 */
object AppUpdateChecker {

    data class UpdateInfo(
        val version: String,
        val releaseUrl: String,
        val apkUrl: String?,
        /** The release's own Markdown body, shown as this update's "what's new". */
        val notes: String?,
    )

    private const val CACHE_SUBDIR = "updates"
    private const val APK_MIME_TYPE = "application/vnd.android.package-archive"
    private const val MIN_VALID_APK_BYTES = 1024 * 1024L

    private const val LATEST_RELEASE_URL =
        "https://api.github.com/repos/Dathevinci/Deja/releases/latest"
    private const val RELEASES_LIST_URL =
        "https://api.github.com/repos/Dathevinci/Deja/releases?per_page=5"
    private const val FALLBACK_LATEST_APK_URL =
        "https://github.com/Dathevinci/Deja/releases/latest/download/Deja.apk"

    private val json = Json { ignoreUnknownKeys = true }

    private val _available = MutableStateFlow<UpdateInfo?>(null)
    val available = _available.asStateFlow()

    /** Where this update's APK download currently stands, for the dialog's progress row. */
    sealed interface DownloadState {
        data object Idle : DownloadState
        data class Downloading(val fraction: Float) : DownloadState
        data class Ready(val file: File) : DownloadState
        data class Failed(val message: String) : DownloadState
    }

    private val _download = MutableStateFlow<DownloadState>(DownloadState.Idle)
    val download = _download.asStateFlow()

    /** Set from the UI thread when the user cancels; polled between network reads. */
    @Volatile
    private var downloadCancelled = false

    /** Held when installApk redirects to Settings to grant unknown-sources permission. */
    @Volatile
    private var pendingInstallFile: File? = null

    suspend fun check() = withContext(Dispatchers.IO) {
        runCatching {
            val releases = fetchCandidateReleases()
            for (release in releases) {
                if (release["draft"]?.jsonPrimitive?.contentOrNull == "true") continue
                if (release["prerelease"]?.jsonPrimitive?.contentOrNull == "true") continue
                if (isWindowsOnlyRelease(release)) continue
                val apkUrl = findPreferredApkUrl(release) ?: continue
                val tag = release["tag_name"]?.jsonPrimitive?.contentOrNull ?: continue
                val url = release["html_url"]?.jsonPrimitive?.contentOrNull ?: continue
                val notes = release["body"]?.jsonPrimitive?.contentOrNull
                val latest = extractAndroidReleaseVersion(release, tag)
                if (isNewer(latest, BuildConfig.VERSION_NAME)) {
                    _available.value = UpdateInfo(latest, url, apkUrl, notes)
                }
                break
            }
        }
    }

    private fun fetchCandidateReleases(): List<JsonObject> {
        runCatching {
            val listReq = Request.Builder().url(RELEASES_LIST_URL).build()
            val listBody = Http.client.newCall(listReq).execute().use { response ->
                if (!response.isSuccessful) null else response.body?.string()
            }
            if (!listBody.isNullOrBlank()) {
                val arr = json.parseToJsonElement(listBody) as? JsonArray
                val items = arr?.mapNotNull { it as? JsonObject }.orEmpty()
                if (items.isNotEmpty()) return items
            }
        }
        return runCatching {
            val req = Request.Builder().url(LATEST_RELEASE_URL).build()
            val body = Http.client.newCall(req).execute().use { response ->
                if (!response.isSuccessful) null else response.body?.string()
            } ?: return emptyList()
            listOfNotNull(json.parseToJsonElement(body) as? JsonObject)
        }.getOrDefault(emptyList())
    }

    private fun isWindowsOnlyRelease(release: JsonObject): Boolean {
        val tag = release["tag_name"]?.jsonPrimitive?.contentOrNull.orEmpty().lowercase()
        val title = release["name"]?.jsonPrimitive?.contentOrNull.orEmpty().lowercase()
        val body = release["body"]?.jsonPrimitive?.contentOrNull.orEmpty().lowercase()
        if (tag.startsWith("windows-") || tag.startsWith("win-") ||
            tag.endsWith("-windows") || tag.endsWith("-win") || tag.endsWith("-desktop")
        ) {
            return true
        }
        if (title.contains("[windows-only]") || title.contains("(windows only)")) return true
        if (body.contains("[windows-only]") ||
            Regex("""target_platform:\s*windows\b""").containsMatchIn(body) ||
            Regex("""\[platform:\s*windows]""").containsMatchIn(body)
        ) {
            return true
        }
        return false
    }

    private fun extractAndroidReleaseVersion(release: JsonObject, tag: String): String {
        val body = release["body"]?.jsonPrimitive?.contentOrNull.orEmpty()
        val overrideMatch = Regex(
            """(?:android_version|\[android)\s*:\s*v?([0-9]+\.[0-9]+\.[0-9]+)""",
            RegexOption.IGNORE_CASE,
        ).find(body)
        if (overrideMatch != null) {
            return overrideMatch.groupValues[1]
        }
        return tag
            .removePrefix("android-")
            .removePrefix("v")
            .removeSuffix("-android")
            .removeSuffix("-apk")
            .removeSuffix("-mobile")
    }

    /**
     * Wipes any APK left over from a previous run. Called once at cold start
     * so a downloaded update is only ever "Install Now" for the session that
     * downloaded it — the next launch starts clean rather than trying to work
     * out whether a leftover file is still good.
     */
    suspend fun clearCache(context: Context) = withContext(Dispatchers.IO) {
        val currentState = _download.value
        if (currentState is DownloadState.Downloading ||
            currentState is DownloadState.Ready ||
            pendingInstallFile != null
        ) {
            return@withContext
        }
        File(context.cacheDir, CACHE_SUBDIR).listFiles()?.forEach { it.delete() }
    }

    /**
     * Resolves the best `.apk` download URL from [release], preferring a
     * device-ABI split APK (e.g. `Deja-arm64-v8a.apk`) when present and
     * falling back to universal `Deja.apk` or recent releases if needed.
     */
    private fun apkAssetUrl(release: JsonObject, tag: String? = null): String = runCatching {
        findPreferredApkUrl(release)
            ?: fetchFallbackApkUrlFromReleases()
            ?: tag?.takeIf { it.isNotBlank() }?.let {
                "https://github.com/Dathevinci/Deja/releases/download/$it/Deja.apk"
            }
    }.getOrNull() ?: FALLBACK_LATEST_APK_URL

    private fun findPreferredApkUrl(release: JsonObject): String? {
        val apks = release["assets"]?.jsonArray
            ?.mapNotNull { it as? JsonObject }
            ?.filter { asset ->
                asset["name"]?.jsonPrimitive?.contentOrNull?.endsWith(".apk", ignoreCase = true) == true &&
                    asset["state"]?.jsonPrimitive?.contentOrNull == "uploaded"
            }.orEmpty()
        if (apks.isEmpty()) return null
        val primaryAbi = Build.SUPPORTED_ABIS.firstOrNull().orEmpty()
        val abiMatch = if (primaryAbi.isNotEmpty()) {
            apks.firstOrNull {
                it["name"]?.jsonPrimitive?.contentOrNull?.contains(primaryAbi, ignoreCase = true) == true
            }
        } else null
        val universalMatch = apks.firstOrNull {
            it["name"]?.jsonPrimitive?.contentOrNull.equals("Deja.apk", ignoreCase = true)
        }
        val preferred = abiMatch ?: universalMatch ?: apks.firstOrNull()
        return preferred?.get("browser_download_url")?.jsonPrimitive?.contentOrNull
    }

    private fun fetchFallbackApkUrlFromReleases(): String? = runCatching {
        val request = Request.Builder().url(RELEASES_LIST_URL).build()
        val body = Http.client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) null else response.body?.string()
        } ?: return null
        val releases = json.parseToJsonElement(body) as? JsonArray ?: return null
        for (element in releases) {
            val rel = element as? JsonObject ?: continue
            if (rel["draft"]?.jsonPrimitive?.contentOrNull == "true") continue
            if (rel["prerelease"]?.jsonPrimitive?.contentOrNull == "true") continue
            val found = findPreferredApkUrl(rel)
            if (found != null) return found
        }
        null
    }.getOrNull()

    /**
     * Streams the current update's APK into the app cache, reporting progress
     * through [download], validates the APK zip header, and automatically
     * hands the completed file to the system package installer.
     */
    suspend fun downloadApk(context: Context): Unit = withContext(Dispatchers.IO) {
        if (_download.value is DownloadState.Downloading) return@withContext
        val info = _available.value ?: return@withContext
        val primaryUrl = info.apkUrl ?: FALLBACK_LATEST_APK_URL
        downloadCancelled = false
        _download.value = DownloadState.Downloading(0f)

        runCatching {
            val dir = File(context.cacheDir, CACHE_SUBDIR).apply { mkdirs() }
            // Drop anything left over from an earlier attempt.
            dir.listFiles()?.forEach { it.delete() }
            val partFile = File(dir, "deja-${info.version}.apk.part")
            val target = File(dir, "deja-${info.version}.apk")

            val candidateUrls = listOf(primaryUrl, FALLBACK_LATEST_APK_URL).distinct()
            var lastError: Throwable? = null
            var downloaded = false

            for (candidateUrl in candidateUrls) {
                try {
                    partFile.delete()
                    streamUrlToFile(candidateUrl, partFile)
                    if (downloadCancelled) {
                        partFile.delete()
                        _download.value = DownloadState.Idle
                        return@withContext
                    }
                    validateApkFile(partFile)
                    downloaded = true
                    break
                } catch (t: Throwable) {
                    lastError = t
                    if (downloadCancelled) {
                        partFile.delete()
                        _download.value = DownloadState.Idle
                        return@withContext
                    }
                }
            }

            if (!downloaded) {
                throw (lastError ?: IllegalStateException("Unable to download update APK"))
            }

            if (target.exists()) target.delete()
            check(partFile.renameTo(target)) { "Failed to finalize downloaded APK" }
            target.setReadable(true, false)
            _download.value = DownloadState.Ready(target)

            withContext(Dispatchers.Main) {
                installApk(context, target)
            }
        }.onFailure { error ->
            _download.value = if (downloadCancelled) {
                DownloadState.Idle
            } else {
                DownloadState.Failed(error.message ?: "Download failed")
            }
        }
    }

    private fun streamUrlToFile(url: String, destination: File) {
        val request = Request.Builder().url(url).build()
        Http.client.newCall(request).execute().use { response ->
            check(response.isSuccessful) { "Download failed: HTTP ${response.code}" }
            val body = response.body ?: error("Empty download body")
            val total = body.contentLength().takeIf { it > 0 }

            body.byteStream().use { input ->
                destination.outputStream().use { output ->
                    val buffer = ByteArray(64 * 1024)
                    var readTotal = 0L
                    while (true) {
                        if (downloadCancelled) return
                        val read = input.read(buffer)
                        if (read == -1) break
                        output.write(buffer, 0, read)
                        readTotal += read
                        total?.let {
                            _download.value =
                                DownloadState.Downloading((readTotal.toFloat() / it).coerceIn(0f, 1f))
                        }
                    }
                    output.flush()
                }
            }
        }
    }

    private fun validateApkFile(file: File) {
        check(file.exists() && file.length() >= MIN_VALID_APK_BYTES) {
            "Downloaded APK is incomplete (${file.length()} bytes)"
        }
        val header = ByteArray(4)
        val read = file.inputStream().use { it.read(header) }
        check(read == 4 && header[0] == 0x50.toByte() && header[1] == 0x4B.toByte()) {
            "Downloaded file is not a valid Android package"
        }
    }

    /** Stops an in-flight download; the next read loop sees this and bails. */
    fun cancelDownload() {
        downloadCancelled = true
    }

    /** Back to square one after a failure, so the dialog offers Download again. */
    fun resetDownload() {
        pendingInstallFile = null
        _download.value = DownloadState.Idle
    }

    /**
     * Called from [MainActivity.onResume] so that if the user was sent to
     * system Settings to grant "Install unknown apps", returning to Deja
     * automatically resumes the pending APK installation.
     */
    fun resumePendingInstall(context: Context) {
        val pending = pendingInstallFile ?: return
        if (!pending.exists()) {
            pendingInstallFile = null
            return
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O ||
            context.packageManager.canRequestPackageInstalls()
        ) {
            pendingInstallFile = null
            installApk(context, pending)
        }
    }

    /**
     * Hands a downloaded APK to the system installer.
     *
     * Sideloaded apps need the user's blessing per app ("install unknown apps");
     * without it the installer intent silently does nothing on most ROMs, so
     * the user is sent to that one switch first and [resumePendingInstall]
     * launches the installer automatically when they return.
     *
     * Note: `EXTRA_RETURN_RESULT` must NOT be set here — combining it with a
     * standard `startActivity` call causes Android's PackageInstaller (`InstallStart`)
     * to suppress its completion UI or cancel the activity result when launched
     * in a new task.
     */
    fun installApk(context: Context, file: File) {
        if (!file.exists() || file.length() < MIN_VALID_APK_BYTES) {
            _download.value = DownloadState.Failed("Downloaded update file is missing or incomplete.")
            return
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !context.packageManager.canRequestPackageInstalls()
        ) {
            pendingInstallFile = file
            val settingsIntent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                data = Uri.parse("package:${context.packageName}")
                if (context !is Activity) {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
            }
            runCatching {
                context.startActivity(settingsIntent)
            }.onFailure {
                context.startActivity(
                    Intent(Settings.ACTION_SECURITY_SETTINGS).apply {
                        if (context !is Activity) addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    },
                )
            }
            return
        }

        pendingInstallFile = null
        runCatching {
            val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
            val baseFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                if (context !is Activity) Intent.FLAG_ACTIVITY_NEW_TASK else 0

            val viewIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, APK_MIME_TYPE)
                clipData = ClipData.newRawUri("", uri)
                putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true)
                putExtra(Intent.EXTRA_INSTALLER_PACKAGE_NAME, context.packageName)
                addFlags(baseFlags)
            }

            try {
                context.startActivity(viewIntent)
            } catch (_: Throwable) {
                @Suppress("DEPRECATION")
                val fallbackIntent = Intent(Intent.ACTION_INSTALL_PACKAGE).apply {
                    setDataAndType(uri, APK_MIME_TYPE)
                    clipData = ClipData.newRawUri("", uri)
                    putExtra(Intent.EXTRA_NOT_UNKNOWN_SOURCE, true)
                    putExtra(Intent.EXTRA_INSTALLER_PACKAGE_NAME, context.packageName)
                    addFlags(baseFlags)
                }
                context.startActivity(fallbackIntent)
            }
        }.onFailure { error ->
            _download.value = DownloadState.Failed(
                error.message ?: "Could not launch Android package installer",
            )
        }
    }

    /** A version split into its numeric dotted parts and whether it carries a "-suffix" (e.g. "-beta2"). */
    private data class ParsedVersion(val parts: List<Int>, val isPreRelease: Boolean)

    private fun parseVersion(raw: String): ParsedVersion {
        val dash = raw.indexOf('-')
        val base = if (dash >= 0) raw.substring(0, dash) else raw
        return ParsedVersion(base.split(".").map { it.toIntOrNull() ?: 0 }, dash >= 0)
    }

    /**
     * Numeric, dot-separated comparison — "1.10" outranks "1.9" — with one
     * extra rule: a "-betaN" build (see the debug build type's
     * `versionNameSuffix` in app/build.gradle.kts) is treated as older than a
     * plain release of the same numbers, since the beta by definition predates
     * the tag it was testing toward. Without this, a beta and the release it
     * matches compare equal and testers never get nudged onto the real build.
     */
    private fun isNewer(latest: String, current: String): Boolean {
        val l = parseVersion(latest)
        val c = parseVersion(current)
        for (i in 0 until maxOf(l.parts.size, c.parts.size)) {
            val a = l.parts.getOrElse(i) { 0 }
            val b = c.parts.getOrElse(i) { 0 }
            if (a != b) return a > b
        }
        return c.isPreRelease && !l.isPreRelease
    }
}
