import Foundation

// MARK: - Date Formatting

private let spanishLocale = Locale(identifier: "es_ES")

func todayDay() -> String {
    let formatter = DateFormatter()
    formatter.locale = spanishLocale
    formatter.dateFormat = "dd"
    return formatter.string(from: .now)
}

func todayWeekday() -> String {
    let formatter = DateFormatter()
    formatter.locale = spanishLocale
    formatter.dateFormat = "EEEE"
    return formatter.string(from: .now).capitalized
}

// MARK: - Double Formatting

extension Double {

    // Formatea sin decimales si es entero, con un decimal si no.
    // Ejemplo: 5.0 -> "5", 3.5 -> "3.5"
    var formatted: String {
        truncatingRemainder(dividingBy: 1) == 0
            ? String(format: "%.0f", self)
            : String(format: "%.1f", self)
    }

    func formatted(unitName: String?) -> String {
        guard let unitName, !unitName.isEmpty else { return formatted }
        return "\(formatted) \(unitName)"
    }
}
