// Approved set 1: source artwork is kept intact; rectangles exclude review captions.
export const preferenceIllustrations = [
 {
  "id": "cleanliness",
  "label": "Чистота",
  "sheet": 1,
  "rect": [
   96,
   22,
   220,
   180
  ]
 },
 {
  "id": "quiet",
  "label": "Тишина",
  "sheet": 1,
  "rect": [
   444,
   16,
   256,
   186
  ]
 },
 {
  "id": "wifi",
  "label": "Wi-Fi",
  "sheet": 1,
  "rect": [
   843,
   30,
   227,
   172
  ]
 },
 {
  "id": "location",
  "label": "Расположение",
  "sheet": 1,
  "rect": [
   1207,
   16,
   245,
   186
  ]
 },
 {
  "id": "kids",
  "label": "Детская комната",
  "sheet": 1,
  "rect": [
   85,
   281,
   253,
   175
  ]
 },
 {
  "id": "pool",
  "label": "Бассейн",
  "sheet": 1,
  "rect": [
   438,
   272,
   278,
   184
  ]
 },
 {
  "id": "breakfast",
  "label": "Завтрак",
  "sheet": 1,
  "rect": [
   817,
   284,
   272,
   172
  ]
 },
 {
  "id": "air",
  "label": "Кондиционер",
  "sheet": 1,
  "rect": [
   1194,
   282,
   267,
   174
  ]
 },
 {
  "id": "entertainment",
  "label": "Анимация",
  "sheet": 1,
  "rect": [
   81,
   522,
   253,
   192
  ]
 },
 {
  "id": "design",
  "label": "Уникальный дизайн",
  "sheet": 1,
  "rect": [
   450,
   513,
   245,
   201
  ]
 },
 {
  "id": "coffee",
  "label": "Кафе и кофейни",
  "sheet": 1,
  "rect": [
   821,
   536,
   244,
   178
  ]
 },
 {
  "id": "attractions",
  "label": "Достопримечательности",
  "sheet": 1,
  "rect": [
   1211,
   520,
   249,
   194
  ]
 },
 {
  "id": "spa",
  "label": "Спа",
  "sheet": 1,
  "rect": [
   86,
   775,
   231,
   196
  ]
 },
 {
  "id": "view",
  "label": "Вид из окна",
  "sheet": 1,
  "rect": [
   461,
   765,
   233,
   206
  ]
 },
 {
  "id": "restaurant",
  "label": "Ресторан",
  "sheet": 1,
  "rect": [
   825,
   773,
   222,
   198
  ]
 },
 {
  "id": "historic",
  "label": "Историческое здание",
  "sheet": 1,
  "rect": [
   1209,
   765,
   252,
   206
  ]
 },
 {
  "id": "security",
  "label": "Безопасность",
  "sheet": 2,
  "rect": [
   135,
   24,
   180,
   195
  ]
 },
 {
  "id": "solo",
  "label": "Соло-поездка",
  "sheet": 2,
  "rect": [
   483,
   21,
   204,
   198
  ]
 },
 {
  "id": "sport",
  "label": "Спорт",
  "sheet": 2,
  "rect": [
   838,
   52,
   231,
   167
  ]
 },
 {
  "id": "parking",
  "label": "Парковка",
  "sheet": 2,
  "rect": [
   1224,
   28,
   174,
   191
  ]
 },
 {
  "id": "mountains",
  "label": "В горах",
  "sheet": 2,
  "rect": [
   105,
   291,
   251,
   174
  ]
 },
 {
  "id": "rental",
  "label": "Прокат инвентаря",
  "sheet": 2,
  "rect": [
   479,
   285,
   216,
   180
  ]
 },
 {
  "id": "nature",
  "label": "На природе",
  "sheet": 2,
  "rect": [
   846,
   289,
   193,
   176
  ]
 },
 {
  "id": "water",
  "label": "У воды",
  "sheet": 2,
  "rect": [
   1178,
   299,
   254,
   166
  ]
 },
 {
  "id": "park",
  "label": "Парк рядом",
  "sheet": 2,
  "rect": [
   100,
   520,
   249,
   193
  ]
 },
 {
  "id": "kitchen",
  "label": "Кухня",
  "sheet": 2,
  "rect": [
   468,
   530,
   243,
   183
  ]
 },
 {
  "id": "laundry",
  "label": "Прачечная",
  "sheet": 2,
  "rect": [
   854,
   525,
   207,
   188
  ]
 },
 {
  "id": "sauna",
  "label": "Сауна",
  "sheet": 2,
  "rect": [
   1201,
   515,
   205,
   198
  ]
 },
 {
  "id": "bar",
  "label": "Бар",
  "sheet": 2,
  "rect": [
   138,
   770,
   182,
   190
  ]
 },
 {
  "id": "adults",
  "label": "Только взрослые",
  "sheet": 2,
  "rect": [
   480,
   778,
   212,
   182
  ]
 },
 {
  "id": "beach",
  "label": "Свой пляж",
  "sheet": 2,
  "rect": [
   832,
   765,
   219,
   197
  ]
 },
 {
  "id": "work",
  "label": "Рабочее место",
  "sheet": 2,
  "rect": [
   1176,
   773,
   257,
   189
  ]
 }
] as const;
export type PreferenceIllustrationId=typeof preferenceIllustrations[number]['id'];
const rules:[RegExp,PreferenceIllustrationId][]=[
 [/чистот|ql_cleanliness/i,'cleanliness'],[/тишин|тих|loc_quiet/i,'quiet'],[/wi.?fi|вай.?фай|интернет|am_wifi/i,'wifi'],
 [/взросл|adults/i,'adults'],[/дет|семейн|kids/i,'kids'],[/бассейн|pool/i,'pool'],[/завтрак|breakfast/i,'breakfast'],
 [/кондиционер|am_air/i,'air'],[/анимаци|entertainment/i,'entertainment'],[/дизайн|интерьер|design/i,'design'],
 [/кафе|кофейн|coffee/i,'coffee'],[/достопримечательност|attractions/i,'attractions'],[/спа|хаммам|spa/i,'spa'],
 [/вид из окна|view/i,'view'],[/ресторан|гастро|restaurant/i,'restaurant'],[/историческ|historic/i,'historic'],
 [/безопас|security/i,'security'],[/соло|solo/i,'solo'],[/спорт|фитнес|sport/i,'sport'],[/парков|parking/i,'parking'],
 [/горах|горный|mountains/i,'mountains'],[/прокат|rental/i,'rental'],[/природ|зелень|greenery|nature/i,'nature'],
 [/пляж|beach/i,'beach'],[/мор[еяю]|вод[аы]|sea|water/i,'water'],[/парк|прогул|walks/i,'park'],
 [/кухн|kitchen/i,'kitchen'],[/прачеч|laundry/i,'laundry'],[/саун|sauna/i,'sauna'],[/бар|bar/i,'bar'],
 [/работ|рабоч|work/i,'work'],[/располож|центр|loc_center|location/i,'location']
];
export function preferenceIllustrationFor(label:string){
 const exact=preferenceIllustrations.find(item=>item.id===label||item.label===label);
 if(exact)return exact;
 const id=rules.find(([rule])=>rule.test(label))?.[1];
 return preferenceIllustrations.find(item=>item.id===id);
}
