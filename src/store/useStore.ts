import create from 'zustand';

export const useStore = create((set) => ({
  patients: [],
  setPatients: (patients: unknown) => set({ patients }),
  prescriptions: [],
  setPrescriptions: (prescriptions: never) => set({ prescriptions }),
}));