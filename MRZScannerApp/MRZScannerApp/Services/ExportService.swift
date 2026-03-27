import Foundation

enum ExportService {
    private static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()

    static func exportAsJSON(_ document: ScannedDocument) -> Data {
        (try? encoder.encode(document)) ?? Data()
    }

    static func exportAllAsJSON(_ documents: [ScannedDocument]) -> Data {
        (try? encoder.encode(documents)) ?? Data()
    }

    static func exportAsJSONString(_ document: ScannedDocument) -> String {
        String(data: exportAsJSON(document), encoding: .utf8) ?? "{}"
    }

    static func exportAllAsJSONString(_ documents: [ScannedDocument]) -> String {
        String(data: exportAllAsJSON(documents), encoding: .utf8) ?? "[]"
    }
}
