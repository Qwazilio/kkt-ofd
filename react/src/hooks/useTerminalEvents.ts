import {useEffect} from "react";
import {toast} from "react-toastify";
import type {TerminalEntity} from "../types.ts";
import {useTerminalStore} from "./store/useTerminalStore.ts";
import useSocket from "./useSocket.ts";

export default function useTerminalEvents() {
    const socket = useSocket("terminal");
    const { setTerminals } = useTerminalStore();

    useEffect(() => {

        socket.on("terminalList", (terminals: TerminalEntity[]) => {
            setTerminals(terminals.toSorted((a: TerminalEntity, b: TerminalEntity) => {
                const endDateA = new Date(a?.active_card?.end_date_card ?? 0);
                const endDateB = new Date(b?.active_card?.end_date_card ?? 0);
                return endDateA.getTime() - endDateB.getTime()
            }));
            toast.success("Список ККТ обновлен")
        });

        socket.on("terminalUpdated", (terminal: TerminalEntity) => {
            toast.success(`ККТ ${terminal.name_terminal} обновлена!`);
            setTerminals((prev) => {
                const index = prev.findIndex(item => item.id === terminal.id);
                if (index !== -1) {
                    const updatedTerminal = [...prev];
                    updatedTerminal[index] = terminal;
                    return updatedTerminal;
                }
                return prev;
            });
        });

        socket.on("importInfo", (status: string) => {
            toast.success(status)
        });

        return () => {
            socket.off("terminalList");
            socket.off("terminalUpdated");
            socket.off("importInfo");
        };
    }, [socket]);

    return {};
}