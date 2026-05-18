import SwiftUI

struct MainTabView: View {
    var body: some View {
        TabView {
            ScannerView()
                .tabItem {
                    Label("Scanner", systemImage: "camera.viewfinder")
                }

            SessionView()
                .tabItem {
                    Label("Session", systemImage: "person.2.badge.gearshape")
                }

            MoreView()
                .tabItem {
                    Label("Plus", systemImage: "ellipsis.circle")
                }
        }
    }
}
