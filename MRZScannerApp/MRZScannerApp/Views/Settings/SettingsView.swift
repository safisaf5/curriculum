import SwiftUI

struct SettingsView: View {
    @State private var viewModel = SettingsViewModel()
    @State private var showClearHistoryConfirmation = false
    @State private var showClearBlacklistConfirmation = false
    @State private var showClearAllConfirmation = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Scan History") {
                    Toggle("Save scan history", isOn: Binding(
                        get: { viewModel.isHistoryEnabled },
                        set: { viewModel.isHistoryEnabled = $0 }
                    ))

                    HStack {
                        Text("Saved scans")
                        Spacer()
                        Text("\(viewModel.historyCount)")
                            .foregroundStyle(.secondary)
                    }

                    Button("Clear History", role: .destructive) {
                        showClearHistoryConfirmation = true
                    }
                    .disabled(viewModel.historyCount == 0)
                }

                Section("Blacklist") {
                    HStack {
                        Text("Blacklisted documents")
                        Spacer()
                        Text("\(viewModel.blacklistCount)")
                            .foregroundStyle(.secondary)
                    }

                    Button("Clear Blacklist", role: .destructive) {
                        showClearBlacklistConfirmation = true
                    }
                    .disabled(viewModel.blacklistCount == 0)
                }

                Section("Data") {
                    Button("Clear All Data", role: .destructive) {
                        showClearAllConfirmation = true
                    }
                    .disabled(viewModel.historyCount == 0 && viewModel.blacklistCount == 0)
                }

                Section("About") {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundStyle(.secondary)
                    }
                    HStack {
                        Text("Processing")
                        Spacer()
                        Text("100% Offline")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle("Settings")
            .confirmationDialog("Clear scan history?", isPresented: $showClearHistoryConfirmation, titleVisibility: .visible) {
                Button("Clear History", role: .destructive) { viewModel.clearHistory() }
            }
            .confirmationDialog("Clear blacklist?", isPresented: $showClearBlacklistConfirmation, titleVisibility: .visible) {
                Button("Clear Blacklist", role: .destructive) { viewModel.clearBlacklist() }
            }
            .confirmationDialog("Clear all data?", isPresented: $showClearAllConfirmation, titleVisibility: .visible) {
                Button("Clear All Data", role: .destructive) { viewModel.clearAllData() }
            }
        }
    }
}
