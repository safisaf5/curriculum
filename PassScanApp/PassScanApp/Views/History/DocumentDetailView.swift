import SwiftUI

struct DocumentDetailView: View {
    let document: ScannedDocument
    @State private var storage = StorageService.shared
    @State private var showBlacklistConfirmation = false
    @State private var showBlacklistedAlert = false

    private var isBlacklisted: Bool {
        storage.blacklistMatch(for: document) != nil
    }

    var body: some View {
        List {
            Section {
                VStack(spacing: 4) {
                    Text(document.isAdult ? "+18" : "-18")
                        .font(.system(size: 60, weight: .black, design: .rounded))
                        .foregroundStyle(document.isAdult ? .green : .red)
                    Text("\(document.age) ans")
                        .font(.title3.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .listRowBackground(Color.clear)
            }

            if isBlacklisted {
                Section {
                    HStack {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .foregroundStyle(.white)
                        Text("INTERDIT")
                            .font(.headline)
                            .foregroundStyle(.white)
                    }
                    .frame(maxWidth: .infinity)
                    .listRowBackground(Color.red)
                }
            }

            Section("Informations personnelles") {
                fieldRow("Nom complet", document.fullName)
                fieldRow("Date de naissance", document.formattedBirthdate)
                fieldRow("Sexe", document.sex)
                fieldRow("Nationalité", document.nationality)
            }

            Section("Document") {
                fieldRow("Type", document.documentType)
                fieldRow("Numéro", document.documentNumber)
                fieldRow("Pays", document.issuingCountry)
                fieldRow("Expiration", document.formattedExpiryDate)
            }

            Section("Scan") {
                fieldRow("Scanné", document.formattedScanDate)
            }

            Section {
                if !isBlacklisted {
                    Button {
                        showBlacklistConfirmation = true
                    } label: {
                        Label("Ajouter à la liste noire", systemImage: "shield.slash")
                            .frame(maxWidth: .infinity)
                    }
                    .tint(.red)
                }
            }
        }
        .navigationTitle("Détails du document")
        .navigationBarTitleDisplayMode(.inline)
        .confirmationDialog(
            "Ajouter \(document.fullName) à la liste noire ?",
            isPresented: $showBlacklistConfirmation,
            titleVisibility: .visible
        ) {
            Button("Ajouter à la liste noire", role: .destructive) {
                storage.addToBlacklist(from: document)
                FeedbackService.successFeedback()
                showBlacklistedAlert = true
            }
        } message: {
            Text("Cette personne sera bloquée lors des prochains scans.")
        }
        .alert("Ajouté à la liste noire", isPresented: $showBlacklistedAlert) {
            Button("OK", role: .cancel) {}
        }
    }

    private func fieldRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.medium)
        }
    }
}
