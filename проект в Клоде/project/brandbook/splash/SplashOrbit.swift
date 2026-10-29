import SwiftUI

/// Заставка «Ключи»: точка обходит кольцо за 2.4 с, easing (.6,.1,.4,.9).
struct SplashOrbit: View {
    var size: CGFloat = 120
    @State private var angle: Double = 45
    private let blue = Color(red: 0x3A/255, green: 0x66/255, blue: 0xF0/255)

    var body: some View {
        ZStack {
            blue.ignoresSafeArea()
            VStack(spacing: 26) {
                ZStack {
                    Circle().stroke(.white, lineWidth: size * 0.1875)
                        .frame(width: size - size * 0.1875, height: size - size * 0.1875)
                    ZStack {
                        Circle().fill(blue).frame(width: size / 3 + size * 0.12, height: size / 3 + size * 0.12) // отступ = цвет фона
                        Circle().fill(.white).frame(width: size / 3, height: size / 3)
                    }
                    .offset(y: -(size / 2 - size * 0.09375))
                    .rotationEffect(.degrees(angle))
                }
                .frame(width: size, height: size)
                Text("ключи").font(.custom("GolosText-SemiBold", size: 34)).kerning(-1.5).foregroundStyle(.white)
            }
        }
        .onAppear {
            withAnimation(.timingCurve(0.6, 0.1, 0.4, 0.9, duration: 2.4).repeatForever(autoreverses: false)) {
                angle = 405
            }
        }
    }
}
