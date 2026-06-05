import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FileEntry {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  mimeType?: string;
  modified: number;
}

interface Store {
  serverUrl: string | null;
  setServerUrl: (url: string) => void;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  breadcrumbs: string[];
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      serverUrl: null,
      setServerUrl: (url: string) => set({ serverUrl: url }),
      currentPath: 'documents',
      setCurrentPath: (path: string) => {
        set({ currentPath: path });
      },
      breadcrumbs: ['documents'],
    }),
    {
      name: 'explorer-store',
    }
  )
);
