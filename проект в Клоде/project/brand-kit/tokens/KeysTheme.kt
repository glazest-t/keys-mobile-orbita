package app.keys.design

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.animation.core.CubicBezierEasing

object K {
  val Cobalt = Color(0xFF2F5BFF); val CobaltTint = Color(0xFFEEF0FF); val Ink = Color(0xFF101320)
  val Slate = Color(0xFF5A6072); val Line = Color(0xFFE4E7EF); val Pearl = Color(0xFFF4F5FB)
  val Lavender = Color(0xFFB9B2FF); val Sky = Color(0xFF8FD8FF); val Sand = Color(0xFFF3E6D8); val Mint = Color(0xFFBFF0DE)
  val Success = Color(0xFF16865A); val Error = Color(0xFFE5484D)
  val RadiusButton = 14.dp; val RadiusCard = 22.dp; val RadiusHero = 28.dp; val RadiusNav = 32.dp
  val Screen = 16.dp; val Block = 12.dp; val Section = 24.dp
  val EaseOrbit = CubicBezierEasing(0.65f, 0f, 0.35f, 1f)
  val EaseArrive = CubicBezierEasing(0.2f, 0.8f, 0.2f, 1f)
  val EaseClick = CubicBezierEasing(0.34f, 1.56f, 0.64f, 1f)
}
