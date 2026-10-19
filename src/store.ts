import { create } from 'zustand';

export type SceneMode = 'none' | 'hero' | 'face' | 'care' | 'journey';

interface ExperienceState {
  scene: SceneMode;
  faceRotation: number;
  selectedZone: string;
  pointer: [number, number];
  journeyProgress: number;
  heroMorph: number;
  careProgress: number;
  setScene: (scene: SceneMode) => void;
  setZone: (zone: string) => void;
  setFaceRotation: (value: number) => void;
  setPointer: (position: [number, number]) => void;
  setJourneyProgress: (value: number) => void;
  setHeroMorph: (value: number) => void;
  setCareProgress: (value: number) => void;
}

export const useExperience = create<ExperienceState>((set) => ({
  scene: 'none',
  faceRotation: 0,
  selectedZone: 'maças',
  pointer: [0, 0],
  journeyProgress: 0,
  heroMorph: 0,
  careProgress: 0,
  setScene: (scene) => set({ scene }),
  setZone: (selectedZone) => set({ selectedZone }),
  setFaceRotation: (faceRotation) => set({ faceRotation: Math.max(-1.0, Math.min(1.0, faceRotation)) }),
  setPointer: (pointer) => set({ pointer }),
  setJourneyProgress: (journeyProgress) => set({ journeyProgress }),
  setHeroMorph: (heroMorph) => set({ heroMorph }),
  setCareProgress: (careProgress) => set({ careProgress }),
}));
