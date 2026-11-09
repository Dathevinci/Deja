package com.music.bitchord

import android.app.Activity
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.Build
import android.os.CancellationSignal
import android.os.Handler
import android.os.Looper
import android.os.ParcelFileDescriptor
import android.provider.DocumentsContract.Document
import android.provider.DocumentsContract.Root
import android.provider.DocumentsProvider
import android.widget.Toast
import androidx.core.app.NotificationCompat

/**
 * Handles one-time migration from legacy package IDs (`com.music.deja` and
 * `com.music.bitchord`) that were signed with ephemeral CI keys prior to
 * v1.6.0 and therefore cannot be updated in-place by Android's PackageManager
 * (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`), nor do they show an "Open" button
 * when installing `com.deja.music` because their `installApk` passed
 * `Intent.EXTRA_RETURN_RESULT = true`.
 */
object LegacyAppMigration {

    private val LEGACY_PACKAGES = listOf("com.music.deja", "com.music.bitchord")
    private const val CHANNEL_ID = "deja_legacy_migration"
    private const val NOTIFICATION_ID = 9164
    const val EXTRA_FROM_MIGRATION = "com.deja.music.EXTRA_FROM_MIGRATION"

    @Volatile
    private var wakeupHandledThisProcess = false

    fun isMigrationIntent(intent: Intent?): Boolean {
        if (intent == null) return false
        if (intent.getBooleanExtra(EXTRA_FROM_MIGRATION, false)) return true
        val data = intent.data ?: return false
        val scheme = data.scheme?.lowercase() ?: return false
        val host = data.host?.lowercase().orEmpty()
        return scheme == "deja-update" ||
            (scheme == "deja" && (host == "finish" || host == "open" || host == "update"))
    }

    fun findInstalledLegacyPackages(context: Context): List<String> {
        val pm = context.packageManager
        val selfPkg = context.packageName
        return LEGACY_PACKAGES.filter { legacyPkg ->
            legacyPkg != selfPkg && runCatching {
                @Suppress("DEPRECATION")
                pm.getPackageInfo(legacyPkg, 0) != null
            }.getOrDefault(false)
        }
    }

    /**
     * Invoked as soon as our process starts (from [BitChordApplication.onCreate],
     * [MigrationDocumentsProvider], or [LegacyMigrationReceiver]). If a legacy
     * package (`com.music.deja` / `com.music.bitchord`) is still installed on
     * the device, posts a high-priority heads-up notification and attempts to
     * bring [MainActivity] to the foreground so the user can immediately remove
     * the old copy.
     */
    fun onProcessAwake(context: Context) {
        val appContext = context.applicationContext ?: context
        val legacyPackages = findInstalledLegacyPackages(appContext)
        if (legacyPackages.isEmpty()) {
            cancelMigrationNotification(appContext)
            return
        }
        if (wakeupHandledThisProcess) return
        wakeupHandledThisProcess = true

        postMigrationNotification(appContext, legacyPackages.first())

        Handler(Looper.getMainLooper()).postDelayed({
            runCatching {
                val launchIntent = Intent(appContext, MainActivity::class.java).apply {
                    addFlags(
                        Intent.FLAG_ACTIVITY_NEW_TASK or
                            Intent.FLAG_ACTIVITY_CLEAR_TOP or
                            Intent.FLAG_ACTIVITY_SINGLE_TOP,
                    )
                    putExtra(EXTRA_FROM_MIGRATION, true)
                }
                appContext.startActivity(launchIntent)
            }
        }, 350L)
    }

    fun requestUninstall(context: Context, legacyPkg: String) {
        runCatching {
            Toast.makeText(
                context,
                "Tap OK to remove the old Deja copy and finish updating",
                Toast.LENGTH_LONG,
            ).show()
        }
        val deleteUri = Uri.parse("package:$legacyPkg")
        val uninstallIntent = Intent(Intent.ACTION_DELETE, deleteUri).apply {
            if (context !is Activity) {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        }
        runCatching {
            context.startActivity(uninstallIntent)
        }.onFailure {
            runCatching {
                @Suppress("DEPRECATION")
                val fallback = Intent(Intent.ACTION_UNINSTALL_PACKAGE, deleteUri).apply {
                    if (context !is Activity) {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                }
                context.startActivity(fallback)
            }
        }
    }

    fun postMigrationNotification(context: Context, legacyPkg: String) {
        runCatching {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager ?: return
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "Software Update Migration",
                    NotificationManager.IMPORTANCE_HIGH,
                ).apply {
                    description = "Completes removal of older Deja versions after an update"
                    enableVibration(true)
                }
                nm.createNotificationChannel(channel)
            }

            val openIntent = Intent(context, MainActivity::class.java).apply {
                addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP,
                )
                putExtra(EXTRA_FROM_MIGRATION, true)
            }
            val pendingFlags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val openPending = PendingIntent.getActivity(context, 1, openIntent, pendingFlags)

            val deleteIntent = Intent(Intent.ACTION_DELETE, Uri.parse("package:$legacyPkg")).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val deletePending = PendingIntent.getActivity(context, 2, deleteIntent, pendingFlags)

            val notification = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle("Deja ${BuildConfig.VERSION_NAME} Installed — Tap to Finish")
                .setContentText("Tap here to remove the old Deja copy and launch Deja ${BuildConfig.VERSION_NAME}.")
                .setStyle(
                    NotificationCompat.BigTextStyle().bigText(
                        "Deja ${BuildConfig.VERSION_NAME} is installed! Tap here (and press OK) to remove the older Deja copy so it stops showing the old 'bitchord' update prompt.",
                    ),
                )
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_SYSTEM)
                .setAutoCancel(true)
                .setOngoing(false)
                .setContentIntent(openPending)
                .setFullScreenIntent(openPending, true)
                .addAction(
                    0,
                    "Remove Old Copy",
                    deletePending,
                )
                .addAction(
                    0,
                    "Open Deja ${BuildConfig.VERSION_NAME}",
                    openPending,
                )
                .build()

            nm.notify(NOTIFICATION_ID, notification)
        }
    }

    fun cancelMigrationNotification(context: Context) {
        runCatching {
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            nm?.cancel(NOTIFICATION_ID)
        }
    }
}

/**
 * Queried automatically by Android's `MediaProvider` / `DocumentsUI` (`RootsCache`)
 * upon `ACTION_PACKAGE_ADDED` / `ACTION_PACKAGE_REPLACED`. Because the query
 * originates from a system process, Android automatically clears `FLAG_STOPPED`
 * on `com.deja.music` and spins up our process immediately when installation
 * completes, allowing [LegacyAppMigration.onProcessAwake] to run right away.
 */
class MigrationDocumentsProvider : DocumentsProvider() {

    override fun onCreate(): Boolean {
        context?.let { LegacyAppMigration.onProcessAwake(it) }
        return true
    }

    override fun queryRoots(projection: Array<out String>?): Cursor {
        context?.let { LegacyAppMigration.onProcessAwake(it) }
        val cols = projection ?: arrayOf(
            Root.COLUMN_ROOT_ID,
            Root.COLUMN_TITLE,
            Root.COLUMN_DOCUMENT_ID,
            Root.COLUMN_ICON,
            Root.COLUMN_FLAGS,
        )
        return MatrixCursor(cols)
    }

    override fun queryDocument(documentId: String?, projection: Array<out String>?): Cursor {
        val cols = projection ?: arrayOf(
            Document.COLUMN_DOCUMENT_ID,
            Document.COLUMN_DISPLAY_NAME,
            Document.COLUMN_MIME_TYPE,
            Document.COLUMN_SIZE,
            Document.COLUMN_FLAGS,
        )
        return MatrixCursor(cols)
    }

    override fun queryChildDocuments(
        parentDocumentId: String?,
        projection: Array<out String>?,
        sortOrder: String?,
    ): Cursor = queryDocument(parentDocumentId, projection)

    override fun openDocument(
        documentId: String?,
        mode: String?,
        signal: CancellationSignal?,
    ): ParcelFileDescriptor = throw java.io.FileNotFoundException("No documents exposed")
}

class LegacyMigrationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        LegacyAppMigration.onProcessAwake(context)
    }
}
