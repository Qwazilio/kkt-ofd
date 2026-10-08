import { create } from "zustand"
import type {TerminalEntity} from "../../types.ts";

interface TerminalContext {
    terminals: TerminalEntity[] |[]
    setTerminals: (newMessages: TerminalEntity[] | ((prev: TerminalEntity[]) => TerminalEntity[])) => void
    filteredTerminals: TerminalEntity[] | []
    setFilteredTerminals: (newMessages: TerminalEntity[] | ((prev: TerminalEntity[]) => TerminalEntity[])) => void
    filter: string
    setFilter: (newFilter: string) => void
    isShowStock: boolean
    setIsShowStock: (changed: boolean) => void
    isShowDrop: boolean
    setIsShowDrop: (changed: boolean) => void
}

export const useTerminalStore = create<TerminalContext>((set) => ({
    terminals: [],
    setTerminals: (data) => {
        if (typeof data === 'function') {
            set((state) => ({ terminals: data(state.terminals) }));
        } else {
            set({ terminals: data });
        }
    },
    filteredTerminals: [],
    setFilteredTerminals: (data) => {
        if (typeof data === 'function') {
            set((state) => ({ filteredTerminals: data(state.filteredTerminals) }));
        } else {
            set({ filteredTerminals: data });
        }
    },
    filter: "",
    setFilter: (newFilter) => set({filter: newFilter}),
    isShowStock: false,
    setIsShowStock: (changed) => set({isShowStock: changed}),
    isShowDrop: false,
    setIsShowDrop: (changed) => set({isShowDrop: changed}),
}))