export const IMAGES = {
  // Real Authentic Photos (Wikimedia & Live Theater)
  allMembersStage: '/src/assets/images/real/all_members_animangaki2024.jpg',
  allMembersSalute: '/src/assets/images/real/all_members_seno_salute.jpg',
  allMembersFortuneCookie: '/src/assets/images/real/all_members_fortune_cookie.jpg',
  allMembersAitakatta: '/src/assets/images/real/all_members_aitakatta.jpg',
  freyaRealStage: '/src/assets/images/real/freya_stage.jpg',
  freyaRealHsf: '/src/assets/images/real/freya_hsf.jpg',
  freyaReal: '/src/assets/images/real/freya_real.jpg',
  graciaReal: '/src/assets/images/real/shania_gracia.jpg',
  graciaReal2: '/src/assets/images/real/shania_gracia2.jpg',
  zeeRealJikoshoukai: '/src/assets/images/real/zee_jikoshoukai_real.jpg',
  adelRealKitsune: '/src/assets/images/real/adel_kitsune_real.jpg',
  gitaFionyReal: '/src/assets/images/real/gita_fiony_real.jpg',
  mutheRealHsf: '/src/assets/images/real/muthe_hsf.jpg',
  zaraRealStage: '/src/assets/images/real/adhisty_zara.jpg',
  teaterReal: '/src/assets/images/real/teater_jkt48_real.jpg',
  teaterStage: '/src/assets/images/real/jkt48_theater.jpg',
  jkt48Logo: '/src/assets/images/real/jkt48_logo.png',

  // Official Merch visuals (Photopack, Concert Gear, Lightstick, CDs)
  heroStage: '/src/assets/images/jkt48_hero_stage_1791891934305.jpg',
  freyaPhotopack: '/src/assets/images/jkt48_freya_photopack_1791894893728.jpg',
  zeePhotopack: '/src/assets/images/jkt48_zee_photopack_1791894916317.jpg',
  christyPhotopack: '/src/assets/images/jkt48_christy_photopack_1791894939189.jpg',
  graciaPhotopack: '/src/assets/images/jkt48_gracia_photopack_1791894960976.jpg',
  annivTshirt: '/src/assets/images/jkt48_anniv_tshirt_1791894992130.jpg',
  lightstickReal: '/src/assets/images/jkt48_lightstick_real_1791895022075.jpg',
  magicHourCd: '/src/assets/images/jkt48_magic_hour_cd_1791895060973.jpg',
  standeeFreya: '/src/assets/images/jkt48_standee_freya_1791895097849.jpg',
  mufflerTowel: '/src/assets/images/jkt48_muffler_towel_1791895142575.jpg',
  uchiwaFan: '/src/assets/images/jkt48_uchiwa_fan_1791894032466.jpg',
  stageJacket: '/src/assets/images/jkt48_stage_jacket_1791892022755.jpg',
};

// Preset catalog for user / admin to easily import from official sources
export interface MerchPresetImage {
  id: string;
  title: string;
  category: 'Photocard' | 'T-Shirt' | 'Lightstick' | 'Album' | 'Accessories' | 'Stage';
  source: 'JKT48 Official' | 'Google Images / Wikimedia' | 'Concert Tour';
  imageUrl: string;
  member?: string;
  recommendedFor?: string;
}

export const OFFICIAL_MERCH_PRESETS: MerchPresetImage[] = [
  {
    id: 'p-all-members-live',
    title: 'Semua Member JKT48 (Live Konser Stage Real)',
    category: 'Stage',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/all_members_animangaki2024.jpg',
    member: 'All Member',
    recommendedFor: 'prod-anniv-tshirt'
  },
  {
    id: 'p-all-members-salute',
    title: 'Semua Member JKT48 (Seno Closing Salute Teater)',
    category: 'Stage',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/all_members_seno_salute.jpg',
    member: 'All Member',
    recommendedFor: 'prod-uchiwa-fan'
  },
  {
    id: 'p-all-members-fortune',
    title: 'Semua Member JKT48 (Koisuru Fortune Cookie Performance)',
    category: 'Stage',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/all_members_fortune_cookie.jpg',
    member: 'All Member'
  },
  {
    id: 'p-zee-jikoshoukai',
    title: 'Photopack Azizi Asadel / Zee (Live Jikoshoukai Real)',
    category: 'Photocard',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/zee_jikoshoukai_real.jpg',
    member: 'Azizi Asadel (Zee)',
    recommendedFor: 'prod-zee-photopack'
  },
  {
    id: 'p-freya-hsf',
    title: 'Photopack Freya Jayawardana (Official Joy Kick Tears HSF)',
    category: 'Photocard',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/freya_hsf.jpg',
    member: 'Freya Jayawardana',
    recommendedFor: 'prod-freya-photopack'
  },
  {
    id: 'p-freya-stage',
    title: 'Photopack Freya Jayawardana (Special Stage Uniform)',
    category: 'Photocard',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/freya_stage.jpg',
    member: 'Freya Jayawardana'
  },
  {
    id: 'p-gracia-captain',
    title: 'Photopack Shania Gracia (Captain Theater Costume)',
    category: 'Photocard',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/shania_gracia.jpg',
    member: 'Shania Gracia',
    recommendedFor: 'prod-gracia-photopack'
  },
  {
    id: 'p-zee-merch',
    title: 'Photopack Azizi Asadel / Zee (Flying High Glitter Pack)',
    category: 'Photocard',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_zee_photopack_1791894916317.jpg',
    member: 'Azizi Asadel (Zee)',
    recommendedFor: 'prod-zee-photopack'
  },
  {
    id: 'p-christy-merch',
    title: 'Photopack Angelina Christy (Cara Meminum Ramune Stage)',
    category: 'Photocard',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_christy_photopack_1791894939189.jpg',
    member: 'Angelina Christy',
    recommendedFor: 'prod-christy-photopack'
  },
  {
    id: 'p-muthe-hsf',
    title: 'Photopack Mutiara Azzahra (Muthe) Handshake Edition',
    category: 'Photocard',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/muthe_hsf.jpg',
    member: 'Mutiara Azzahra'
  },
  {
    id: 'p-zara-stage',
    title: 'Photopack Adhisty Zara (Stage Seifuku Collector)',
    category: 'Photocard',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/adhisty_zara.jpg',
    member: 'Adhisty Zara'
  },
  {
    id: 'p-tshirt-13th',
    title: 'Kaos Konser JKT48 13th Anniversary "Wonder Gala" (Kaos Hitam)',
    category: 'T-Shirt',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_anniv_tshirt_1791894992130.jpg',
    member: 'All Member',
    recommendedFor: 'prod-anniv-tshirt'
  },
  {
    id: 'p-lightstick-15led',
    title: 'JKT48 Official Sticklight / Penlight Konser 15 LED',
    category: 'Lightstick',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_lightstick_real_1791895022075.jpg',
    member: 'All Member',
    recommendedFor: 'prod-lightstick-13th'
  },
  {
    id: 'p-magichour-box',
    title: 'JKT48 26th Single "Magic Hour" Deluxe Boxset CD+DVD',
    category: 'Album',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_magic_hour_cd_1791895060973.jpg',
    member: 'Shani, Zee, Christy, Freya',
    recommendedFor: 'prod-magichour-box'
  },
  {
    id: 'p-freya-standee',
    title: 'Official Acrylic Standee Member Freya Jayawardana',
    category: 'Accessories',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_standee_freya_1791895097849.jpg',
    member: 'Freya Jayawardana',
    recommendedFor: 'prod-freya-standee'
  },
  {
    id: 'p-muffler-towel',
    title: 'Official Muffler Towel / Handuk Konser JKT48 Theater Merah Putih',
    category: 'Accessories',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_muffler_towel_1791895142575.jpg',
    member: 'All Member',
    recommendedFor: 'prod-muffler-towel'
  },
  {
    id: 'p-uchiwa-fan',
    title: 'Official Big Uchiwa Concert Fan JKT48 Senbatsu',
    category: 'Accessories',
    source: 'JKT48 Official',
    imageUrl: '/src/assets/images/jkt48_uchiwa_fan_1791894032466.jpg',
    member: 'All Member',
    recommendedFor: 'prod-uchiwa-fan'
  },
  {
    id: 'p-theater-stage',
    title: 'Teater JKT48 FX Sudirman Official Stage & Seating',
    category: 'Stage',
    source: 'Google Images / Wikimedia',
    imageUrl: '/src/assets/images/real/teater_jkt48_real.jpg',
    member: 'All Member'
  }
];
