import SwiftUI

enum K {
  enum Color {
    static let cobalt = SwiftUI.Color(hex: 0x2F5BFF)
    static let cobaltTint = SwiftUI.Color(hex: 0xEEF0FF)
    static let ink = SwiftUI.Color(hex: 0x101320)
    static let slate = SwiftUI.Color(hex: 0x5A6072)
    static let line = SwiftUI.Color(hex: 0xE4E7EF)
    static let pearl = SwiftUI.Color(hex: 0xF4F5FB)
    static let lavender = SwiftUI.Color(hex: 0xB9B2FF)
    static let sky = SwiftUI.Color(hex: 0x8FD8FF)
    static let sand = SwiftUI.Color(hex: 0xF3E6D8)
    static let mint = SwiftUI.Color(hex: 0xBFF0DE)
    static let success = SwiftUI.Color(hex: 0x16865A)
    static let error = SwiftUI.Color(hex: 0xE5484D)
  }
  enum Radius { static let button: CGFloat = 14; static let card: CGFloat = 22; static let hero: CGFloat = 28; static let nav: CGFloat = 32 }
  enum Space { static let screen: CGFloat = 16; static let block: CGFloat = 12; static let section: CGFloat = 24 }
  enum Motion {
    static let orbit = Animation.timingCurve(0.65, 0, 0.35, 1, duration: 0.7)
    static let arrive = Animation.timingCurve(0.2, 0.8, 0.2, 1, duration: 0.4)
    static let click = Animation.spring(response: 0.38, dampingFraction: 0.62)
  }
  enum Font {
    static func display(_ s: CGFloat) -> SwiftUI.Font { .custom("Unbounded-Medium", size: s) }
    static func text(_ s: CGFloat, medium: Bool = false) -> SwiftUI.Font { .custom(medium ? "Onest-Medium" : "Onest-Regular", size: s) }
  }
}

extension Color { init(hex: UInt32) { self.init(red: Double((hex >> 16) & 0xFF)/255, green: Double((hex >> 8) & 0xFF)/255, blue: Double(hex & 0xFF)/255) } }
