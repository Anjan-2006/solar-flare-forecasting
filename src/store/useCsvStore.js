import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCsvStore = create(
  persist(
    (set) => ({
      fileName: null,
      fileSize: null,
      csvPreview: null,
      result: null,
      explainability: null,
      
      setAnalysisState: (name, size, preview, res, exp) => set({
        fileName: name,
        fileSize: size,
        csvPreview: preview,
        result: res,
        explainability: exp
      }),
      
      clearAnalysis: () => set({
        fileName: null,
        fileSize: null,
        csvPreview: null,
        result: null,
        explainability: null
      })
    }),
    {
      name: 'helios-csv-storage',
    }
  )
);
