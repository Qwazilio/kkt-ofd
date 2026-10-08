import { useState } from "react";

import type {ModalWindowBase} from "../../ui/ModalWindow.tsx";


import TerminalImportXLSX from "../TerminalImportXLSX.tsx";
import classes from "./TerminalImport.module.scss";
import TerminalImportAPI from "../TerminalImportAPI.tsx";

type TerminalImportProps = ModalWindowBase
export default function TerminalImport({}: TerminalImportProps) {
    const [activeTab, setActiveTab] = useState<number>(0);


    const tabs = [<TerminalImportAPI />, <TerminalImportXLSX />];

    return (
        <div className={classes.wrapper}>
            <div className={classes.menu}>
                <div className={(activeTab === 0 ? classes.active : "")} onClick={() => setActiveTab(0)}>Из ОФД</div>
                <div className={(activeTab === 1 ? classes.active : "")} onClick={() => setActiveTab(1)}>Из Файла</div>
            </div>
            <div className={classes.content}>
                {tabs[activeTab]}
            </div>
        </div>
    );
}