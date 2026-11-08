/** Shared meanings for room equipment, hotel facilities and preference pictograms. */
const amenityRules:[RegExp,string][]=[
 [/двухъярус/i,'bunk-bed'],[/диван/i,'sofa-bed'],[/две односпаль/i,'bed-twin'],[/двуспаль/i,'bed-double'],[/односпаль/i,'bed-single'],[/кроватк/i,'baby-cot'],
 [/смена.*бель|комплект.*бель|постельн.*бель/i,'linen'],[/полотен/i,'towels'],[/халат/i,'bathrobe'],[/тапоч/i,'slippers'],[/косметик|туалетн.*принадлеж/i,'toiletries'],[/фен/i,'hairdryer'],
 [/общая ванн/i,'shared-bathroom'],[/ванн/i,'bathroom'],[/душ/i,'shower'],[/спальн/i,'bedrooms'],[/площадь/i,'room-area'],
 [/вид.*сад|вид.*территор/i,'garden-view'],[/вид.*мор/i,'sea-view'],[/вид.*гор/i,'mountain-view'],[/балкон/i,'balcony'],[/террас/i,'terrace'],
 [/кофемаш/i,'coffee-machine'],[/чайник/i,'kettle'],[/холодиль|мини.?бар/i,'refrigerator'],[/микроволнов/i,'microwave'],[/стиральн/i,'washing-machine'],[/кухн/i,'kitchen'],[/шкаф/i,'wardrobe'],[/рабоч.*мест|рабоч.*зон|письменн.*стол/i,'desk'],
 [/wi.?fi|вай.?фай|интернет/i,'wifi'],[/кондиционер/i,'climate'],[/телевиз/i,'tv'],[/сейф/i,'safe'],[/розет/i,'plug'],[/освещ/i,'bulb'],
 [/бассейн/i,'pool'],[/саун|хаммам/i,'sauna'],[/спа|массаж/i,'spa'],[/пляж/i,'beach'],[/завтрак/i,'breakfast'],[/ресторан/i,'restaurant'],[/кафе|кофейн/i,'cafe'],[/бар/i,'bar'],
 [/лифт/i,'elevator'],[/детск.*комнат/i,'kids-room'],[/дет/i,'baby-cot'],[/хранен|багаж/i,'luggage'],[/стойк|регистрац|ресеп/i,'reception'],[/бесконтакт/i,'contactless-check-in'],[/прачеч/i,'laundry'],[/гладиль|утюг/i,'iron'],[/уборк|чистот/i,'cleaning'],
 [/фитнес|спорт/i,'fitness'],[/доступн.*сред|ограниченн.*возмож/i,'accessible'],[/без кур|некур/i,'no-smoking'],[/питом|животн/i,'pet'],[/парков/i,'parking'],[/трансфер/i,'transfer'],[/такси/i,'taxi'],[/экскурс|маршрут/i,'route'],[/пикник/i,'picnic'],[/настольн/i,'board-games'],[/питьев|кулер/i,'water-dispenser'],
];
export function amenityIcon(label:string,fallback='hotel-building'){return amenityRules.find(([match])=>match.test(label))?.[1]||fallback;}
