import SwiftUI

struct SessionCreationSheet: View {
    enum Field { case name, capacity }

    @Environment(\.dismiss) private var dismiss
    @State private var sessionName = ""
    @State private var capacityText = ""
    @State private var scheduledStart = Date()
    @State private var scheduledEnd = Date()
    @State private var hasScheduledDates = false
    @State private var isGuestOnly = false
    @State private var selectedGuestListID: UUID?
    @FocusState private var focusedField: Field?
    private let store = SessionStore.shared
    private let storage = StorageService.shared

    private let quickCapacities = [100, 200, 300, 500, 1000]

    private var capacity: Int {
        Int(capacityText) ?? 0
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Informations") {
                    TextField("Nom de la session (ex: Soirée du samedi)", text: $sessionName)
                        .focused($focusedField, equals: .name)
                        .submitLabel(.next)
                        .onSubmit { focusedField = .capacity }
                }

                Section("Capacité maximale") {
                    TextField("Entrer un nombre", text: $capacityText)
                        .keyboardType(.numberPad)
                        .focused($focusedField, equals: .capacity)
                        .submitLabel(.done)
                        .onSubmit { focusedField = nil }

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(quickCapacities, id: \.self) { value in
                                Button {
                                    capacityText = "\(value)"
                                } label: {
                                    Text("\(value)")
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundStyle(capacity == value ? .white : .primary)
                                        .padding(.horizontal, 16)
                                        .padding(.vertical, 8)
                                        .background(
                                            capacity == value ? Color.blue : Color(.tertiarySystemFill),
                                            in: Capsule()
                                        )
                                }
                            }
                        }
                    }
                }

                Section("Mode invités uniquement") {
                    Toggle("Liste d'invités uniquement", isOn: $isGuestOnly)

                    if isGuestOnly {
                        if storage.customLists.isEmpty {
                            Text("Créez d'abord une liste dans Plus > Listes personnalisées")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        } else {
                            Picker("Liste d'invités", selection: $selectedGuestListID) {
                                Text("Choisir une liste").tag(nil as UUID?)
                                ForEach(storage.customLists) { list in
                                    HStack {
                                        Circle().fill(list.color).frame(width: 10, height: 10)
                                        Text("\(list.name) (\(storage.entriesForList(list).count))")
                                    }
                                    .tag(list.id as UUID?)
                                }
                            }
                        }
                    }
                }

                Section("Horaires (optionnel)") {
                    Toggle("Définir les horaires", isOn: $hasScheduledDates)

                    if hasScheduledDates {
                        DatePicker("Début", selection: $scheduledStart)
                        DatePicker("Fin", selection: $scheduledEnd)
                    }
                }

                Section {
                    Button {
                        store.startSession(
                            name: sessionName.isEmpty ? "Session" : sessionName,
                            maxCapacity: max(1, capacity),
                            scheduledStart: hasScheduledDates ? scheduledStart : nil,
                            scheduledEnd: hasScheduledDates ? scheduledEnd : nil,
                            guestListID: isGuestOnly ? selectedGuestListID : nil
                        )
                        dismiss()
                    } label: {
                        Label("Démarrer la session", systemImage: "play.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(capacity < 1 || (isGuestOnly && selectedGuestListID == nil))
                }
            }
            .navigationTitle("Nouvelle session")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annuler") { dismiss() }
                }
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Terminé") { focusedField = nil }
                }
            }
        }
    }
}
