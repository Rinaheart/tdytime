import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotesState {
  /** Map of sessionId -> note content */
  notes: Record<string, string>;
  
  // Actions
  setNote: (id: string, content: string) => void;
  getNote: (id: string) => string;
  clearAllNotes: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      
      setNote: (id, content) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [id]: content
          }
        }));
      },
      
      getNote: (id) => {
        return get().notes[id] || '';
      },
      
      clearAllNotes: () => {
        set({ notes: {} });
      }
    }),
    {
      name: 'tdy_session_notes',
    }
  )
);
