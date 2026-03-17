import type { Player } from "@quizio/common/types/game";
import type { StatusDataMap } from "@quizio/common/types/game/status";
import {
  createStatus,
  type Status,
} from "@quizio/web/features/game/utils/createStatus";
import { create } from "zustand";

type ManagerStore<T> = {
  gameId: string | null;
  status: Status<T> | null;
  players: Player[];
  answeredPlayers: { playerId: string; username: string }[];

  setGameId: (_gameId: string | null) => void;
  setStatus: <K extends keyof T>(_name: K, _data: T[K]) => void;
  resetStatus: () => void;
  setPlayers: (_players: Player[]) => void;
  addAnsweredPlayer: (_data: { playerId: string; username: string }) => void;
  clearAnsweredPlayers: () => void;

  reset: () => void;
};

const initialState = {
  gameId: null,
  status: null,
  players: [],
  answeredPlayers: [],
};

export const useManagerStore = create<ManagerStore<StatusDataMap>>((set) => ({
  ...initialState,

  setGameId: (gameId) => set({ gameId }),

  setStatus: (name, data) =>
    set({ status: createStatus(name, data), answeredPlayers: [] }),
  resetStatus: () => set({ status: null }),

  setPlayers: (players) => set({ players }),

  addAnsweredPlayer: (data) =>
    set((state) => ({ answeredPlayers: [...state.answeredPlayers, data] })),
  clearAnsweredPlayers: () => set({ answeredPlayers: [] }),

  reset: () => set(initialState),
}));
