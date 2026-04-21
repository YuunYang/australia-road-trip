export interface Location {
  name: string
  nameEn: string
  lat: number
  lng: number
}

export interface ChargingStation {
  name: string
  address: string
  type: 'ev' | 'petrol'
  distance: string
}

export interface Day {
  day: number
  date: string
  dateLabel: string
  title: string
  subtitle: string
  from: Location
  to: Location
  driveKm: number
  driveHours: number
  highlights: string[]
  climbingInfo?: string
  accommodation: {
    area: string
    airbnbUrl: string
    description: string
  }
  charging: ChargingStation[]
  color: string
  mapCenter: [number, number]
  mapZoom: number
}

export const TRIP_DAYS: Day[] = [
  {
    day: 1,
    date: '2026-05-22',
    dateLabel: '5月22日 周五',
    title: '抵达悉尼',
    subtitle: '落地休整，感受海港城市',
    from: { name: '悉尼国际机场', nameEn: 'Sydney Airport (SYD)', lat: -33.9399, lng: 151.1753 },
    to: { name: '悉尼市区', nameEn: 'Sydney CBD', lat: -33.8688, lng: 151.2093 },
    driveKm: 15,
    driveHours: 0.5,
    highlights: [
      '晚上 7:20 抵达 Kingsford Smith 机场',
      '驾车前往市区酒店 (~15km)',
      '悉尼湾夜景初体验',
      '附近觅食 — The Rocks 老城区餐厅',
    ],
    accommodation: {
      area: 'Sydney CBD / The Rocks',
      airbnbUrl: 'https://www.airbnb.com/s/The-Rocks--Sydney--NSW--Australia/homes?checkin=2026-05-22&checkout=2026-05-24&adults=2&place_id=ChIJN1t_tDeuEmsRUsoyG83frY4',
      description: '建议住 The Rocks 或 Circular Quay 附近，步行即达歌剧院和海港大桥',
    },
    charging: [
      { name: 'Sydney Airport EV Charging', address: 'Airport Dr, Mascot NSW 2020', type: 'ev', distance: '0km — 机场内' },
      { name: 'NRMA Charging — Pitt St', address: '111 Pitt St, Sydney CBD', type: 'ev', distance: '市区内' },
      { name: 'BP Kingsgrove', address: 'Kingsgrove Rd, Kingsgrove', type: 'petrol', distance: '8km' },
    ],
    color: '#FF6B35',
    mapCenter: [-33.8688, 151.2093],
    mapZoom: 12,
  },
  {
    day: 2,
    date: '2026-05-23',
    dateLabel: '5月23日 周六',
    title: '悉尼城市探索',
    subtitle: '海港大桥 · 歌剧院 · 邦迪海滩',
    from: { name: '悉尼市区', nameEn: 'Sydney CBD', lat: -33.8688, lng: 151.2093 },
    to: { name: '悉尼市区', nameEn: 'Sydney CBD', lat: -33.8688, lng: 151.2093 },
    driveKm: 30,
    driveHours: 1,
    highlights: [
      '悉尼海港大桥 — 桥面步行 (BridgeClimb)',
      '悉尼歌剧院 — 参观 / 看演出',
      '皇家植物园漫步',
      '邦迪海滩 + 邦迪到库吉海岸步道 (6km)',
      '曼利海滩轮渡之旅',
    ],
    accommodation: {
      area: 'Sydney CBD / Bondi Beach',
      airbnbUrl: 'https://www.airbnb.com/s/Bondi-Beach--Sydney--NSW--Australia/homes?checkin=2026-05-23&checkout=2026-05-25&adults=2',
      description: '可选择搬到邦迪海滩附近，享受海滩日出',
    },
    charging: [
      { name: 'Wilson Parking EV — Goulburn St', address: '25 Goulburn St, Sydney', type: 'ev', distance: '市区停车场' },
      { name: 'Secure Parking EV — Bond St', address: '50 Bond St, Sydney', type: 'ev', distance: '市区停车场' },
    ],
    color: '#4ECDC4',
    mapCenter: [-33.8688, 151.2093],
    mapZoom: 12,
  },
  {
    day: 3,
    date: '2026-05-24',
    dateLabel: '5月24日 周日',
    title: '蓝山国家公园',
    subtitle: '三姐妹峰 · 卡通巴 · 林间瀑布',
    from: { name: '悉尼市区', nameEn: 'Sydney CBD', lat: -33.8688, lng: 151.2093 },
    to: { name: '卡通巴', nameEn: 'Katoomba', lat: -33.7127, lng: 150.3118 },
    driveKm: 110,
    driveHours: 1.5,
    highlights: [
      '三姐妹峰 (Three Sisters) — 日出最美',
      '世界最陡峭铁路 Scenic Railway',
      'Wentworth Falls 温特沃斯瀑布步道',
      '卡通巴小镇咖啡馆漫步',
      '傍晚可见山谷雾气弥漫',
    ],
    accommodation: {
      area: 'Katoomba / Blue Mountains',
      airbnbUrl: 'https://www.airbnb.com/s/Katoomba--NSW--Australia/homes?checkin=2026-05-24&checkout=2026-05-25&adults=2',
      description: '蓝山小木屋体验，推荐带壁炉的山景房',
    },
    charging: [
      { name: 'NRMA Charging — Katoomba', address: 'Katoomba St, Katoomba NSW 2780', type: 'ev', distance: '镇中心' },
      { name: 'Caltex Katoomba', address: 'Great Western Hwy, Katoomba', type: 'petrol', distance: '0.5km' },
    ],
    color: '#45B7D1',
    mapCenter: [-33.76, 150.55],
    mapZoom: 10,
  },
  {
    day: 4,
    date: '2026-05-25',
    dateLabel: '5月25日 周一',
    title: '诺拉户外攀岩',
    subtitle: '澳大利亚最佳运动攀岩圣地',
    from: { name: '卡通巴', nameEn: 'Katoomba', lat: -33.7127, lng: 150.3118 },
    to: { name: '诺拉', nameEn: 'Nowra', lat: -34.8764, lng: 150.5986 },
    driveKm: 185,
    driveHours: 2.5,
    highlights: [
      '🧗 Nowra Rocks — 澳大利亚顶级运动攀岩场地',
      '石英岩地形，路线 5.10 到 5.14 全覆盖',
      '推荐路线区域: Coombadjha Creek',
      '可聘请本地向导 (约 AUD 150/半天)',
      '晚上 Shoalhaven River 河边晚餐',
    ],
    climbingInfo: '诺拉岩场 (Nowra Rocks): 位于 Nowra 以西约 10km，石英岩运动路线为主，共 400+ 条路线。最佳季节为秋冬 (4-9月)。需自带装备或当地租借。',
    accommodation: {
      area: 'Nowra / Jervis Bay',
      airbnbUrl: 'https://www.airbnb.com/s/Nowra--NSW--Australia/homes?checkin=2026-05-25&checkout=2026-05-26&adults=2',
      description: '可选择 Nowra 市区或前往更美的 Jervis Bay 海湾小屋',
    },
    charging: [
      { name: 'Nowra EV Charging — Junction St', address: 'Junction St, Nowra NSW 2541', type: 'ev', distance: '市区' },
      { name: 'BP Nowra', address: 'Princes Hwy, Nowra', type: 'petrol', distance: '市区' },
      { name: 'Shell Camden Valley Way', address: 'Camden Valley Way, Narellan', type: 'petrol', distance: '途中 55km' },
    ],
    color: '#96CEB4',
    mapCenter: [-34.4, 150.5],
    mapZoom: 9,
  },
  {
    day: 5,
    date: '2026-05-26',
    dateLabel: '5月26日 周二',
    title: '杰维斯湾 → 巴特曼斯湾',
    subtitle: '白沙碧海 · 海豚湾 · 南海岸公路',
    from: { name: '杰维斯湾', nameEn: 'Jervis Bay', lat: -35.1400, lng: 150.7400 },
    to: { name: '巴特曼斯湾', nameEn: "Batemans Bay", lat: -35.7076, lng: 150.1721 },
    driveKm: 95,
    driveHours: 1.5,
    highlights: [
      '杰维斯湾 Hyams Beach — 世界最白沙滩',
      '观海豚 (常年可见)',
      '波莫纳腊坞国家公园 (Booderee NP)',
      '沿 Princes Hwy 南行，途经壮观海岸线',
      '巴特曼斯湾牡蛎品尝',
    ],
    accommodation: {
      area: "Batemans Bay",
      airbnbUrl: "https://www.airbnb.com/s/Batemans-Bay--NSW--Australia/homes?checkin=2026-05-26&checkout=2026-05-27&adults=2",
      description: '推荐海景房，可见 Clyde River 入海口',
    },
    charging: [
      { name: 'NRMA Charging — Batemans Bay', address: 'Orient St, Batemans Bay NSW 2536', type: 'ev', distance: '市区' },
      { name: 'Caltex Ulladulla', address: 'Princes Hwy, Ulladulla', type: 'petrol', distance: '途中 45km' },
    ],
    color: '#FFEAA7',
    mapCenter: [-35.4, 150.4],
    mapZoom: 9,
  },
  {
    day: 6,
    date: '2026-05-27',
    dateLabel: '5月27日 周三',
    title: '纳鲁玛 → 梅林布拉',
    subtitle: '绿宝石海岸 · 神秘岩石 · 悬崖海湾',
    from: { name: '巴特曼斯湾', nameEn: "Batemans Bay", lat: -35.7076, lng: 150.1721 },
    to: { name: '梅林布拉', nameEn: 'Merimbula', lat: -36.8967, lng: 149.9050 },
    driveKm: 175,
    driveHours: 2.5,
    highlights: [
      '纳鲁玛 (Narooma) — 绿宝石海湾，澳大利亚最美海湾之一',
      'Mystery Bay 神秘湾奇特岩石',
      '中央海岸国家公园步道',
      '梅林布拉湖泊系统皮划艇',
      '新鲜生蚝直供码头',
    ],
    accommodation: {
      area: 'Merimbula',
      airbnbUrl: 'https://www.airbnb.com/s/Merimbula--NSW--Australia/homes?checkin=2026-05-27&checkout=2026-05-28&adults=2',
      description: '湖景小屋，可步行至海滩',
    },
    charging: [
      { name: 'Narooma Visitor Centre Charging', address: 'Princes Hwy, Narooma NSW 2546', type: 'ev', distance: '途中 70km' },
      { name: 'BP Merimbula', address: 'Market St, Merimbula NSW 2548', type: 'petrol', distance: '目的地' },
    ],
    color: '#DDA0DD',
    mapCenter: [-36.4, 150.0],
    mapZoom: 9,
  },
  {
    day: 7,
    date: '2026-05-28',
    dateLabel: '5月28日 周四',
    title: '马拉库塔 → 莱克斯入口',
    subtitle: '跨州边境 · 维多利亚开始 · 九十英里海滩',
    from: { name: '梅林布拉', nameEn: 'Merimbula', lat: -36.8967, lng: 149.9050 },
    to: { name: '莱克斯入口', nameEn: 'Lakes Entrance', lat: -37.8800, lng: 147.9800 },
    driveKm: 220,
    driveHours: 3.0,
    highlights: [
      '马拉库塔 (Mallacoota) — 维多利亚最偏远的宝藏海湾',
      '跨越 NSW/VIC 州界',
      '九十英里海滩 (Ninety Mile Beach)',
      '莱克斯入口 — 澳大利亚最大内陆水道系统',
      '夕阳下乘船游湖',
    ],
    accommodation: {
      area: 'Lakes Entrance',
      airbnbUrl: 'https://www.airbnb.com/s/Lakes-Entrance--VIC--Australia/homes?checkin=2026-05-28&checkout=2026-05-29&adults=2',
      description: '湖边船屋或水景别墅',
    },
    charging: [
      { name: 'Coles Express Genoa', address: 'Princes Hwy, Genoa VIC 3891', type: 'petrol', distance: '途中 110km' },
      { name: 'NRMA Charging — Orbost', address: 'Orbost VIC 3888', type: 'ev', distance: '途中 150km' },
      { name: 'BP Lakes Entrance', address: 'Esplanade, Lakes Entrance VIC 3909', type: 'petrol', distance: '目的地' },
    ],
    color: '#F0A500',
    mapCenter: [-37.4, 148.8],
    mapZoom: 8,
  },
  {
    day: 8,
    date: '2026-05-29',
    dateLabel: '5月29日 周五',
    title: '威尔逊海角国家公园',
    subtitle: '澳大利亚大陆最南端 · 原始荒野',
    from: { name: '莱克斯入口', nameEn: 'Lakes Entrance', lat: -37.8800, lng: 147.9800 },
    to: { name: '威尔逊海角', nameEn: "Wilson's Promontory", lat: -38.9833, lng: 146.3667 },
    driveKm: 200,
    driveHours: 2.5,
    highlights: [
      '威尔逊海角 — 澳大利亚大陆最南端',
      'Squeaky Beach 沙滩踩出吱吱声',
      'Lilly Pilly Gully 热带雨林步道',
      '野生袋鼠、鸸鹋近距离接触',
      '夜晚极度黑暗 — 南十字星绝佳观测地',
    ],
    accommodation: {
      area: "Wilson's Promontory / Foster",
      airbnbUrl: "https://www.airbnb.com/s/Foster--VIC--Australia/homes?checkin=2026-05-29&checkout=2026-05-30&adults=2",
      description: '国家公园附近的 Foster 小镇，推荐农场风格住宿',
    },
    charging: [
      { name: 'NRMA Charging — Sale', address: 'Sale VIC 3850', type: 'ev', distance: '途中 80km' },
      { name: 'BP Yarram', address: 'Commercial Rd, Yarram VIC 3971', type: 'petrol', distance: '途中 130km' },
      { name: 'Foster Service Station', address: 'Main St, Foster VIC 3960', type: 'petrol', distance: '距公园 30km' },
    ],
    color: '#2ECC71',
    mapCenter: [-38.5, 147.0],
    mapZoom: 8,
  },
  {
    day: 9,
    date: '2026-05-30',
    dateLabel: '5月30日 周六',
    title: '菲利普岛 → 墨尔本',
    subtitle: '企鹅归巢 · 大洋路起点 · 抵达墨尔本',
    from: { name: '威尔逊海角', nameEn: "Wilson's Promontory", lat: -38.9833, lng: 146.3667 },
    to: { name: '墨尔本', nameEn: 'Melbourne CBD', lat: -37.8136, lng: 144.9631 },
    driveKm: 240,
    driveHours: 3.0,
    highlights: [
      '菲利普岛 (Phillip Island) — 小企鹅晚归表演 (需提前订票)',
      'Seal Rocks 海豹礁观景台',
      '进入墨尔本，市区入住',
      '联邦广场 & Flinders St 车站夜景',
      '南岸区 (Southbank) 晚餐',
    ],
    accommodation: {
      area: 'Melbourne CBD / Southbank',
      airbnbUrl: 'https://www.airbnb.com/s/Melbourne--VIC--Australia/homes?checkin=2026-05-30&checkout=2026-06-01&adults=2',
      description: '推荐 Southbank 或 Fitzroy，步行可达主要景点',
    },
    charging: [
      { name: 'Tesla Supercharger — Leongatha', address: 'Leongatha VIC 3953', type: 'ev', distance: '途中 90km' },
      { name: 'NRMA Charging — Phillip Island', address: 'Cowes VIC 3922', type: 'ev', distance: '途中 140km' },
      { name: 'Tesla Supercharger — Melbourne South', address: 'Southbank VIC 3006', type: 'ev', distance: '市区' },
    ],
    color: '#9B59B6',
    mapCenter: [-38.2, 145.8],
    mapZoom: 8,
  },
  {
    day: 10,
    date: '2026-05-31',
    dateLabel: '5月31日 周日',
    title: '墨尔本城市漫游',
    subtitle: '涂鸦巷 · 维多利亚市场 · 咖啡文化',
    from: { name: '墨尔本', nameEn: 'Melbourne CBD', lat: -37.8136, lng: 144.9631 },
    to: { name: '墨尔本', nameEn: 'Melbourne CBD', lat: -37.8136, lng: 144.9631 },
    driveKm: 20,
    driveHours: 0.5,
    highlights: [
      'Hosier Lane 涂鸦巷 — 墨尔本街头艺术圣地',
      'Queen Victoria Market 女王维多利亚市场',
      'Carlton Gardens & 皇家展览馆 (世界遗产)',
      'St Kilda 海滨 & 企鹅栖息地 (黄昏可见)',
      '墨尔本精品咖啡 & 夜市美食',
    ],
    accommodation: {
      area: 'Melbourne CBD',
      airbnbUrl: 'https://www.airbnb.com/s/Melbourne--VIC--Australia/homes?checkin=2026-05-31&checkout=2026-06-01&adults=2',
      description: '最后一晚，靠近机场或市区均可',
    },
    charging: [
      { name: 'Tesla Supercharger — Melbourne CBD', address: 'A\'Beckett St, Melbourne VIC 3000', type: 'ev', distance: '市区' },
      { name: 'EVIE Charging — QV Melbourne', address: 'Lonsdale St, Melbourne VIC 3000', type: 'ev', distance: '市区' },
    ],
    color: '#E74C3C',
    mapCenter: [-37.8136, 144.9631],
    mapZoom: 13,
  },
]

export const FULL_ROUTE_COORDS: [number, number][] = [
  [-33.9399, 151.1753],
  [-33.8688, 151.2093],
  [-33.7127, 150.3118],
  [-34.8764, 150.5986],
  [-35.1400, 150.7400],
  [-35.7076, 150.1721],
  [-36.2167, 150.0833],
  [-36.8967, 149.9050],
  [-37.5667, 149.7500],
  [-37.8800, 147.9800],
  [-38.9833, 146.3667],
  [-38.4833, 145.2333],
  [-37.8136, 144.9631],
]
