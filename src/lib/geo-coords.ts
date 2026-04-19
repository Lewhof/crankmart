/**
 * Town / province coordinate lookup tables shared by every map view
 * (events, routes, directory). Lets us render markers when the DB row
 * has null lat/lng — falls back via town → province → null.
 *
 * SA cities are exhaustive; AU keys are province-prefixed (e.g. 'NSW:Sydney')
 * because some city names collide cross-country (Newcastle exists in both).
 * `getCityCoords()` handles the disambiguation.
 */

export const CITY_COORDS: Record<string, [number, number]> = {
  // ── South Africa ──────────────────────────────────────────────────────
  // Western Cape
  'Cape Town': [-33.9249, 18.4241], 'Stellenbosch': [-33.9321, 18.8602], 'George': [-33.9646, 22.4614],
  'Paarl': [-33.7342, 18.9626], 'Knysna': [-34.0356, 23.0478], 'Mossel Bay': [-34.1826, 22.1419],
  'Hermanus': [-34.4187, 19.2345], 'Somerset West': [-34.0851, 18.8445], 'Franschhoek': [-33.9122, 19.1222],
  'Worcester': [-33.6457, 19.4481], 'Swellendam': [-34.0236, 20.4428], 'Oudtshoorn': [-33.5935, 22.2040],
  'Wilderness': [-33.9958, 22.5896], 'Plettenberg Bay': [-34.0527, 23.3714], 'Caledon': [-34.2300, 19.4355],
  'Robertson': [-33.8012, 19.8835], 'Malmesbury': [-33.4601, 18.7310], 'Strand': [-34.1168, 18.8298],
  "Gordon's Bay": [-34.1577, 18.8607], 'Langebaan': [-33.1063, 18.0323], 'Vredenburg': [-32.9072, 17.9948],
  'Ceres': [-33.3701, 19.3114], 'Tulbagh': [-33.2825, 19.1374], 'Montagu': [-33.7840, 20.1180],
  'Bredasdorp': [-34.5333, 20.0406], "L'Agulhas": [-34.8285, 20.0095], 'Grabouw': [-34.1461, 19.0085],
  'Calitzdorp': [-33.5316, 21.6877], 'Ladismith': [-33.4982, 21.2618], 'De Rust': [-33.4769, 22.5215],
  'Prince Albert': [-33.2178, 22.0310], 'Riversdale': [-34.0981, 21.2597], 'Stilbaai': [-34.3722, 21.4261],
  'Genadendal': [-34.0264, 19.5583], 'Elgin': [-34.1550, 19.0458],
  // Gauteng
  'Johannesburg': [-26.2041, 28.0473], 'Pretoria': [-25.7479, 28.2293], 'Sandton': [-26.1070, 28.0567],
  'Midrand': [-25.9976, 28.1283], 'Centurion': [-25.8553, 28.1878], 'Randburg': [-26.0875, 27.9978],
  'Roodepoort': [-26.1628, 27.8665], 'Soweto': [-26.2677, 27.8583], 'Benoni': [-26.1875, 28.3180],
  'Kempton Park': [-26.1077, 28.2335], 'Boksburg': [-26.2144, 28.2607], 'Germiston': [-26.2170, 28.1719],
  'Springs': [-26.2521, 28.4366], 'Alberton': [-26.2656, 28.1222], 'Edenvale': [-26.1383, 28.1597],
  'Fourways': [-26.0171, 28.0099], 'Hartbeespoort': [-25.7481, 27.9002], 'Krugersdorp': [-26.0952, 27.7720],
  'Tembisa': [-25.9993, 28.2265], 'Vereeniging': [-26.6731, 27.9269], 'Vanderbijlpark': [-26.7023, 27.8396],
  'Magaliesburg': [-26.0000, 27.5333], 'Muldersdrift': [-26.0236, 27.8575], 'Heidelberg': [-26.5038, 28.3607],
  // KwaZulu-Natal
  'Durban': [-29.8587, 31.0218], 'Pietermaritzburg': [-29.6167, 30.3930], 'Ballito': [-29.5329, 31.2092],
  'Richards Bay': [-28.7832, 32.0390], 'Ladysmith': [-28.5569, 29.7797],
  'Pinetown': [-29.8177, 30.8557], 'Westville': [-29.8309, 30.9352], 'Umhlanga': [-29.7307, 31.0841],
  'Amanzimtoti': [-30.0551, 30.8766], 'Margate': [-30.8651, 30.3605], 'Port Shepstone': [-30.7486, 30.4567],
  'Tongaat': [-29.5700, 31.1122], 'Stanger': [-29.3399, 31.2932], 'Scottburgh': [-30.2890, 30.7629],
  'Hluhluwe': [-28.0202, 32.2727], 'Eshowe': [-28.8838, 31.4690], 'Howick': [-29.4726, 30.2293],
  'Underberg': [-29.7897, 29.4917], 'Mtunzini': [-28.9620, 31.7450], 'New Hanover': [-29.3671, 30.5278],
  'Winterton': [-28.8000, 29.5333], 'Himeville': [-29.7500, 29.5167],
  // Eastern Cape
  'Port Elizabeth': [-33.9608, 25.6022], 'Gqeberha': [-33.9608, 25.6022], 'East London': [-33.0153, 27.9116],
  'Uitenhage': [-33.7660, 25.3984], "King William's Town": [-32.8892, 27.3985], 'Queenstown': [-31.9000, 26.8757],
  'Grahamstown': [-33.3042, 26.5328], 'Makhanda': [-33.3042, 26.5328], 'Graaff-Reinet': [-32.2522, 24.5328],
  'Jeffreys Bay': [-34.0531, 24.9189], "Jeffrey's Bay": [-34.0531, 24.9189], 'Humansdorp': [-34.0290, 24.7705],
  'Middelburg (EC)': [-31.4990, 25.0096], 'Middelburg EC': [-31.4990, 25.0096],
  'Aliwal North': [-30.6919, 26.7140], 'Cradock': [-32.1643, 25.6182],
  'Addo': [-33.5549, 25.7234], 'Port Alfred': [-33.5935, 26.8877], 'Storms River': [-33.9779, 23.8792],
  'Nieu-Bethesda': [-31.8609, 24.5606], 'Jansenville': [-32.9367, 24.6699], 'Willowmore': [-33.2885, 23.4912],
  // Free State
  'Bloemfontein': [-29.0852, 26.1596], 'Welkom': [-27.9777, 26.7345], 'Kroonstad': [-27.6494, 27.2281],
  'Bethlehem': [-28.2299, 28.3007], 'Harrismith': [-28.2744, 29.1203], 'Parys': [-26.9007, 27.4609],
  'Sasolburg': [-26.8100, 27.8252], 'Phuthaditjhaba': [-28.5296, 28.9037],
  'Clarens': [-28.5269, 28.4286], 'Fouriesburg': [-28.6236, 28.2164], 'Clocolan': [-28.9218, 27.5770],
  'Jacobsdal': [-29.1264, 24.7454],
  // Limpopo
  'Polokwane': [-23.9045, 29.4688], 'Tzaneen': [-23.8296, 30.1577], 'Mokopane': [-24.1937, 29.0076],
  'Bela-Bela': [-24.8867, 28.3244], 'Louis Trichardt': [-23.0432, 29.9044], 'Phalaborwa': [-23.9393, 31.1554],
  'Groblersdal': [-25.1666, 29.3994], 'Lephalale': [-23.6798, 27.7064],
  'Thabazimbi': [-24.5939, 27.4044], 'Vaalwater': [-24.2747, 28.1126],
  // Mpumalanga
  'Nelspruit': [-25.4745, 30.9703], 'Mbombela': [-25.4745, 30.9703], 'Witbank': [-25.8748, 29.2373],
  'eMalahleni': [-25.8748, 29.2373], 'Middelburg': [-25.7735, 29.4677], 'Secunda': [-26.5100, 29.1671],
  'Standerton': [-26.9405, 29.2394], 'Ermelo': [-26.5233, 29.9767], 'Hazyview': [-25.0502, 31.1289],
  'White River': [-25.3310, 31.0007], 'Sabie': [-25.1004, 30.7808], 'Lydenburg': [-25.0973, 30.4525],
  'Dullstroom': [-25.4097, 30.1148], 'Machadodorp': [-25.6567, 30.2909],
  // North West
  'Rustenburg': [-25.6675, 27.2423], 'Klerksdorp': [-26.8681, 26.6677], 'Potchefstroom': [-26.7145, 27.0991],
  'Mahikeng': [-25.8493, 25.6420], 'Mmabatho': [-25.8493, 25.6420], 'Brits': [-25.6313, 27.7759],
  'Lichtenburg': [-26.1495, 26.1624], 'Zeerust': [-25.5431, 26.0722], 'Vryburg': [-26.9566, 24.7297],
  'Buffelspoort': [-25.6688, 27.8983],
  // Northern Cape
  'Kimberley': [-28.7323, 24.7620], 'Upington': [-28.4478, 21.2561], 'Springbok': [-29.6643, 17.8865],
  'De Aar': [-30.6494, 24.0106], 'Kuruman': [-27.4540, 23.4330], 'Kakamas': [-28.7818, 20.6178],
  'Augrabies': [-28.5968, 20.3377], 'Calvinia': [-31.4718, 19.7753], 'Hanover': [-31.0696, 24.4573],
  'Kenhardt': [-29.3627, 21.1476], 'Nigramoep': [-29.7131, 17.6872], "O'Kiep": [-29.6147, 17.8844],
  'Orania': [-29.8097, 24.4197],

  // ── Australia (province-prefixed to avoid collisions) ─────────────────
  'NSW:Sydney': [-33.8688, 151.2093], 'NSW:Newcastle': [-32.9283, 151.7817],
  'NSW:Wollongong': [-34.4278, 150.8931], 'NSW:Central Coast': [-33.4279, 151.3422],
  'NSW:Thredbo': [-36.5039, 148.3000], 'NSW:Newtown': [-33.8980, 151.1791],
  'VIC:Melbourne': [-37.8136, 144.9631], 'VIC:Geelong': [-38.1499, 144.3617],
  'VIC:Ballarat': [-37.5622, 143.8503], 'VIC:Bendigo': [-36.7570, 144.2794],
  'VIC:Mount Buller': [-37.1450, 146.4467],
  'QLD:Brisbane': [-27.4698, 153.0251], 'QLD:Gold Coast': [-28.0167, 153.4000],
  'QLD:Sunshine Coast': [-26.6500, 153.0667], 'QLD:Cairns': [-16.9186, 145.7781],
  'QLD:Townsville': [-19.2589, 146.8169],
  'WA:Perth': [-31.9505, 115.8605], 'WA:Fremantle': [-32.0569, 115.7439],
  'WA:Mandurah': [-32.5269, 115.7217],
  'SA:Adelaide': [-34.9285, 138.6007], 'SA:Norwood': [-34.9197, 138.6300],
  'TAS:Hobart': [-42.8821, 147.3272], 'TAS:Launceston': [-41.4332, 147.1441],
  'TAS:Devonport': [-41.1789, 146.3517], 'TAS:Derby': [-41.1500, 147.8167],
  'TAS:Derby township': [-41.1500, 147.8167],
  'ACT:Canberra': [-35.2809, 149.1300],
  'NT:Darwin': [-12.4634, 130.8456], 'NT:Alice Springs': [-23.6980, 133.8807],
  // Common AU place strings without state context — used as last-ditch fallback
  'Mt Coot-tha': [-27.4778, 152.9569],
}

export const PROVINCE_COORDS: Record<string, [number, number]> = {
  // SA provinces
  'Western Cape': [-33.9249, 18.4241],
  'Gauteng': [-26.2041, 28.0473],
  'KwaZulu-Natal': [-29.8587, 31.0218],
  'Eastern Cape': [-33.0153, 27.9116],
  'Free State': [-29.0852, 26.1596],
  'Limpopo': [-23.9045, 29.4688],
  'Mpumalanga': [-25.4745, 30.9703],
  'North West': [-25.6675, 27.2423],
  'Northern Cape': [-28.7323, 24.7620],
  // AU states/territories
  'New South Wales':              [-33.8688, 151.2093],
  'Victoria':                     [-37.8136, 144.9631],
  'Queensland':                   [-27.4698, 153.0251],
  'Western Australia':            [-31.9505, 115.8605],
  'South Australia':              [-34.9285, 138.6007],
  'Tasmania':                     [-42.8821, 147.3272],
  'Northern Territory':           [-12.4634, 130.8456],
  'Australian Capital Territory': [-35.2809, 149.1300],
}

const AU_STATE_PREFIX: Record<string, string> = {
  'New South Wales': 'NSW', 'Victoria': 'VIC', 'Queensland': 'QLD',
  'Western Australia': 'WA', 'South Australia': 'SA', 'Tasmania': 'TAS',
  'Northern Territory': 'NT', 'Australian Capital Territory': 'ACT',
}

/**
 * Resolve [lat, lng] for a city/town. Tries (in order):
 *   1. Province-prefixed key when the province is an AU state — disambiguates
 *      duplicate names like Newcastle (NSW vs SA-KZN).
 *   2. Bare city key — covers SA cities and unique AU cities.
 *   3. Case-insensitive bare-key match.
 *   4. The city string interpreted as a province (some legacy data).
 *   5. Province centre fallback.
 */
export function getCityCoords(city: string | null | undefined, province?: string | null): [number, number] | null {
  if (!city) return province ? (PROVINCE_COORDS[province] ?? null) : null
  if (province && AU_STATE_PREFIX[province]) {
    const auKey = `${AU_STATE_PREFIX[province]}:${city}`
    if (CITY_COORDS[auKey]) return CITY_COORDS[auKey]
  }
  const direct = CITY_COORDS[city]
  if (direct) return direct
  const key = Object.keys(CITY_COORDS).find(k => k.toLowerCase() === city.toLowerCase())
  if (key) return CITY_COORDS[key]
  if (PROVINCE_COORDS[city]) return PROVINCE_COORDS[city]
  if (province && PROVINCE_COORDS[province]) return PROVINCE_COORDS[province]
  return null
}
