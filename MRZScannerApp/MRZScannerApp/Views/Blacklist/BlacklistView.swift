import SwiftUI

struct BlacklistView: View {
    @State private var viewModel = BlacklistViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.filteredBlacklist.isEmpty {
                    ContentUnavailableView(
                        "No Blacklisted Documents",
                        systemImage: "shield.checkered",
                        description: Text("Blacklisted document numbers will appear here.")
                    )
                } else {
                    List {
                        ForEach(viewModel.filteredBlacklist) { entry in
                            blacklistRow(entry)
                        }
                        .onDelete { indexSet in
                            for index in indexSet {
                                viewModel.removeEntry(viewModel.filteredBlacklist[index])
                            }
                        }
                    }
                }
            }
            .navigationTitle("Blacklist")
            .searchable(text: $viewModel.searchText, prompt: "Search by document number")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        viewModel.showAddSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $viewModel.showAddSheet) {
                addBlacklistSheet
            }
        }
    }

    private func blacklistRow(_ entry: BlacklistEntry) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(entry.documentNumber)
                .font(.headline.monospaced())
            if !entry.note.isEmpty {
                Text(entry.note)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Text(entry.dateAdded.formatted(date: .abbreviated, time: .shortened))
                .font(.caption)
                .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 2)
    }

    private var addBlacklistSheet: some View {
        NavigationStack {
            Form {
                Section("Document Number") {
                    TextField("e.g. AB1234567", text: $viewModel.newDocumentNumber)
                        .textInputAutocapitalization(.characters)
                        .autocorrectionDisabled()
                }
                Section("Note (optional)") {
                    TextField("Reason for blacklisting", text: $viewModel.newNote)
                }
            }
            .navigationTitle("Add to Blacklist")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        viewModel.showAddSheet = false
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add") {
                        viewModel.addEntry()
                    }
                    .disabled(viewModel.newDocumentNumber.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
    }
}
