import classes from "./TerminalHeader.module.scss"
import TerminalExport from "./TerminalExport.tsx";
import {useTerminalStore} from "../hooks/store/useTerminalStore.ts";
import useModalWindow from "../hooks/useModalWindow.ts";
import useTerminal from "../hooks/useTerminal.ts";
import TerminalImport from "./modal/TerminalImport.tsx";
import Checked from "../ui/Checked.tsx";
import type {TerminalEntity} from "../types.ts";
import {useMemo} from "react";

export default function TerminalHeader(){
    const {terminals, filter, filteredTerminals,  setFilter} = useTerminalStore();
    const {
        isShowDrop, setIsShowDrop,
        isShowStock, setIsShowStock
    } = useTerminalStore();
    const {createWindow} = useModalWindow();
    const {sortByFN, sortBySub} = useTerminal();

    //Для Импорта из источников
    const showImport = () => {
        createWindow((id: string) => <TerminalImport id={id}/>, "Импорт")
    };

    const availableTerminals = useMemo(() => {
        const filtered = terminals.filter((terminal) =>
            !terminal.stock &&
            !terminal.deleted &&
            terminal.active_card?.end_date_card
        );
        return  filtered.toSorted((a: TerminalEntity, b: TerminalEntity) => {
            const endDateA = new Date(a.active_card?.end_date_card ?? 0);
            const endDateB = new Date(b.active_card?.end_date_card ?? 0);
            return endDateA.getTime() - endDateB.getTime();
        });
    },[terminals]);
    const nearDate = useMemo(() => {
        const terminalWithMinDate = availableTerminals[0]
        const ms = new Date(terminalWithMinDate?.active_card?.end_date_card ?? 0).getTime() - Date.now()
        return Math.floor(ms / 86_400_000);
    }, [availableTerminals]);
    const inYear = useMemo(() => {
        const limit = Date.now() + 365 * 86_400_000;
        const index = availableTerminals.findIndex((terminal) =>
        new Date(terminal?.active_card?.end_date_card ?? 0).getTime() > limit);
        return index === -1 ? availableTerminals.length : index;
    }, [availableTerminals])


    return (
    <div className={classes.wrapper}>
        <div className={classes.header}>
            <div className={classes.logo}>
                <h1>Терминалы</h1>
                <h3>Контроль терминалов и сроков подписки и ФН</h3>
            </div>
            <div className={classes.board}>
                <div className={classes.stat}>
                    <h1>{terminals.length}</h1>
                    Терминалов
                </div>
                <div className={classes.stat}>
                    <h1>{filteredTerminals.length}</h1>
                    В списке
                </div>
                <div className={classes.stat}>
                    <h1>{nearDate}</h1>
                    Дн. до ближайшего срока
                </div>
                <div className={classes.stat}>
                    <h1>{inYear}</h1>
                    В течении года
                </div>
            </div>
        </div>
        <div className={classes.tools}>
            <input
                value={filter}
                placeholder="Поиск по названию, номеру или ФН"
                onChange={(event) => setFilter(event.target.value) }
                className={`${classes.search} ${classes.tool}`}
            />
            <div
                className={classes.tool}
                style={{
                    backgroundColor: isShowDrop ? "gray" : "",
                    cursor: isShowDrop ? "not-allowed" : "",
                }}
                onClick={() => setIsShowStock(!isShowStock)}>
                <label>На складе</label>
                <Checked value={isShowStock} setValue={setIsShowStock} disabled={isShowDrop}/>
            </div>
            <div
                className={classes.tool}
                onClick={() => setIsShowDrop(!isShowDrop)}
            >
                <label>Удаленные</label>
                <Checked
                    value={isShowDrop}
                    setValue={setIsShowDrop}
                />
            </div>
            <button
                className={classes.tool}
                onClick={() => sortBySub()}
            >
                Сорт. по Дате подписки
            </button>
            <button
                className={classes.tool}
                onClick={() => sortByFN()}
            >
                Сорт. по Дате ФН
            </button>
            <button
                className={classes.tool}
                onClick={showImport}
            >
                Импорт
            </button>
            <TerminalExport className={classes.tool}/>
        </div>
    </div>)
};