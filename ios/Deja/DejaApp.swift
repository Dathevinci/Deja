import SwiftUI
import AVFoundation
import WebKit

@main
struct DejaApp: App {
    init() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [.allowAirPlay, .allowBluetooth])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("[Deja iOS] AudioSession setup notice: \(error)")
        }
    }

    var body: some Scene {
        WindowGroup {
            DejaRootView()
                .preferredColorScheme(.dark)
        }
    }
}

struct DejaRootView: View {
    var body: some View {
        ZStack {
            Color(red: 11/255, green: 9/255, blue: 10/255)
                .ignoresSafeArea()
            DejaWebPlayerView(url: URL(string: "https://music.youtube.com")!)
                .ignoresSafeArea(edges: .bottom)
        }
    }
}

struct DejaWebPlayerView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        config.allowsAirPlayForMediaPlayback = true

        // Inject Deja 2-Bit theme & Apple Music Motion styling into iOS player
        let css = """
        :root { --deja-ruby: #8C2D33; --deja-ivory: #F4EFEA; --deja-ink: #0B090A; }
        body, ytmusic-app { background-color: #0B090A !important; }
        """
        let js = "const s = document.createElement('style'); s.textContent = `\(css)`; document.head.appendChild(s);"
        let script = WKUserScript(source: js, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        config.userContentController.addUserScript(script)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 11/255, green: 9/255, blue: 10/255, alpha: 1.0)
        webView.scrollView.backgroundColor = webView.backgroundColor
        webView.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"
        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
