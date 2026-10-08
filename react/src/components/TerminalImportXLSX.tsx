import classes from "./TerminalImportXLSX.module.scss"
import {type ChangeEvent, useState} from "react";
import * as XLSX from "xlsx";
import type {CardEntity, TerminalEntity} from "../types.ts";
import {toast} from "react-toastify";
import useTerminal from "../hooks/useTerminal.ts";

interface TerminalImportXLSXProps{
}
export default function TerminalImportXLSX({} : TerminalImportXLSXProps) {
    const [terminal, setTerminal] = useState<TerminalEntity[]>([]);
    const {importKkt} = useTerminal();

    const clickSendOnServer = async () => {
        const response = await importKkt(terminal);
        if(response) toast.success("Успех")
        else toast.error('Ошибка при загрузке терминалов на сервер!')
    }

    const convertExcelDateToJSDate = (excelDate: number) => {
        return new Date((excelDate - 25569) * 86400 * 1000);
    };
    const REQUIRED_COLUMNS = [
        "Наименование магазина",
        "Наименование кассы",
        "ЗН",
        "РНМ",
        "Адрес кассы",
        "Дата окончания подписки",
        "Прогнозируемая дата окончания ФН",
        "ФН",
    ];
    const toStr = (v: unknown): string => (v == null ? "" : String(v).trim());
    const toDate = (v: unknown): Date | null => {
        if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
        if (typeof v === "number") return convertExcelDateToJSDate(v);
        if (typeof v === "string" && v.trim()) {
            // формат ДД.ММ.ГГГГ
            const m = v.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d;
        }
        return null;
    };

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = ""; // чтобы можно было выбрать тот же файл повторно
        if (!file) return;

        setTerminal([]);

        try {
            if (!/\.xlsx?$/i.test(file.name)) {
                throw new Error("Нужен файл формата .xls или .xlsx");
            }

            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

            const sheetName = workbook.SheetNames[0];
            if (!sheetName) throw new Error("В файле нет листов");

            const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
                workbook.Sheets[sheetName],
                { defval: "" }
            );
            if (rawRows.length === 0) throw new Error("Лист пустой");

            // убираем лишние пробелы в названиях колонок
            const rows = rawRows.map((row) =>
                Object.fromEntries(Object.entries(row).map(([k, v]) => [k.trim(), v]))
            );

            const missing = REQUIRED_COLUMNS.filter((c) => !(c in rows[0]));
            if (missing.length) {
                throw new Error(`Не найдены колонки: ${missing.join(", ")}`);
            }

            const terminalData = rows
                .filter((row) => toStr(row["ЗН"]) !== "") // пропускаем пустые строки
                .map((row) => ({
                    organization: toStr(row["Наименование магазина"]),
                    name_terminal: toStr(row["Наименование кассы"]),
                    uid_terminal: toStr(row["ЗН"]),
                    reg_number: toStr(row["РНМ"]),
                    comment: toStr(row["Дополнительный идентификатор"]),
                    address: toStr(row["Адрес кассы"]),
                    end_date_sub: toDate(row["Дата окончания подписки"]),
                    active_card: {
                        end_date_card: toDate(row["Прогнозируемая дата окончания ФН"]),
                        uid_card: toStr(row["ФН"]),
                        uid_terminal: toStr(row["ЗН"]),
                    } as CardEntity,
                })) as Partial<TerminalEntity>[];

            if (terminalData.length === 0) throw new Error("Нет ни одной валидной строки");

            //Надо дописать отправку на сервер
        } catch (error) {
            console.error("Ошибка чтения файла:", error);
            alert(error instanceof Error ? error.message : "Не удалось прочитать файл");
        }
    };

    return(
    <div className={classes.wrapper}>
        <input
          onChange={(event) => handleFileUpload(event)}
          type="file"
          accept=".xlsx, .xls"
        />
        <hr />
        <div className={classes.footer}>
            <button onClick={clickSendOnServer}>Импортировать</button>
        </div>
    </div>
    )
}