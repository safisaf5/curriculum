import Foundation

enum AgeCalculator {
    static func age(from birthdate: Date) -> Int {
        Calendar.current.dateComponents([.year], from: birthdate, to: Date()).year ?? 0
    }

    static func isAdult(birthdate: Date) -> Bool {
        age(from: birthdate) >= 18
    }
}
