import type {PreferenceIllustrationId} from './preferenceIllustrations';

/** Measured alpha bounds of the shared light/dark 3D artwork, 1536 × 1024 sheets. */
export const contrastPreferenceRects={
 "cleanliness": [
  82,
  16,
  258,
  226
 ],
 "quiet": [
  420,
  11,
  299,
  241
 ],
 "wifi": [
  823,
  32,
  270,
  213
 ],
 "location": [
  1178,
  9,
  283,
  237
 ],
 "kids": [
  68,
  271,
  282,
  224
 ],
 "pool": [
  411,
  267,
  315,
  230
 ],
 "breakfast": [
  793,
  272,
  321,
  221
 ],
 "air": [
  1170,
  286,
  298,
  210
 ],
 "entertainment": [
  61,
  513,
  299,
  222
 ],
 "design": [
  430,
  508,
  279,
  226
 ],
 "coffee": [
  798,
  520,
  294,
  220
 ],
 "attractions": [
  1177,
  510,
  282,
  227
 ],
 "spa": [
  61,
  752,
  267,
  254
 ],
 "view": [
  428,
  751,
  272,
  253
 ],
 "restaurant": [
  797,
  754,
  268,
  261
 ],
 "historic": [
  1164,
  744,
  309,
  261
 ],
 "security": [
  123,
  26,
  206,
  226
 ],
 "solo": [
  437,
  23,
  245,
  231
 ],
 "sport": [
  799,
  57,
  294,
  186
 ],
 "parking": [
  1209,
  33,
  204,
  219
 ],
 "mountains": [
  81,
  283,
  274,
  203
 ],
 "rental": [
  455,
  274,
  249,
  211
 ],
 "nature": [
  820,
  277,
  235,
  209
 ],
 "water": [
  1166,
  288,
  293,
  195
 ],
 "park": [
  74,
  507,
  268,
  231
 ],
 "kitchen": [
  443,
  512,
  276,
  227
 ],
 "laundry": [
  830,
  513,
  222,
  223
 ],
 "sauna": [
  1190,
  496,
  213,
  248
 ],
 "bar": [
  100,
  765,
  229,
  234
 ],
 "adults": [
  450,
  774,
  244,
  225
 ],
 "beach": [
  811,
  762,
  262,
  239
 ],
 "work": [
  1157,
  766,
  306,
  233
 ]
} as const satisfies Record<PreferenceIllustrationId,readonly [number,number,number,number]>;
