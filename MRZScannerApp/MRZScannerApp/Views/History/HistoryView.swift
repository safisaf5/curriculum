import SwiftUI

struct HistoryView: View {
    @State private var viewModel = HistoryViewModel()
    @State private var showClearConfirmation = false

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.filteredHistory.isEmpty {
                    ContentUnavailableView(
                        "No Scans Yet",
                        systemImage: "doc.text.magnifyingglass",
                        description: Text("Scanned documents will appear here.")
                    )
                } else {
                    List {
                        ForEach(viewModel.filteredHistory) { document in
                            NavigationLink {
                                ResultView(document: document, onScanAgain: {})
                            } label: {
                                historyRow(document)
                            }
                        }
                        .onDelete { indexSet in
                            for index in indexSet {
                                viewModel.deleteEntry(viewModel.filteredHistory[index])
                            }
                        }
                    }
                }
            }
            .navigationTitle("History")
            .searchable(text: $viewModel.searchText, prompt: "Search by name or document number")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        ShareLink(
                            item: viewModel.exportAllJSON(),
                            subject: Text("All Scan Results"),
                            message: Text("Exported scan history")
                        ) {
                            Label("Export All as JSON", systemImage: "square.and.arrow.up")
                        }

                        Button(role: .destructive) {
                            showClearConfirmation = true
                        } label: {
                            Label("Clear All", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .confirmationDialog("Clear all history?", isPresented: $showClearConfirmation, titleVisibility: .visible) {
                Button("Clear All", role: .destructive) {
                    viewModel.clearAll()
                }
            }
        }
    }

    private func historyRow(_ document: ScannedDocument) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(document.fullName)
                        .font(.headline)
                    if viewModel.isBlacklisted(document.documentNumber) {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.red)
                            .font(.caption)
                    }
                }
                Text(document.documentNumber)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text(document.formattedScanDate)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            Text(document.isAdult ? "+18" : "-18")
                .font(.title3.weight(.bold))
                .foregroundStyle(document.isAdult ? .green : .red)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    RoundedRectangle(cornerRadius: 6)
                        .fill(document.isAdult ? Color.green.opacity(0.15) : Color.red.opacity(0.15))
                )
        }
        .padding(.vertical, 2)
    }
}
