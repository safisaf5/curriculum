import SwiftUI

struct HistoryView: View {
    @State private var viewModel = HistoryViewModel()
    @State private var showClearConfirmation = false

    var body: some View {
        Group {
            if viewModel.filteredHistory.isEmpty {
                ContentUnavailableView(
                    "Aucun scan",
                    systemImage: "doc.text.magnifyingglass",
                    description: Text("Les documents scannés apparaîtront ici.")
                )
            } else {
                List {
                    ForEach(viewModel.filteredHistory, id: \.id) { document in
                        NavigationLink {
                            DocumentDetailView(document: document)
                        } label: {
                            historyRow(document)
                        }
                        .accessibilityHint("Voir les détails du document")
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            viewModel.deleteEntry(viewModel.filteredHistory[index])
                        }
                    }
                }
                .refreshable {
                    StorageService.shared.reload()
                }
            }
        }
        .navigationTitle("Historique")
        .searchable(text: $viewModel.searchText, prompt: "Rechercher par nom ou numéro")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    ShareLink(
                        item: viewModel.exportAllJSON(),
                        subject: Text("Résultats des scans"),
                        message: Text("Historique exporté")
                    ) {
                        Label("Exporter tout en JSON", systemImage: "square.and.arrow.up")
                    }

                    Button(role: .destructive) {
                        showClearConfirmation = true
                    } label: {
                        Label("Tout effacer", systemImage: "trash")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle")
                }
            }
        }
        .confirmationDialog("Effacer tout l'historique ?", isPresented: $showClearConfirmation, titleVisibility: .visible) {
            Button("Tout effacer", role: .destructive) {
                viewModel.clearAll()
            }
        }
    }

    private func historyRow(_ document: ScannedDocument) -> some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 6) {
                    Text(document.fullName)
                        .font(.headline)

                    if viewModel.isBlacklisted(document) {
                        Text("INTERDIT")
                            .font(.caption2.weight(.black))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(.red, in: Capsule())
                    }

                    if viewModel.isVIP(document) {
                        Text("VIP")
                            .font(.caption2.weight(.black))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color(red: 0.85, green: 0.65, blue: 0.13), in: Capsule())
                    }

                    if let listName = viewModel.customListName(for: document) {
                        Text(listName.uppercased())
                            .font(.caption2.weight(.black))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(.blue, in: Capsule())
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
