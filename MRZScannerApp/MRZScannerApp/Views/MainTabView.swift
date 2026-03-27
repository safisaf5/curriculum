import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            ScannerView()
                .tabItem {
                    Label("Scan", systemImage: "camera.viewfinder")
                }

            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock")
                }

            BlacklistView()
                .tabItem {
                    Label("Blacklist", systemImage: "shield.slash")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
    }
}
