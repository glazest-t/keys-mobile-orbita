// Jetpack Compose. Заставка «Ключи»: точка обходит кольцо за 2400 мс.
@Composable
fun SplashOrbit(size: Dp = 120.dp) {
    val blue = Color(0xFF3A66F0)
    val t = rememberInfiniteTransition(label = "orbit")
    val angle by t.animateFloat(
        initialValue = 45f, targetValue = 405f,
        animationSpec = infiniteRepeatable(tween(2400, easing = CubicBezierEasing(.6f, .1f, .4f, .9f))),
        label = "angle"
    )
    Box(Modifier.fillMaxSize().background(blue), contentAlignment = Alignment.Center) {
        Canvas(Modifier.size(size)) {
            val s = this.size.minDimension
            val stroke = s * 0.1875f
            val r = s / 2 - stroke / 2
            drawCircle(Color.White, radius = r, style = Stroke(stroke))
            val rad = Math.toRadians(angle.toDouble() - 90)
            val c = Offset(center.x + r * cos(rad).toFloat(), center.y + r * sin(rad).toFloat())
            drawCircle(blue, radius = s / 6 + s * 0.06f, center = c)   // отступ = цвет фона
            drawCircle(Color.White, radius = s / 6, center = c)
        }
    }
}
