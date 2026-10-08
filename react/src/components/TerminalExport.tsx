import * as XLSX from 'xlsx';
import type {TerminalEntity} from "../types.ts";
import {useTerminalStore} from "../hooks/store/useTerminalStore.ts";
import type {ButtonHTMLAttributes} from "react";

interface TerminalExportProps extends ButtonHTMLAttributes<HTMLButtonElement>{

}
export default function TerminalExport ({className, ...rest}: TerminalExportProps) {
    const {filteredTerminals} = useTerminalStore();

    const ExportToXSLS = () => {
        const exportData = filteredTerminals.map((kkt: TerminalEntity) => ({
            "Адрес": kkt.address,
            "Дата": new Date(kkt.active_card ? kkt.active_card.end_date_card : "00:00:00"),
            "Доп. инф.": kkt.comment,
            "ККН": kkt.uid_terminal,
            "Комментарий": kkt.notification,
            "Модель": kkt.kkt_model,
            "Название": kkt.name_terminal,
            "Организация": kkt.organization,
            "Рег. Номер": kkt.reg_number,
            "ФН": kkt.active_card?.uid_card
        }))
        const fileName = `monitoring_ofd ${Date.now()}`
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `monitoring_ofd ${Date.now()}`);
    
        // Генерируем Excel-файл и инициируем скачивание
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }

    return(
        <button
            {...rest}
            className={className}
            onClick={() => ExportToXSLS()}
        >
            Экспорт
        </button>
    )
}