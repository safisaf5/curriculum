import SwiftUI
import UniformTypeIdentifiers

struct BlacklistView: View {
    @State private var viewModel = BlacklistViewModel()
    @State private var showScanSheet = false
    @State private var showImportSheet = false
    @State private var showQRScanner = false
    @State private var showFilePicker = false
    @State private var qrImportResult = ""
    @State private var importJSON = ""
    @State private var importResult = ""

    var body: some View {
        Group {
            if viewModel.filteredBlacklist.isEmpty {
                ContentUnavailableView("Aucun interdit", systemImage: "shield.checkered", description: Text("Les personnes interdites apparaîtront ici."))
            } else {
                List {
                    ForEach(viewModel.filteredBlacklist) { entry in
                        blacklistRow(entry)
                    }
                    .onDelete { indexSet in
                        for index in indexSet { viewModel.removeEntry(viewModel.filteredBlacklist[index]) }
                    }
                }
            }
        }
        .navigationTitle("Liste noire")
        .searchable(text: $viewModel.searchText, prompt: "Rechercher")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button { viewModel.showAddSheet = true } label: { Label("Ajouter manuellement", systemImage: "plus") }
                    Button { showScanSheet = true } label: { Label("Scanner une pièce", systemImage: "camera.viewfinder") }
                    Button { showImportSheet = true } label: { Label("Coller du JSON", systemImage: "doc.text") }
                    Button { showFilePicker = true } label: { Label("Importer un fichier", systemImage: "folder") }
                    Button { showQRScanner = true } label: { Label("Scanner QR Code", systemImage: "qrcode.viewfinder") }
                    Button { importFromClipboard() } label: { Label("Coller depuis presse-papier", systemImage: "clipboard") }
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $viewModel.showAddSheet) { addBlacklistSheet }
        .sheet(isPresented: $showScanSheet) {
            ListScannerView { document in
                StorageService.shared.addToBlacklist(from: document)
            }
        }
        .sheet(isPresented: $showImportSheet) { importSheet }
        .importSheets(storage: StorageService.shared, showQRScanner: $showQRScanner, showFilePicker: $showFilePicker, importResult: $qrImportResult)
    }

    private func importFromClipboard() {
        if let payload = ImportService.parseClipboard() {
            let r = ImportService.importPayload(payload, storage: StorageService.shared)
            qrImportResult = ImportService.formatImportMessage("\(r.count) entrées importées depuis le presse-papier", skipped: r.skipped)
        } else {
            qrImportResult = "Aucune donnée valide dans le presse-papier"
        }
    }

    private func blacklistRow(_ entry: BlacklistEntry) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            if let surname = entry.surname, let givenNames = entry.givenNames {
                Text("\(givenNames) \(surname)").font(.headline)
            }
            if !entry.documentNumber.isEmpty {
                Text(entry.documentNumber)
                    .font(entry.surname != nil ? .subheadline.monospaced() : .headline.monospaced())
                    .foregroundStyle(entry.surname != nil ? .secondary : .primary)
            } else if let birthdate = entry.birthdate {
                Text("Né(e) le \(birthdate.formatted(date: .abbreviated, time: .omitted))")
                    .font(.subheadline).foregroundStyle(.secondary)
            }
            if !entry.note.isEmpty { Text(entry.note).font(.subheadline).foregroundStyle(.secondary) }
            Text(entry.dateAdded.formatted(date: .abbreviated, time: .shortened)).font(.caption).foregroundStyle(.tertiary)
        }
        .padding(.vertical, 2)
    }

    private var addBlacklistSheet: some View {
        NavigationStack {
            Form {
                Picker("Mode", selection: $viewModel.entryMode) {
                    Text("N° de document").tag(BlacklistViewModel.EntryMode.documentNumber)
                    Text("Nom et date de naissance").tag(BlacklistViewModel.EntryMode.nameAndDOB)
                }.pickerStyle(.segmented)

                if viewModel.entryMode == .documentNumber {
                    Section("N° de document") {
                        TextField("ex: AB1234567", text: $viewModel.newDocumentNumber)
                            .textInputAutocapitalization(.characters).autocorrectionDisabled()
                    }
                } else {
                    Section("Identité") {
                        TextField("Nom", text: $viewModel.newSurname)
                        TextField("Prénom", text: $viewModel.newGivenNames)
                        DatePicker("Date de naissance", selection: $viewModel.newBirthdate, displayedComponents: .date)
                    }
                }
                Section("Note (optionnel)") { TextField("Raison de l'interdiction", text: $viewModel.newNote) }
            }
            .navigationTitle("Ajouter à la liste noire").navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Annuler") { viewModel.showAddSheet = false } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Ajouter") { viewModel.addEntry() }
                        .disabled(viewModel.entryMode == .documentNumber
                            ? viewModel.newDocumentNumber.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
                            : viewModel.newSurname.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || viewModel.newGivenNames.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
        }.presentationDetents([.medium, .large])
    }

    private var importSheet: some View {
        NavigationStack {
            Form {
                Section("Coller le JSON") {
                    TextEditor(text: $importJSON).frame(minHeight: 150).font(.caption.monospaced())
                }
                Section {
                    Button("Importer") { performImport() }
                        .disabled(importJSON.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                if !importResult.isEmpty { Section { Text(importResult).foregroundStyle(.secondary) } }
            }
            .navigationTitle("Importer JSON").navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Terminé") { showImportSheet = false } } }
        }.presentationDetents([.medium, .large])
    }

    private func performImport() {
        let storage = StorageService.shared
        let persons = ImportService.parseEntries(from: importJSON)
        var count = 0
        for person in persons {
            if let docNum = person.documentNumber, !docNum.isEmpty {
                storage.addToBlacklist(documentNumber: docNum, note: "")
                count += 1
            } else if let birthdate = ImportService.parseBirthdate(person.birthdate) {
                storage.addToBlacklist(surname: person.surname, givenNames: person.givenNames, birthdate: birthdate)
                count += 1
            }
        }
        let skipped = persons.count - count
        importResult = ImportService.formatImportMessage("\(count) entrées importées", skipped: skipped)
        importJSON = ""
    }
}
