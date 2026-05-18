import SwiftUI
import UniformTypeIdentifiers

struct VIPListView: View {
    @State private var storage = StorageService.shared
    @State private var showAddSheet = false
    @State private var showScanSheet = false
    @State private var showImportSheet = false
    @State private var showQRScanner = false
    @State private var showFilePicker = false
    @State private var qrImportResult = ""
    @State private var searchText = ""
    @State private var newDocNumber = ""
    @State private var newSurname = ""
    @State private var newGivenNames = ""
    @State private var newBirthdate = Date()
    @State private var newNote = ""
    @State private var entryMode = EntryMode.documentNumber
    @State private var importJSON = ""
    @State private var importResult = ""

    enum EntryMode { case documentNumber, nameAndDOB }

    private var filteredList: [VIPEntry] {
        if searchText.isEmpty { return storage.vipList }
        let q = searchText.lowercased()
        return storage.vipList.filter {
            $0.documentNumber.lowercased().contains(q) ||
            ($0.surname ?? "").lowercased().contains(q) ||
            ($0.givenNames ?? "").lowercased().contains(q) ||
            $0.note.lowercased().contains(q)
        }
    }

    var body: some View {
        Group {
            if filteredList.isEmpty {
                ContentUnavailableView("Aucun VIP", systemImage: "star", description: Text("Les VIP apparaîtront ici."))
            } else {
                List {
                    ForEach(filteredList) { entry in
                        entryRow(entry)
                    }
                    .onDelete { indexSet in
                        for i in indexSet { storage.removeFromVIPList(filteredList[i]) }
                    }
                }
            }
        }
        .navigationTitle("Liste VIP")
        .searchable(text: $searchText, prompt: "Rechercher")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button { showAddSheet = true } label: { Label("Ajouter manuellement", systemImage: "plus") }
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
        .sheet(isPresented: $showAddSheet) { addSheet }
        .sheet(isPresented: $showScanSheet) {
            ListScannerView { document in
                storage.addToVIPList(documentNumber: document.documentNumber, note: "")
            }
        }
        .sheet(isPresented: $showImportSheet) { importSheet }
        .importSheets(storage: storage, showQRScanner: $showQRScanner, showFilePicker: $showFilePicker, importResult: $qrImportResult)
    }

    private func importFromClipboard() {
        if let payload = ImportService.parseClipboard() {
            let r = ImportService.importPayload(payload, storage: storage)
            qrImportResult = ImportService.formatImportMessage("\(r.count) entrées importées depuis le presse-papier", skipped: r.skipped)
        } else {
            qrImportResult = "Aucune donnée valide dans le presse-papier"
        }
    }

    private func entryRow(_ entry: VIPEntry) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            if let surname = entry.surname, let givenNames = entry.givenNames {
                Text("\(givenNames) \(surname)").font(.headline)
            }
            if !entry.documentNumber.isEmpty {
                Text(entry.documentNumber)
                    .font(entry.surname != nil ? .subheadline.monospaced() : .headline.monospaced())
                    .foregroundStyle(entry.surname != nil ? .secondary : .primary)
            }
            if !entry.note.isEmpty {
                Text(entry.note).font(.subheadline).foregroundStyle(.secondary)
            }
            Text(entry.dateAdded.formatted(date: .abbreviated, time: .shortened))
                .font(.caption).foregroundStyle(.tertiary)
        }
        .padding(.vertical, 2)
    }

    private var addSheet: some View {
        NavigationStack {
            Form {
                Picker("Mode", selection: $entryMode) {
                    Text("N° de document").tag(EntryMode.documentNumber)
                    Text("Nom et date de naissance").tag(EntryMode.nameAndDOB)
                }.pickerStyle(.segmented)

                if entryMode == .documentNumber {
                    Section("N° de document") {
                        TextField("ex: AB1234567", text: $newDocNumber)
                            .textInputAutocapitalization(.characters).autocorrectionDisabled()
                    }
                } else {
                    Section("Identité") {
                        TextField("Nom", text: $newSurname)
                        TextField("Prénom", text: $newGivenNames)
                        DatePicker("Date de naissance", selection: $newBirthdate, displayedComponents: .date)
                    }
                }
                Section("Note (optionnel)") { TextField("Note", text: $newNote) }
            }
            .navigationTitle("Ajouter un VIP")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Annuler") { showAddSheet = false } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Ajouter") { addEntry() }
                        .disabled(entryMode == .documentNumber
                            ? newDocNumber.trimmingCharacters(in: .whitespaces).isEmpty
                            : newSurname.trimmingCharacters(in: .whitespaces).isEmpty || newGivenNames.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }.presentationDetents([.medium])
    }

    private var importSheet: some View {
        NavigationStack {
            Form {
                Section("Coller le JSON") {
                    TextEditor(text: $importJSON)
                        .frame(minHeight: 150)
                        .font(.caption.monospaced())
                }
                Section {
                    Button("Importer") { performImport() }
                        .disabled(importJSON.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
                if !importResult.isEmpty {
                    Section { Text(importResult).foregroundStyle(.secondary) }
                }
            }
            .navigationTitle("Importer JSON")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Terminé") { showImportSheet = false } }
            }
        }.presentationDetents([.medium, .large])
    }

    private func addEntry() {
        if entryMode == .documentNumber {
            storage.addToVIPList(documentNumber: newDocNumber.trimmingCharacters(in: .whitespaces), note: newNote)
        } else {
            storage.addToVIPList(surname: newSurname.trimmingCharacters(in: .whitespaces), givenNames: newGivenNames.trimmingCharacters(in: .whitespaces), birthdate: newBirthdate, note: newNote)
        }
        newDocNumber = ""; newSurname = ""; newGivenNames = ""; newNote = ""; newBirthdate = Date()
        showAddSheet = false
    }

    private func performImport() {
        let persons = ImportService.parseEntries(from: importJSON)
        var count = 0
        for person in persons {
            if let docNum = person.documentNumber, !docNum.isEmpty {
                storage.addToVIPList(documentNumber: docNum, note: "")
                count += 1
            } else if let birthdate = ImportService.parseBirthdate(person.birthdate) {
                storage.addToVIPList(surname: person.surname, givenNames: person.givenNames, birthdate: birthdate)
                count += 1
            }
        }
        let skipped = persons.count - count
        importResult = ImportService.formatImportMessage("\(count) entrées importées", skipped: skipped)
        importJSON = ""
    }
}
