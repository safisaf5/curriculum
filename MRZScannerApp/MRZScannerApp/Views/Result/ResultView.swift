import SwiftUI

struct ResultView: View {
    let document: ScannedDocument
    let onScanAgain: () -> Void
    @State private var storage = StorageService.shared

    private var isBlacklisted: Bool {
        storage.isBlacklisted(document.documentNumber)
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ageBadge
                if isBlacklisted { blacklistBanner }
                documentCard
                actionsSection
            }
            .padding()
        }
        .navigationTitle("Scan Result")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Scan Again", action: onScanAgain)
            }
        }
    }

    // MARK: - Age Badge

    private var ageBadge: some View {
        VStack(spacing: 4) {
            Text(document.isAdult ? "+18" : "-18")
                .font(.system(size: 56, weight: .black, design: .rounded))
                .foregroundStyle(document.isAdult ? .green : .red)

            Text("\(document.age) years old")
                .font(.title3.weight(.medium))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(document.isAdult ? Color.green.opacity(0.1) : Color.red.opacity(0.1))
        )
    }

    // MARK: - Blacklist Banner

    private var blacklistBanner: some View {
        HStack {
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(.white)
            Text("BLACKLISTED")
                .font(.headline)
                .foregroundStyle(.white)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.red, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Document Card

    private var documentCard: some View {
        VStack(spacing: 0) {
            fieldRow("Full Name", value: document.fullName)
            Divider()
            fieldRow("Document Type", value: document.documentType)
            Divider()
            fieldRow("Document Number", value: document.documentNumber)
            Divider()
            fieldRow("Issuing Country", value: document.issuingCountry)
            Divider()
            fieldRow("Nationality", value: document.nationality)
            Divider()
            fieldRow("Date of Birth", value: document.formattedBirthdate)
            Divider()
            fieldRow("Sex", value: document.sex)
            Divider()
            fieldRow("Expiry Date", value: document.formattedExpiryDate)
            if let opt = document.optionalData, !opt.isEmpty {
                Divider()
                fieldRow("Optional Data", value: opt)
            }
            if let opt2 = document.optionalData2, !opt2.isEmpty {
                Divider()
                fieldRow("Optional Data 2", value: opt2)
            }
        }
        .background(Color(.secondarySystemBackground), in: RoundedRectangle(cornerRadius: 12))
    }

    private func fieldRow(_ label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.medium))
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
    }

    // MARK: - Actions

    private var actionsSection: some View {
        VStack(spacing: 12) {
            if !isBlacklisted {
                Button {
                    storage.addToBlacklist(documentNumber: document.documentNumber)
                } label: {
                    Label("Add to Blacklist", systemImage: "shield.slash")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.bordered)
                .tint(.red)
            }

            ShareLink(
                item: ExportService.exportAsJSONString(document),
                subject: Text("MRZ Scan Result"),
                message: Text("Scanned document data")
            ) {
                Label("Export JSON", systemImage: "square.and.arrow.up")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
        }
    }
}
