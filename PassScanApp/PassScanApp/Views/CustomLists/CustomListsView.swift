import SwiftUI
import UniformTypeIdentifiers

struct CustomListsView: View {
    @State private var storage = StorageService.shared
    @State private var showCreateSheet = false
    @State private var showQRScanner = false
    @State private var showFilePicker = false
    @State private var qrImportResult = ""
    @State private var newListName = ""
    @State private var newListColor = Color.blue

    var body: some View {
        Group {
            if storage.customLists.isEmpty {
                ContentUnavailableView("Aucune liste", systemImage: "list.bullet.rectangle", description: Text("Créez des listes : Staff, Presse, Sponsors..."))
            } else {
                List {
                    ForEach(storage.customLists) { list in
                        NavigationLink {
                            CustomListDetailView(list: list)
                        } label: {
                            HStack(spacing: 12) {
                                Circle().fill(list.color).frame(width: 14, height: 14)
                                VStack(alignment: .leading) {
                                    Text(list.name).font(.headline)
                                    Text("\(storage.entriesForList(list).count) entrées")
                                        .font(.caption).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                    .onDelete { indexSet in
                        for i in indexSet { storage.removeCustomList(storage.customLists[i]) }
                    }
                }
            }
        }
        .navigationTitle("Listes personnalisées")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button { showCreateSheet = true } label: { Label("Nouvelle liste", systemImage: "plus") }
                    Button { showFilePicker = true } label: { Label("Importer un fichier", systemImage: "folder") }
                    Button { showQRScanner = true } label: { Label("Scanner QR Code", systemImage: "qrcode.viewfinder") }
                    Button { importFromClipboard() } label: { Label("Coller depuis presse-papier", systemImage: "clipboard") }
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .importSheets(storage: storage, messagePrefix: "list", showQRScanner: $showQRScanner, showFilePicker: $showFilePicker, importResult: $qrImportResult)
        .sheet(isPresented: $showCreateSheet) {
            NavigationStack {
                Form {
                    Section("Nom de la liste") {
                        TextField("ex: Staff, Presse, Sponsors", text: $newListName)
                    }
                    Section("Couleur") {
                        ColorPicker("Couleur", selection: $newListColor)
                    }
                }
                .navigationTitle("Nouvelle liste")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Annuler") { showCreateSheet = false }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Créer") {
                            storage.addCustomList(name: newListName, colorHex: newListColor.toHex())
                            newListName = ""
                            showCreateSheet = false
                        }
                        .disabled(newListName.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                }
            }
            .presentationDetents([.medium])
        }
    }

    private func importFromClipboard() {
        if let payload = ImportService.parseClipboard() {
            let r = ImportService.importPayload(payload, storage: storage)
            qrImportResult = ImportService.formatImportMessage("\(r.count) entrées importées depuis le presse-papier", skipped: r.skipped)
        } else {
            qrImportResult = "Aucune donnée valide dans le presse-papier"
        }
    }
}

struct CustomListDetailView: View {
    let list: CustomList
    @State private var storage = StorageService.shared
    @State private var showAddSheet = false
    @State private var showScanSheet = false
    @State private var showImportSheet = false
    @State private var importJSON = ""
    @State private var importResult = ""
    @State private var newDocNumber = ""
    @State private var newSurname = ""
    @State private var newGivenNames = ""
    @State private var newBirthdate = Date()
    @State private var newNote = ""
    @State private var entryMode = EntryMode.documentNumber

    enum EntryMode { case documentNumber, nameAndDOB }

    private var entries: [CustomListEntry] {
        storage.entriesForList(list)
    }

    var body: some View {
        Group {
            if entries.isEmpty {
                ContentUnavailableView("Aucune entrée", systemImage: "person.slash", description: Text("Ajoutez des personnes à cette liste."))
            } else {
                List {
                    ForEach(entries) { entry in
                        VStack(alignment: .leading, spacing: 4) {
                            if let surname = entry.surname, let givenNames = entry.givenNames {
                                Text("\(givenNames) \(surname)").font(.headline)
                            }
                            if !entry.documentNumber.isEmpty {
                                Text(entry.documentNumber).font(.subheadline.monospaced()).foregroundStyle(.secondary)
                            }
                            if !entry.note.isEmpty {
                                Text(entry.note).font(.subheadline).foregroundStyle(.secondary)
                            }
                        }
                    }
                    .onDelete { indexSet in
                        for i in indexSet { storage.removeCustomListEntry(entries[i]) }
                    }
                }
            }
        }
        .navigationTitle(list.name)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Button { showAddSheet = true } label: { Label("Ajouter manuellement", systemImage: "plus") }
                    Button { showScanSheet = true } label: { Label("Scanner une pièce", systemImage: "camera.viewfinder") }
                    Button { showImportSheet = true } label: { Label("Importer JSON", systemImage: "doc.text") }
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showScanSheet) {
            ListScannerView { document in
                storage.addCustomListEntry(listID: list.id, documentNumber: document.documentNumber, note: "")
            }
        }
        .sheet(isPresented: $showImportSheet) {
            NavigationStack {
                Form {
                    Section("Coller le JSON") {
                        TextEditor(text: $importJSON).frame(minHeight: 150).font(.caption.monospaced())
                    }
                    Section {
                        Button("Importer") {
                            let persons = ImportService.parseEntries(from: importJSON)
                            var count = 0
                            for person in persons {
                                if let docNum = person.documentNumber, !docNum.isEmpty {
                                    storage.addCustomListEntry(listID: list.id, documentNumber: docNum, note: "")
                                    count += 1
                                } else if let birthdate = ImportService.parseBirthdate(person.birthdate) {
                                    storage.addCustomListEntry(listID: list.id, surname: person.surname, givenNames: person.givenNames, birthdate: birthdate)
                                    count += 1
                                }
                            }
                            let skipped = persons.count - count
                            importResult = ImportService.formatImportMessage("\(count) entrées importées", skipped: skipped)
                            importJSON = ""
                        }
                        .disabled(importJSON.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                    if !importResult.isEmpty { Section { Text(importResult).foregroundStyle(.secondary) } }
                }
                .navigationTitle("Importer JSON").navigationBarTitleDisplayMode(.inline)
                .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Terminé") { showImportSheet = false } } }
            }.presentationDetents([.medium, .large])
        }
        .sheet(isPresented: $showAddSheet) {
            NavigationStack {
                Form {
                    Picker("Entry Mode", selection: $entryMode) {
                        Text("N° de document").tag(EntryMode.documentNumber)
                        Text("Nom et date de naissance").tag(EntryMode.nameAndDOB)
                    }
                    .pickerStyle(.segmented)

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
                .navigationTitle("Ajouter à \(list.name)")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Annuler") { showAddSheet = false } }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Ajouter") {
                            if entryMode == .documentNumber {
                                storage.addCustomListEntry(listID: list.id, documentNumber: newDocNumber, note: newNote)
                            } else {
                                storage.addCustomListEntry(listID: list.id, surname: newSurname, givenNames: newGivenNames, birthdate: newBirthdate, note: newNote)
                            }
                            newDocNumber = ""; newSurname = ""; newGivenNames = ""; newNote = ""
                            showAddSheet = false
                        }
                        .disabled(entryMode == .documentNumber ? newDocNumber.trimmed.isEmpty : newSurname.trimmed.isEmpty || newGivenNames.trimmed.isEmpty)
                    }
                }
            }
            .presentationDetents([.medium])
        }
    }
}

private extension String {
    var trimmed: String { trimmingCharacters(in: .whitespaces) }
}

extension Color {
    func toHex() -> String {
        guard let rgb = UIColor(self).cgColor.converted(to: CGColorSpaceCreateDeviceRGB(), intent: .defaultIntent, options: nil),
              let components = rgb.components, components.count >= 3 else { return "0000FF" }
        let r = Int(components[0] * 255)
        let g = Int(components[1] * 255)
        let b = Int(components[2] * 255)
        return String(format: "%02X%02X%02X", r, g, b)
    }
}
