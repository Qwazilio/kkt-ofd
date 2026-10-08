import type {TerminalEntity} from "../types.ts";
import {useTerminalStore} from "./store/useTerminalStore.ts";
import useSocket from "./useSocket.ts";

export default function useTerminal(){
    const socket = useSocket("terminal");
    const {terminals, setTerminals} = useTerminalStore();

    //Сортировка по дате окончания ФН
    const sortByFN = () => {
        const sortedList = terminals.toSorted((a: TerminalEntity, b: TerminalEntity) => {
            const endDateA = new Date(a.active_card?.end_date_card ?? 0);
            const endDateB = new Date(b.active_card?.end_date_card ?? 0);
            return endDateA.getTime() - endDateB.getTime();
        });
        setTerminals(sortedList);
    };

    //Сортировка по дате окончания подписки ОФД
    const sortBySub = () => {
        const sortedList = terminals.toSorted((a: TerminalEntity, b: TerminalEntity) => {
            const endDateA = new Date(a.end_date_sub ?? 0);
            const endDateB = new Date(b.end_date_sub ?? 0);
            return endDateA.getTime() - endDateB.getTime();
        });
        setTerminals(sortedList);
    };

    const initImport = () => {
        socket.emit('initImport')
    }

    const importTerminal = async (terminals: TerminalEntity[]): Promise<boolean> => {
        return new Promise((resolve) => {
            socket.emit('importTerminals', terminals, (response: boolean) => {
                console.log(response);
                resolve(response);
            })
        })
    }

    const updateTerminal = (terminal: TerminalEntity): Promise<boolean> => {
        return new Promise((resolve) => {
            socket.emit('updateTerminal', terminal, (response: boolean) => {
                console.log(`ККТ ${terminal.name_terminal} обработана сервером!`);
                resolve(response);
            })
        })
    }

    return {importKkt: importTerminal, updateTerminal: updateTerminal, sortByFN, sortBySub, initImport}
}