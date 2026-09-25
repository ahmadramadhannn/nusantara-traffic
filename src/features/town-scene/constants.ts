import { Landmark, RoadNode, RoadSegment } from '../../types';

export const ROAD_WIDTH = 7.0; // 3.5m per lane (2 lanes bidirectional)
export const SIDEWALK_WIDTH = 2.0;

export const TOWN_BOUNDS = {
  minX: -105,
  maxX: 105,
  minZ: -95,
  maxZ: 95,
};

// Key Intersection & Boundary Nodes
export const TOWN_NODES: Record<string, RoadNode> = {
  // Sudirman Road (West to East, Z = -25)
  'sudirman_w': { id: 'sudirman_w', x: -100, z: -25, name: 'Ujung Barat Jl. Sudirman' },
  'int_nw': { id: 'int_nw', x: -35, z: -25, name: 'Simpang Empat Sudirman - Merdeka', isIntersection: true },
  'int_ne': { id: 'int_ne', x: 35, z: -25, name: 'Simpang Empat Sudirman - Diponegoro', isIntersection: true },
  'sudirman_e': { id: 'sudirman_e', x: 100, z: -25, name: 'Ujung Timur Jl. Sudirman' },

  // Kartini Road (West to East, Z = 35)
  'kartini_w': { id: 'kartini_w', x: -100, z: 35, name: 'Ujung Barat Jl. Kartini' },
  'int_sw': { id: 'int_sw', x: -35, z: 35, name: 'Simpang Empat Kartini - Merdeka', isIntersection: true },
  'int_se': { id: 'int_se', x: 35, z: 35, name: 'Simpang Empat Kartini - Diponegoro', isIntersection: true },
  'kartini_e': { id: 'kartini_e', x: 100, z: 35, name: 'Ujung Timur Jl. Kartini' },

  // Merdeka Road (North to South, X = -35)
  'merdeka_n': { id: 'merdeka_n', x: -35, z: -90, name: 'Ujung Utara Jl. Merdeka' },
  'merdeka_s': { id: 'merdeka_s', x: -35, z: 90, name: 'Ujung Selatan Jl. Merdeka' },

  // Diponegoro Road (North to South, X = 35)
  'diponegoro_n': { id: 'diponegoro_n', x: 35, z: -90, name: 'Ujung Utara Jl. Diponegoro' },
  'diponegoro_s': { id: 'diponegoro_s', x: 35, z: 90, name: 'Ujung Selatan Jl. Diponegoro' },
};

// 4 Main Streets in the Indonesian Small Town
export const STREET_DEFINITIONS = [
  {
    id: 'street_sudirman',
    name: 'Jl. Jenderal Sudirman',
    indonesianType: 'Jalan Protokol / Boulevard Utama',
    speedLimit: 40,
    cameraView: { position: [0, 4, -25] as [number, number, number], target: [80, 2, -25] as [number, number, number] },
    description: 'Pusat pemerintahan kota, melewati Alun-Alun dan Masjid Agung.',
  },
  {
    id: 'street_merdeka',
    name: 'Jl. Merdeka',
    indonesianType: 'Koridor Pendidikan & Pemukiman',
    speedLimit: 35,
    cameraView: { position: [-35, 4, -80] as [number, number, number], target: [-35, 2, 60] as [number, number, number] },
    description: 'Akses utama anak sekolah ke SD & SMP Negeri serta warga Perumahan Griya Asri.',
  },
  {
    id: 'street_diponegoro',
    name: 'Jl. Diponegoro',
    indonesianType: 'Koridor Niaga & Terminal Transit',
    speedLimit: 35,
    cameraView: { position: [35, 4, -80] as [number, number, number], target: [35, 2, 60] as [number, number, number] },
    description: 'Jalur sibuk pertokoan ruko, RSUD, dan Terminal Angkot.',
  },
  {
    id: 'street_kartini',
    name: 'Jl. R.A. Kartini',
    indonesianType: 'Jalan Lingkar Pasar & Stasiun',
    speedLimit: 30,
    cameraView: { position: [-80, 4, 35] as [number, number, number], target: [70, 2, 35] as [number, number, number] },
    description: 'Pusat keramaian Pasar Tradisional dan akses Stasiun Kereta Api.',
  },
];

// Road directional segments (Edges for vehicle routing)
export const ROAD_SEGMENTS: RoadSegment[] = [
  // Jl. Sudirman - Eastbound (Z = -25, x increases, lane offset z = -25 + 1.75)
  { id: 'sudirman_w_to_nw', name: 'Jl. Sudirman (Barat - Merdeka)', fromNodeId: 'sudirman_w', toNodeId: 'int_nw', length: 65, lanes: 1, speedLimit: 40 },
  { id: 'sudirman_nw_to_ne', name: 'Jl. Sudirman (Merdeka - Diponegoro)', fromNodeId: 'int_nw', toNodeId: 'int_ne', length: 70, lanes: 1, speedLimit: 40 },
  { id: 'sudirman_ne_to_e', name: 'Jl. Sudirman (Diponegoro - Timur)', fromNodeId: 'int_ne', toNodeId: 'sudirman_e', length: 65, lanes: 1, speedLimit: 40 },

  // Jl. Sudirman - Westbound (Z = -25, x decreases, lane offset z = -25 - 1.75)
  { id: 'sudirman_e_to_ne', name: 'Jl. Sudirman (Timur - Diponegoro)', fromNodeId: 'sudirman_e', toNodeId: 'int_ne', length: 65, lanes: 1, speedLimit: 40 },
  { id: 'sudirman_ne_to_nw', name: 'Jl. Sudirman (Diponegoro - Merdeka)', fromNodeId: 'int_ne', toNodeId: 'int_nw', length: 70, lanes: 1, speedLimit: 40 },
  { id: 'sudirman_nw_to_w', name: 'Jl. Sudirman (Merdeka - Barat)', fromNodeId: 'int_nw', toNodeId: 'sudirman_w', length: 65, lanes: 1, speedLimit: 40 },

  // Jl. Kartini - Eastbound (Z = 35, x increases)
  { id: 'kartini_w_to_sw', name: 'Jl. Kartini (Barat - Merdeka)', fromNodeId: 'kartini_w', toNodeId: 'int_sw', length: 65, lanes: 1, speedLimit: 30 },
  { id: 'kartini_sw_to_se', name: 'Jl. Kartini (Merdeka - Diponegoro)', fromNodeId: 'int_sw', toNodeId: 'int_se', length: 70, lanes: 1, speedLimit: 30 },
  { id: 'kartini_se_to_e', name: 'Jl. Kartini (Diponegoro - Timur)', fromNodeId: 'int_se', toNodeId: 'kartini_e', length: 65, lanes: 1, speedLimit: 30 },

  // Jl. Kartini - Westbound (Z = 35, x decreases)
  { id: 'kartini_e_to_se', name: 'Jl. Kartini (Timur - Diponegoro)', fromNodeId: 'kartini_e', toNodeId: 'int_se', length: 65, lanes: 1, speedLimit: 30 },
  { id: 'kartini_se_to_sw', name: 'Jl. Kartini (Diponegoro - Merdeka)', fromNodeId: 'int_se', toNodeId: 'int_sw', length: 70, lanes: 1, speedLimit: 30 },
  { id: 'kartini_sw_to_w', name: 'Jl. Kartini (Merdeka - Barat)', fromNodeId: 'int_sw', toNodeId: 'kartini_w', length: 65, lanes: 1, speedLimit: 30 },

  // Jl. Merdeka - Southbound (X = -35, z increases)
  { id: 'merdeka_n_to_nw', name: 'Jl. Merdeka (Utara - Sudirman)', fromNodeId: 'merdeka_n', toNodeId: 'int_nw', length: 65, lanes: 1, speedLimit: 35 },
  { id: 'merdeka_nw_to_sw', name: 'Jl. Merdeka (Sudirman - Kartini)', fromNodeId: 'int_nw', toNodeId: 'int_sw', length: 60, lanes: 1, speedLimit: 35 },
  { id: 'merdeka_sw_to_s', name: 'Jl. Merdeka (Kartini - Selatan)', fromNodeId: 'int_sw', toNodeId: 'merdeka_s', length: 55, lanes: 1, speedLimit: 35 },

  // Jl. Merdeka - Northbound (X = -35, z decreases)
  { id: 'merdeka_s_to_sw', name: 'Jl. Merdeka (Selatan - Kartini)', fromNodeId: 'merdeka_s', toNodeId: 'int_sw', length: 55, lanes: 1, speedLimit: 35 },
  { id: 'merdeka_sw_to_nw', name: 'Jl. Merdeka (Kartini - Sudirman)', fromNodeId: 'int_sw', toNodeId: 'int_nw', length: 60, lanes: 1, speedLimit: 35 },
  { id: 'merdeka_nw_to_n', name: 'Jl. Merdeka (Sudirman - Utara)', fromNodeId: 'int_nw', toNodeId: 'merdeka_n', length: 65, lanes: 1, speedLimit: 35 },

  // Jl. Diponegoro - Southbound (X = 35, z increases)
  { id: 'diponegoro_n_to_ne', name: 'Jl. Diponegoro (Utara - Sudirman)', fromNodeId: 'diponegoro_n', toNodeId: 'int_ne', length: 65, lanes: 1, speedLimit: 35 },
  { id: 'diponegoro_ne_to_se', name: 'Jl. Diponegoro (Sudirman - Kartini)', fromNodeId: 'int_ne', toNodeId: 'int_se', length: 60, lanes: 1, speedLimit: 35 },
  { id: 'diponegoro_se_to_s', name: 'Jl. Diponegoro (Kartini - Selatan)', fromNodeId: 'int_se', toNodeId: 'diponegoro_s', length: 55, lanes: 1, speedLimit: 35 },

  // Jl. Diponegoro - Northbound (X = 35, z decreases)
  { id: 'diponegoro_s_to_se', name: 'Jl. Diponegoro (Selatan - Kartini)', fromNodeId: 'diponegoro_s', toNodeId: 'int_se', length: 55, lanes: 1, speedLimit: 35 },
  { id: 'diponegoro_se_to_ne', name: 'Jl. Diponegoro (Kartini - Sudirman)', fromNodeId: 'int_se', toNodeId: 'int_ne', length: 60, lanes: 1, speedLimit: 35 },
  { id: 'diponegoro_ne_to_n', name: 'Jl. Diponegoro (Sudirman - Utara)', fromNodeId: 'int_ne', toNodeId: 'diponegoro_n', length: 65, lanes: 1, speedLimit: 35 },
];

// Indonesian Town Landmarks
export const TOWN_LANDMARKS: Landmark[] = [
  {
    id: 'school_sdn01',
    name: 'SD Negeri 01 & SMP Sukamaju',
    category: 'education',
    position: [-55, 0, -60],
    roadId: 'merdeka_n_to_nw',
    description: 'Sekolah dasar dan menengah favorit warga. Ratusan murid diantar jemput setiap pagi.',
    iconName: 'GraduationCap',
  },
  {
    id: 'alun_alun',
    name: 'Alun-Alun & Masjid Agung',
    category: 'civic',
    position: [0, 0, -50],
    roadId: 'sudirman_nw_to_ne',
    description: 'Pusat jantung kota dengan ruang terbuka hijau, menara masjid, dan pohon beringin kembar.',
    iconName: 'Trees',
  },
  {
    id: 'pasar_tradisional',
    name: 'Pasar Tradisional Sukamaju',
    category: 'market',
    position: [-55, 0, 55],
    roadId: 'kartini_w_to_sw',
    description: 'Pusat belanja sayur, warung kelontong, dan kuliner pagi yang ramai pedagang.',
    iconName: 'Store',
  },
  {
    id: 'terminal_angkot',
    name: 'Terminal Angkot & Halte Bus',
    category: 'transit',
    position: [55, 0, 5],
    roadId: 'diponegoro_ne_to_se',
    description: 'Hub transportasi umum antar desa dan rute kota dengan armada angkot biru dan bus feeder.',
    iconName: 'Bus',
  },
  {
    id: 'perumahan_griya',
    name: 'Perumahan Griya Asri Sukamaju',
    category: 'residential',
    position: [-75, 0, -20],
    roadId: 'sudirman_w_to_nw',
    description: 'Kawasan pemukiman keluarga pekerja dan pegawai kantor.',
    iconName: 'Home',
  },
  {
    id: 'rsud_hospital',
    name: 'RSUD / Puskesmas Sentral',
    category: 'healthcare',
    position: [55, 0, 60],
    roadId: 'kartini_se_to_e',
    description: 'Layanan gawat darurat dan kesehatan warga yang membutuhkan akses jalan lancar tanpa macet.',
    iconName: 'HeartPulse',
  },
];

// Node adjacency graph for pathfinding
export const NODE_CONNECTIONS: Record<string, string[]> = {
  'sudirman_w': ['int_nw'],
  'int_nw': ['sudirman_w', 'int_ne', 'merdeka_n', 'int_sw'],
  'int_ne': ['int_nw', 'sudirman_e', 'diponegoro_n', 'int_se'],
  'sudirman_e': ['int_ne'],

  'kartini_w': ['int_sw'],
  'int_sw': ['kartini_w', 'int_se', 'int_nw', 'merdeka_s'],
  'int_se': ['int_sw', 'kartini_e', 'int_ne', 'diponegoro_s'],
  'kartini_e': ['int_se'],

  'merdeka_n': ['int_nw'],
  'merdeka_s': ['int_sw'],

  'diponegoro_n': ['int_ne'],
  'diponegoro_s': ['int_se'],
};
