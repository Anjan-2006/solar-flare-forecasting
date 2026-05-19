import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLiveStore = create(
  persist(
    (set) => ({
      data: null,
      explainability: null,
      lastUpdated: null,
      history: {
        prob: [],
        xrs: [],
        bz: [],
        flow: []
      },
      
      updateTelemetry: (newData, newExplainability) => set((state) => {
        const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Append history without resetting
        const newProb = [...state.history.prob, { time: t, value: newData.probability * 100 }];
        const newXrs = [...state.history.xrs, { time: t, value: newData.latest_conditions?.xrsb_flux || 0 }];
        const newBz = [...state.history.bz, { time: t, value: newData.latest_conditions?.Bz || 0 }];
        const newFlow = [...state.history.flow, { time: t, value: newData.latest_conditions?.flow_speed || 0 }];
        
        // Keep last 30 data points (e.g. 30 minutes of 1-min polling)
        if (newProb.length > 30) newProb.shift();
        if (newXrs.length > 30) newXrs.shift();
        if (newBz.length > 30) newBz.shift();
        if (newFlow.length > 30) newFlow.shift();
        
        return {
          data: newData,
          explainability: newExplainability,
          lastUpdated: new Date().getTime(),
          history: {
            prob: newProb,
            xrs: newXrs,
            bz: newBz,
            flow: newFlow
          }
        };
      }),

      clearTelemetry: () => set({
        data: null,
        explainability: null,
        lastUpdated: null,
        history: { prob: [], xrs: [], bz: [], flow: [] }
      })
    }),
    {
      name: 'helios-live-storage',
    }
  )
);
