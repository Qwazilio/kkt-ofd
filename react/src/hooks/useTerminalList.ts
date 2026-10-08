import {useEffect} from "react";
import {useTerminalStore} from "./store/useTerminalStore.ts";

export default function useTerminalList(){
    const {terminals, filter, setFilteredTerminals, isShowDrop, isShowStock} = useTerminalStore();

    useEffect(() => {
        filterTerminals();
    }, [filter, terminals, isShowDrop, isShowStock])

    //Поиск элементов под условия
    const filterTerminals =  () => {
        if (terminals.length == 0) return;

        const search = filter.toLowerCase();

        const newList = terminals
            // фильтр по удалённым/складу
            .filter(terminal =>
                !isShowDrop
                    ? isShowStock === terminal.stock && isShowDrop === terminal.deleted
                    : isShowDrop === terminal.deleted
            )
            // фильтр по тексту, только если есть строка поиска
            .filter(terminal =>
                terminal.address?.toString().toLowerCase().includes(search) ||
                terminal.comment?.toString().toLowerCase().includes(search) ||
                terminal.name_terminal?.toString().toLowerCase().includes(search) ||
                terminal.organization?.toString().toLowerCase().includes(search) ||
                terminal.uid_terminal?.toString().toLowerCase().includes(search) ||
                terminal.active_card?.uid_card?.toString().toLowerCase().includes(search) ||
                terminal.notification?.toString().toLowerCase().includes(search) ||
                terminal.reg_number?.toString().toLowerCase().includes(search)
            )

        setFilteredTerminals(newList);
    }

    return {}
}