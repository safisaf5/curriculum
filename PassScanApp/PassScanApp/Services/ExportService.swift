import Foundation
import UIKit

enum ExportService {
    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    // MARK: - JSON

    static func exportAsJSON(_ document: ScannedDocument) throws -> Data {
        try encoder.encode(document)
    }

    static func exportAllAsJSON(_ documents: [ScannedDocument]) throws -> Data {
        try encoder.encode(documents)
    }

    static func exportAsJSONString(_ document: ScannedDocument) throws -> String {
        String(data: try exportAsJSON(document), encoding: .utf8) ?? "{}"
    }

    static func exportAllAsJSONString(_ documents: [ScannedDocument]) throws -> String {
        String(data: try exportAllAsJSON(documents), encoding: .utf8) ?? "[]"
    }

    // MARK: - Web Link

    static func generateWebListURL(payload: Data, baseURL: String = "https://passscan.netlify.app/list") -> String? {
        let base64 = payload.base64EncodedString()
        guard base64.count <= 2000 else { return nil }
        return "\(baseURL)#\(base64)"
    }

    // MARK: - CSV

    static func exportAsCSV(_ documents: [ScannedDocument]) -> String {
        var csv = "Full Name,Surname,Given Names,Date of Birth,Age,Adult,Sex,Nationality,Document Type,Document Number,Issuing Country,Expiry Date,Scan Date\n"

        for doc in documents {
            let fields: [String] = [
                escapeCSV(doc.fullName),
                escapeCSV(doc.surname),
                escapeCSV(doc.givenNames),
                escapeCSV(doc.formattedBirthdate),
                "\(doc.age)",
                doc.isAdult ? "Yes" : "No",
                escapeCSV(doc.sex),
                escapeCSV(doc.nationality),
                escapeCSV(doc.documentType),
                escapeCSV(doc.documentNumber),
                escapeCSV(doc.issuingCountry),
                escapeCSV(doc.formattedExpiryDate),
                escapeCSV(doc.formattedScanDate),
            ]
            csv += fields.joined(separator: ",") + "\n"
        }

        return csv
    }

    private static func escapeCSV(_ value: String) -> String {
        if value.contains(",") || value.contains("\"") || value.contains("\n") {
            return "\"\(value.replacingOccurrences(of: "\"", with: "\"\""))\""
        }
        return value
    }

    // MARK: - PDF Report

    static func exportSessionReport(
        sessionName: String,
        startDate: Date,
        endDate: Date?,
        maxCapacity: Int,
        totalEntries: Int,
        exitCount: Int,
        minorsDetected: Int,
        duplicatesBlocked: Int,
        blacklistHits: Int,
        expiredBlocked: Int,
        entries: [ScannedDocument]
    ) -> Data {
        let pageWidth: CGFloat = 612
        let pageHeight: CGFloat = 792
        let margin: CGFloat = 50
        let contentWidth = pageWidth - margin * 2

        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight))

        return renderer.pdfData { context in
            context.beginPage()
            var yPos: CGFloat = margin

            // Title
            let titleAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 24),
                .foregroundColor: UIColor.black,
            ]
            let title = "PassScan — Session Report"
            (title as NSString).draw(at: CGPoint(x: margin, y: yPos), withAttributes: titleAttrs)
            yPos += 36

            // Session info
            let infoAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 12),
                .foregroundColor: UIColor.darkGray,
            ]
            let boldAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 12),
                .foregroundColor: UIColor.black,
            ]

            func drawLine(_ label: String, _ value: String) {
                (label as NSString).draw(at: CGPoint(x: margin, y: yPos), withAttributes: infoAttrs)
                (value as NSString).draw(at: CGPoint(x: margin + 160, y: yPos), withAttributes: boldAttrs)
                yPos += 18
            }

            drawLine("Session :", sessionName)
            drawLine("Début :", startDate.formatted(date: .abbreviated, time: .shortened))
            if let endDate {
                drawLine("Fin :", endDate.formatted(date: .abbreviated, time: .shortened))
            }
            drawLine("Capacité max :", "\(maxCapacity)")
            yPos += 10

            // Stats
            let sectionAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 16),
                .foregroundColor: UIColor.black,
            ]
            ("Statistiques" as NSString).draw(at: CGPoint(x: margin, y: yPos), withAttributes: sectionAttrs)
            yPos += 24

            drawLine("Total entrées :", "\(totalEntries)")
            drawLine("Sorties :", "\(exitCount)")
            drawLine("Doublons bloqués :", "\(duplicatesBlocked)")
            drawLine("Mineurs détectés :", "\(minorsDetected)")
            drawLine("Interdits détectés :", "\(blacklistHits)")
            drawLine("Documents expirés :", "\(expiredBlocked)")

            let totalRefusals = duplicatesBlocked + blacklistHits + expiredBlocked
            let totalAttempts = totalEntries + totalRefusals
            let refusalRate = totalAttempts > 0 ? Int(Double(totalRefusals) / Double(totalAttempts) * 100) : 0
            drawLine("Taux de refus :", "\(refusalRate)%")
            yPos += 16

            // Entry table header
            if !entries.isEmpty {
                ("Entrées" as NSString).draw(at: CGPoint(x: margin, y: yPos), withAttributes: sectionAttrs)
                yPos += 24

                let headerAttrs: [NSAttributedString.Key: Any] = [
                    .font: UIFont.boldSystemFont(ofSize: 10),
                    .foregroundColor: UIColor.black,
                ]
                let cellAttrs: [NSAttributedString.Key: Any] = [
                    .font: UIFont.systemFont(ofSize: 10),
                    .foregroundColor: UIColor.black,
                ]

                let colWidths: [CGFloat] = [contentWidth * 0.30, contentWidth * 0.15, contentWidth * 0.10, contentWidth * 0.20, contentWidth * 0.25]
                let headers = ["Nom", "N° Document", "Âge", "Nationalité", "Date scan"]

                var xPos = margin
                for (i, header) in headers.enumerated() {
                    (header as NSString).draw(at: CGPoint(x: xPos, y: yPos), withAttributes: headerAttrs)
                    xPos += colWidths[i]
                }
                yPos += 16

                // Separator line
                let linePath = UIBezierPath()
                linePath.move(to: CGPoint(x: margin, y: yPos))
                linePath.addLine(to: CGPoint(x: margin + contentWidth, y: yPos))
                UIColor.lightGray.setStroke()
                linePath.lineWidth = 0.5
                linePath.stroke()
                yPos += 4

                for doc in entries {
                    if yPos > pageHeight - margin - 20 {
                        context.beginPage()
                        yPos = margin
                    }

                    xPos = margin
                    let values = [
                        doc.fullName,
                        doc.documentNumber,
                        "\(doc.age)",
                        doc.nationality,
                        doc.formattedScanDate,
                    ]
                    for (i, value) in values.enumerated() {
                        let truncated = String(value.prefix(Int(colWidths[i] / 6)))
                        (truncated as NSString).draw(at: CGPoint(x: xPos, y: yPos), withAttributes: cellAttrs)
                        xPos += colWidths[i]
                    }
                    yPos += 14
                }
            }

            // Footer
            yPos = pageHeight - margin
            let footerAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 8),
                .foregroundColor: UIColor.gray,
            ]
            let footer = "Généré par PassScan — \(Date().formatted(date: .abbreviated, time: .shortened))"
            (footer as NSString).draw(at: CGPoint(x: margin, y: yPos), withAttributes: footerAttrs)
        }
    }
}
