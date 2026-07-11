export type DestinationSeed = {
  regionSlug: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  elevationMeters: number;
  difficulty: "easy" | "moderate" | "hard";
  bestSeasonStart: number;
  bestSeasonEnd: number;
  description: string;
  requiresLocalTransport?: boolean;
  localTransportNote?: string;
};

export const regionSeed = [
  { name: "Gilgit-Baltistan", slug: "gilgit-baltistan", blurb: "Glacial valleys, high passes and the great Karakoram." },
  { name: "KPK Northern Areas", slug: "kpk-northern-areas", blurb: "Forest valleys, alpine lakes and welcoming mountain towns." },
  { name: "Azad Jammu & Kashmir", slug: "azad-jammu-kashmir", blurb: "River valleys, green ridgelines and remote lake country." },
] as const;

const common = { difficulty: "moderate" as const, bestSeasonStart: 4, bestSeasonEnd: 10 };

export const destinationSeed: DestinationSeed[] = [
  { ...common, regionSlug: "gilgit-baltistan", name: "Hunza Valley", slug: "hunza-valley", latitude: 36.3167, longitude: 74.65, elevationMeters: 2438, description: "A storied Karakoram valley centered on Karimabad, with forts, orchards and immense mountain views." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Baltit Fort", slug: "baltit-fort", latitude: 36.3184, longitude: 74.657, elevationMeters: 2500, difficulty: "easy", description: "A centuries-old fort watching over Karimabad and the Hunza valley." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Altit Fort", slug: "altit-fort", latitude: 36.2975, longitude: 74.6612, elevationMeters: 2400, difficulty: "easy", description: "Historic royal architecture set above the Hunza River." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Rakaposhi View Point", slug: "rakaposhi-view-point", latitude: 36.2333, longitude: 74.5833, elevationMeters: 2300, difficulty: "easy", description: "A dramatic roadside perspective on the 7,788-metre Rakaposhi massif." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Attabad Lake", slug: "attabad-lake", latitude: 36.3654, longitude: 74.8666, elevationMeters: 2560, difficulty: "easy", description: "Turquoise water framed by bare Karakoram peaks in upper Hunza." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Passu Cones", slug: "passu-cones", latitude: 36.45, longitude: 74.8833, elevationMeters: 2400, description: "The serrated cathedral peaks of Passu above the Karakoram Highway." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Borith Lake", slug: "borith-lake", latitude: 36.4667, longitude: 74.8833, elevationMeters: 2600, description: "A quiet high-altitude lake near Gulmit and the Passu Glacier." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Hoper Glacier", slug: "hoper-glacier", latitude: 36.2333, longitude: 74.7333, elevationMeters: 2700, difficulty: "hard", description: "A rugged glacier landscape reached through Nagar Valley." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Naltar Valley", slug: "naltar-valley", latitude: 36.1617, longitude: 74.1819, elevationMeters: 2900, difficulty: "hard", description: "Pine forest, mountain lakes and winter slopes above Gilgit." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Khunjerab Pass", slug: "khunjerab-pass", latitude: 36.85, longitude: 75.4167, elevationMeters: 4693, difficulty: "hard", bestSeasonStart: 5, bestSeasonEnd: 9, description: "One of the world's highest paved border crossings in Khunjerab National Park." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Skardu", slug: "skardu", latitude: 35.2971, longitude: 75.6333, elevationMeters: 2228, difficulty: "easy", description: "Gateway to Baltistan's lakes, forts, deserts and giant peaks." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Shigar Valley", slug: "shigar-valley", latitude: 35.4167, longitude: 75.7333, elevationMeters: 2438, difficulty: "easy", description: "A broad agricultural valley and historic gateway toward the Karakoram." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Khaplu", slug: "khaplu", latitude: 35.1667, longitude: 76.3333, elevationMeters: 2600, difficulty: "easy", description: "A heritage town of stone lanes, orchards and mountain palaces." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Chocolate Rocks", slug: "chocolate-rocks", latitude: 35.15, longitude: 75.55, elevationMeters: 2200, difficulty: "easy", description: "Distinctive weathered rock formations near Sermik and Chhomdu Bridge." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Astore", slug: "astore", latitude: 35.3667, longitude: 74.85, elevationMeters: 2600, description: "A mountain district linking forested valleys with the Deosai plateau." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Minimarg", slug: "minimarg", latitude: 35.05, longitude: 74.85, elevationMeters: 3100, difficulty: "hard", bestSeasonStart: 6, bestSeasonEnd: 9, description: "A remote green valley near the eastern edge of Astore.", requiresLocalTransport: true, localTransportNote: "Local 4x4 access should be confirmed before departure." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Rama Meadows", slug: "rama-meadows", latitude: 35.3167, longitude: 74.8333, elevationMeters: 3300, description: "Alpine meadows beneath Nanga Parbat, above Astore." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Fairy Meadows", slug: "fairy-meadows", latitude: 35.3853, longitude: 74.5622, elevationMeters: 3300, difficulty: "hard", bestSeasonStart: 5, bestSeasonEnd: 9, description: "A celebrated alpine meadow facing the north wall of Nanga Parbat.", requiresLocalTransport: true, localTransportNote: "A local jeep is required from Raikot Bridge, followed by a hike." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Deosai & Sheosar Lake", slug: "deosai-sheosar-lake", latitude: 35.0333, longitude: 75.4167, elevationMeters: 4250, difficulty: "hard", bestSeasonStart: 6, bestSeasonEnd: 9, description: "A vast high-altitude plateau of open sky, wildlife and seasonal wildflowers.", requiresLocalTransport: true, localTransportNote: "High-clearance local transport is required on plateau tracks." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Chilas", slug: "chilas", latitude: 35.4222, longitude: 74.1, elevationMeters: 1250, difficulty: "easy", description: "A warm Indus Valley gateway beneath Nanga Parbat." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Gilgit", slug: "gilgit", latitude: 35.9, longitude: 74.3, elevationMeters: 1500, difficulty: "easy", description: "The region's transport and cultural hub at the meeting of mountain ranges." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Phander Valley", slug: "phander-valley", latitude: 36.05, longitude: 72.5667, elevationMeters: 2900, description: "A serene Ghizer valley of blue water, poplars and broad meadows." },
  { ...common, regionSlug: "gilgit-baltistan", name: "Shandur Pass", slug: "shandur-pass", latitude: 36.0833, longitude: 72.5333, elevationMeters: 3738, difficulty: "hard", bestSeasonStart: 6, bestSeasonEnd: 9, description: "A high pass linking Gilgit-Baltistan and Chitral, famous for polo." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Naran", slug: "naran", latitude: 34.9042, longitude: 73.65, elevationMeters: 2409, difficulty: "easy", description: "A lively summer base for Kaghan Valley's lakes and passes." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Saif-ul-Malook Lake", slug: "saif-ul-malook-lake", latitude: 34.883, longitude: 73.687, elevationMeters: 3224, difficulty: "hard", description: "An alpine lake below Malika Parbat, reached by local mountain transport.", requiresLocalTransport: true, localTransportNote: "A local jeep is normally required from Naran." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Kaghan", slug: "kaghan", latitude: 34.783, longitude: 73.55, elevationMeters: 2103, difficulty: "easy", description: "A riverside mountain town in the heart of Kaghan Valley." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Shogran", slug: "shogran", latitude: 34.7333, longitude: 73.4833, elevationMeters: 2362, difficulty: "easy", description: "A forested plateau with views toward Makra Peak." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Kumrat Valley", slug: "kumrat-valley", latitude: 35.4833, longitude: 72.0333, elevationMeters: 2803, description: "A river valley of tall deodar forest and meadow camps." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Swat", slug: "swat", latitude: 35.4855, longitude: 72.5789, elevationMeters: 980, difficulty: "easy", description: "A historic valley of rivers, archaeology and forested slopes." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Kalam", slug: "kalam", latitude: 35.4667, longitude: 72.5833, elevationMeters: 2000, difficulty: "easy", description: "The upper Swat hub for alpine valleys and Mahodand Lake." },
  { ...common, regionSlug: "kpk-northern-areas", name: "Chitral", slug: "chitral", latitude: 35.8518, longitude: 71.7864, elevationMeters: 1500, difficulty: "easy", description: "A distinctive mountain culture beneath the Hindu Kush." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Neelum Valley", slug: "neelum-valley", latitude: 34.7967, longitude: 74.1922, elevationMeters: 1981, difficulty: "easy", description: "A long river valley of forests, villages and mountain viewpoints." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Kel", slug: "kel", latitude: 34.62, longitude: 73.93, elevationMeters: 2020, description: "An upper Neelum settlement and gateway to Arang Kel." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Arang Kel", slug: "arang-kel", latitude: 34.63, longitude: 73.92, elevationMeters: 2449, description: "A green hillside village reached above Kel." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Taobat", slug: "taobat", latitude: 34.75, longitude: 73.85, elevationMeters: 2100, difficulty: "hard", description: "A remote upper-valley village where the Neelum River enters Pakistan." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Shounter Valley", slug: "shounter-valley", latitude: 34.8, longitude: 73.8, elevationMeters: 3400, difficulty: "hard", description: "A remote high valley linking toward Astore through seasonal routes." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Ratti Gali Lake", slug: "ratti-gali-lake", latitude: 34.75, longitude: 74.0, elevationMeters: 3700, difficulty: "hard", bestSeasonStart: 7, bestSeasonEnd: 9, description: "A vivid alpine lake surrounded by snow-streaked ridges.", requiresLocalTransport: true, localTransportNote: "A local jeep is required from the Dowarian side, followed by a hike." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Rawalakot", slug: "rawalakot", latitude: 33.857, longitude: 73.7649, elevationMeters: 1677, difficulty: "easy", description: "A green hill city serving the Poonch region." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Banjosa Lake", slug: "banjosa-lake", latitude: 33.7667, longitude: 73.75, elevationMeters: 1981, difficulty: "easy", description: "A small forest-ringed lake near Rawalakot." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Pir Chinasi", slug: "pir-chinasi", latitude: 34.42, longitude: 73.4667, elevationMeters: 2900, description: "A high ridge viewpoint above Muzaffarabad." },
  { ...common, regionSlug: "azad-jammu-kashmir", name: "Muzaffarabad", slug: "muzaffarabad", latitude: 34.37, longitude: 73.4711, elevationMeters: 702, difficulty: "easy", description: "AJK's capital at the meeting of the Neelum and Jhelum rivers." },
];

export const pickupCitySeed = [
  { name: "Islamabad", slug: "islamabad" },
  { name: "Rawalpindi", slug: "rawalpindi" },
  { name: "Lahore", slug: "lahore" },
  { name: "Multan", slug: "multan" },
  { name: "Gujranwala", slug: "gujranwala" },
];
