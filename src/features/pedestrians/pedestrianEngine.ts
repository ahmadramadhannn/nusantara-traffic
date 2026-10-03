import { Pedestrian, TrafficLightState } from '../../types';

export interface CrosswalkLocation {
  id: string;
  name: string;
  intersectionId: string;
  startPos: [number, number, number];
  targetPos: [number, number, number];
  angle: number; // yaw angle in radians
  pelicanPos: [number, number, number];
  roadOrientation: 'EW' | 'NS'; // whether crosswalk traverses an EW road or NS road
}

export const CROSSWALK_LOCATIONS: CrosswalkLocation[] = [
  // 1. Simpang Sudirman - Merdeka (NW, center [-35, -25])
  {
    id: 'cw_nw_west',
    name: 'Zebra Cross Barat (SDN 01 Sukamaju)',
    intersectionId: 'int_nw',
    startPos: [-40.5, 0.25, -29.2],
    targetPos: [-40.5, 0.25, -20.8],
    angle: 0,
    pelicanPos: [-42.2, 0, -29.5],
    roadOrientation: 'EW',
  },
  {
    id: 'cw_nw_north',
    name: 'Zebra Cross Utara (Balai Kota)',
    intersectionId: 'int_nw',
    startPos: [-39.2, 0.25, -30.5],
    targetPos: [-30.8, 0.25, -30.5],
    angle: Math.PI / 2,
    pelicanPos: [-39.5, 0, -32.2],
    roadOrientation: 'NS',
  },

  // 2. Simpang Sudirman - Diponegoro (NE, center [35, -25])
  {
    id: 'cw_ne_east',
    name: 'Zebra Cross Timur (Pasar Tradisional)',
    intersectionId: 'int_ne',
    startPos: [40.5, 0.25, -20.8],
    targetPos: [40.5, 0.25, -29.2],
    angle: Math.PI,
    pelicanPos: [42.2, 0, -20.5],
    roadOrientation: 'EW',
  },
  {
    id: 'cw_ne_south',
    name: 'Zebra Cross Selatan (Masjid Agung)',
    intersectionId: 'int_ne',
    startPos: [39.2, 0.25, -19.5],
    targetPos: [30.8, 0.25, -19.5],
    angle: -Math.PI / 2,
    pelicanPos: [39.5, 0, -17.8],
    roadOrientation: 'NS',
  },

  // 3. Simpang Kartini - Merdeka (SW, center [-35, 35])
  {
    id: 'cw_sw_west',
    name: 'Zebra Cross Barat (RSUD Sukamaju)',
    intersectionId: 'int_sw',
    startPos: [-40.5, 0.25, 30.8],
    targetPos: [-40.5, 0.25, 39.2],
    angle: 0,
    pelicanPos: [-42.2, 0, 30.5],
    roadOrientation: 'EW',
  },
  {
    id: 'cw_sw_north',
    name: 'Zebra Cross Utara (Apotek & Poliklinik)',
    intersectionId: 'int_sw',
    startPos: [-39.2, 0.25, 29.5],
    targetPos: [-30.8, 0.25, 29.5],
    angle: Math.PI / 2,
    pelicanPos: [-39.5, 0, 27.8],
    roadOrientation: 'NS',
  },

  // 4. Simpang Kartini - Diponegoro (SE, center [35, 35])
  {
    id: 'cw_se_east',
    name: 'Zebra Cross Timur (Terminal Bus & Angkot)',
    intersectionId: 'int_se',
    startPos: [40.5, 0.25, 39.2],
    targetPos: [40.5, 0.25, 30.8],
    angle: Math.PI,
    pelicanPos: [42.2, 0, 39.5],
    roadOrientation: 'EW',
  },
  {
    id: 'cw_se_south',
    name: 'Zebra Cross Selatan (Pangkalan Ojek & Kios)',
    intersectionId: 'int_se',
    startPos: [39.2, 0.25, 40.5],
    targetPos: [30.8, 0.25, 40.5],
    angle: -Math.PI / 2,
    pelicanPos: [39.5, 0, 42.2],
    roadOrientation: 'NS',
  },
];

export function createInitialPedestrians(): Pedestrian[] {
  return [
    {
      id: 'ped_sdn_budi',
      intersectionId: 'int_nw',
      crosswalkId: 'cw_nw_west',
      startPos: [-40.5, 0.25, -29.2],
      targetPos: [-40.5, 0.25, -20.8],
      position: [-40.5, 0.25, -29.2],
      rotation: 0,
      progress: 0,
      speed: 1.35,
      status: 'waiting',
      type: 'student',
      label: 'Budi (Siswa SDN 01)',
      color: '#DC2626', // Red uniform
      waitingTime: 2.0,
    },
    {
      id: 'ped_balaikota_siti',
      intersectionId: 'int_nw',
      crosswalkId: 'cw_nw_north',
      startPos: [-39.2, 0.25, -30.5],
      targetPos: [-30.8, 0.25, -30.5],
      position: [-39.2, 0.25, -30.5],
      rotation: Math.PI / 2,
      progress: 0,
      speed: 1.25,
      status: 'waiting',
      type: 'citizen',
      label: 'Ibu Siti (Warga Balai Kota)',
      color: '#0284C7',
      waitingTime: 3.5,
    },
    {
      id: 'ped_pasar_wati',
      intersectionId: 'int_ne',
      crosswalkId: 'cw_ne_east',
      startPos: [40.5, 0.25, -20.8],
      targetPos: [40.5, 0.25, -29.2],
      position: [40.5, 0.25, -20.8],
      rotation: Math.PI,
      progress: 0,
      speed: 1.2,
      status: 'waiting',
      type: 'citizen',
      label: 'Ibu Wati (Pedagang Pasar Baru)',
      color: '#D97706',
      waitingTime: 4.0,
    },
    {
      id: 'ped_masjid_ahmad',
      intersectionId: 'int_ne',
      crosswalkId: 'cw_ne_south',
      startPos: [39.2, 0.25, -19.5],
      targetPos: [30.8, 0.25, -19.5],
      position: [39.2, 0.25, -19.5],
      rotation: -Math.PI / 2,
      progress: 0,
      speed: 1.1,
      status: 'waiting',
      type: 'citizen',
      label: 'Pak Ahmad (Jamaah Masjid Agung)',
      color: '#059669',
      waitingTime: 1.5,
    },
    {
      id: 'ped_rsud_joko',
      intersectionId: 'int_sw',
      crosswalkId: 'cw_sw_west',
      startPos: [-40.5, 0.25, 30.8],
      targetPos: [-40.5, 0.25, 39.2],
      position: [-40.5, 0.25, 30.8],
      rotation: 0,
      progress: 0,
      speed: 0.95,
      status: 'waiting',
      type: 'elderly',
      label: 'Pak Joko (Pasien RSUD Sukamaju)',
      color: '#475569',
      waitingTime: 3.0,
    },
    {
      id: 'ped_rsud_maya',
      intersectionId: 'int_sw',
      crosswalkId: 'cw_sw_north',
      startPos: [-39.2, 0.25, 29.5],
      targetPos: [-30.8, 0.25, 29.5],
      position: [-39.2, 0.25, 29.5],
      rotation: Math.PI / 2,
      progress: 0,
      speed: 1.4,
      status: 'waiting',
      type: 'citizen',
      label: 'Suster Maya (Perawat RSUD)',
      color: '#E11D48',
      waitingTime: 2.2,
    },
    {
      id: 'ped_term_doni',
      intersectionId: 'int_se',
      crosswalkId: 'cw_se_east',
      startPos: [40.5, 0.25, 39.2],
      targetPos: [40.5, 0.25, 30.8],
      position: [40.5, 0.25, 39.2],
      rotation: Math.PI,
      progress: 0,
      speed: 1.45,
      status: 'waiting',
      type: 'citizen',
      label: 'Doni (Komuter Terminal Bus)',
      color: '#4F46E5',
      waitingTime: 1.8,
    },
    {
      id: 'ped_term_eko',
      intersectionId: 'int_se',
      crosswalkId: 'cw_se_south',
      startPos: [39.2, 0.25, 40.5],
      targetPos: [30.8, 0.25, 40.5],
      position: [39.2, 0.25, 40.5],
      rotation: -Math.PI / 2,
      progress: 0,
      speed: 1.3,
      status: 'waiting',
      type: 'citizen',
      label: 'Mas Eko (Penumpang Angkot)',
      color: '#CA8A04',
      waitingTime: 4.5,
    },
  ];
}

export function stepPedestriansSimulation(
  pedestrians: Pedestrian[],
  trafficLights: Record<string, TrafficLightState>,
  deltaTime: number
): {
  updatedPedestrians: Pedestrian[];
  updatedTrafficLights: Record<string, TrafficLightState>;
} {
  const nextLights = { ...trafficLights };
  const updatedPedestrians: Pedestrian[] = [];

  for (const ped of pedestrians) {
    const p = { ...ped };
    const light = nextLights[p.intersectionId];

    const dx = p.targetPos[0] - p.startPos[0];
    const dz = p.targetPos[2] - p.startPos[2];
    const totalDist = Math.hypot(dx, dz) || 8.4;

    if (p.status === 'waiting') {
      p.waitingTime += deltaTime;

      // Realistic autonomous pedestrian push-button trigger:
      // If waiting for >= 8.0s at the curb during green traffic, press the Pelican call button!
      if (
        p.waitingTime >= 8.0 &&
        light &&
        light.fsmState !== 'PEDESTRIAN_CROSSING' &&
        !light.pedestrianCallActive &&
        light.mode === 'auto'
      ) {
        nextLights[p.intersectionId] = {
          ...light,
          pedestrianCallActive: true,
        };
      }

      // Check if light is in WALK phase
      if (light && light.pedestrianSignal === 'WALK') {
        p.status = 'crossing';
        p.progress = 0;
        p.rotation = Math.atan2(dx, dz);
      }
    } else if (p.status === 'crossing') {
      p.progress += (deltaTime * p.speed) / totalDist;

      if (p.progress >= 1.0) {
        p.progress = 1.0;
        p.status = 'crossed';
        p.waitingTime = 0;
        p.position = [...p.targetPos];
      } else {
        p.position = [
          p.startPos[0] + dx * p.progress,
          p.startPos[1],
          p.startPos[2] + dz * p.progress,
        ];
        p.rotation = Math.atan2(dx, dz);
      }
    } else if (p.status === 'crossed') {
      p.waitingTime += deltaTime;
      // After staying on the sidewalk for 10 seconds, turn around and prepare to cross back
      if (p.waitingTime > 10.0) {
        const oldStart = [...p.startPos] as [number, number, number];
        p.startPos = [...p.targetPos];
        p.targetPos = oldStart;
        const newDx = p.targetPos[0] - p.startPos[0];
        const newDz = p.targetPos[2] - p.startPos[2];
        p.progress = 0;
        p.status = 'waiting';
        p.waitingTime = 0;
        p.rotation = Math.atan2(newDx, newDz);
      }
    }

    updatedPedestrians.push(p);
  }

  return {
    updatedPedestrians,
    updatedTrafficLights: nextLights,
  };
}
