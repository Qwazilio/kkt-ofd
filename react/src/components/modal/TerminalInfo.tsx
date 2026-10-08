import {type ChangeEvent, type ReactNode, useEffect, useState} from "react"
import classes from './TerminalInfo.module.scss'
import type {ModalWindowBase} from "../../ui/ModalWindow.tsx";
import useTerminal from "../../hooks/useTerminal.ts";
import useModalWindow from "../../hooks/useModalWindow.ts";
import type {TerminalEntity} from "../../types.ts";
import api from "../../api.ts";
import {toast} from "react-toastify";

interface TerminalInfoProps extends ModalWindowBase{
    terminal_id: number
}
export default function TerminalInfo({id, terminal_id} : TerminalInfoProps) {
    const {updateTerminal} = useTerminal();
    const {closeWindow} = useModalWindow();
    const [terminal, setTerminal] = useState<TerminalEntity | null>(null)

    useEffect(() => {
        getInfo();
    }, [])

    const getInfo = async () => {
        try {
            const response = await api.get("/terminal", {
                params: {
                    id: terminal_id,
                },
            });
            const { data } = response;
            console.log(response)
            if (data) {
                setTerminal(data);
            } else console.log("no data!");
        } catch (error) {
            console.log(`Error get terminal! ${error}`);
        }
    }

    const onChangeInfo = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setTerminal((prev) => (
            prev ? {
                ...prev,
                [name]: value,
            } : null
        ));
    };
    
    const onChangeCheckbox = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setTerminal((prev) => (
            prev ? {
                ...prev,
                [name]: checked,
            } : null
        ));
    };

    const onChangeDate = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setTerminal((prev) => (
            prev ? {
                ...prev,
                [name]: new Date(value).toISOString(),
            } : null
        ));
    };

    const clickUpdateKkt = async () => {
        if(!terminal) return;
        const response = await updateTerminal(terminal)
        if(response) closeWindow(id)
        else toast.error('Ошибка при обновлении ККТ!')
    }

    const view = (): ReactNode => {
        if(!terminal) return <div>Загрузка...</div>
        return (
            <div className={classes.wrapper}>
                <h3>Основное</h3>
                <div className={classes.section}>
                    <div className={classes.field}>
                        <label>Название</label>
                        <input onChange={onChangeInfo} name='name_terminal' value={terminal.name_terminal || ''}/>
                    </div>
                    <div className={classes.field}>
                        <label>Дополнительный идентификатор</label>
                        <input onChange={onChangeInfo} name="comment" value={terminal.comment || ''}/>
                    </div>
                    {/*<label>Магазин</label>
                    <input onChange={onChangeInfo} name="name_store" value={terminalInfo?.name_store || ''}/>*/}
                    <div className={classes.field}>
                        <label>Организация</label>
                        <input onChange={onChangeInfo} name="organization" value={terminal.organization || ''}/>
                    </div>
                    <div className={classes.field}>
                        <label>ККМ</label>
                        <input name="uid_terminal" readOnly value={terminal.uid_terminal}/>
                    </div>
                </div>
                <hr />
                <h3>Касса и фискальный накопитель</h3>
                <div className={classes.section}>

                    <div className={classes.field}>
                        <label>Адрес</label>
                        <input onChange={onChangeInfo} name="address" value={terminal.address || ''}/>
                    </div>
                    <div className={classes.field}>
                        <label>Номер ФН</label>
                        <input readOnly name="active_card.uid_card" value={terminal.active_card?.uid_card || ''}/>
                    </div>
                    <div className={classes.field}>
                        <label>Подписка</label>
                        <input type="date" onChange={onChangeDate} name="end_date_sub" value={
                            terminal.end_date_sub ? (
                                new Date(terminal.end_date_sub).toISOString().split('T')[0]
                            ): ('')
                        }/>
                    </div>
                    <div className={classes.field}>
                        <label>Дата ФН</label>
                        <input readOnly type="date" name="active_card.end_date_card" value={
                            terminal.active_card?.end_date_card ? (
                                new Date(terminal.active_card.end_date_card).toISOString().split('T')[0]
                            ) : ('')
                        }/>
                    </div>
                    <div className={classes.field}>
                        <label>РНМ</label>
                        <input onChange={onChangeInfo} name="reg_number" readOnly value={terminal.reg_number || ''}/>
                    </div>
                    <div className={classes.field}>
                        <label>Модель</label>
                        <input onChange={onChangeInfo} name="kkt_model" value={terminal.kkt_model || ''}/>
                    </div>
                </div>
                <hr />
                <h3>Статус и заметки</h3>
                <div className={classes.section} style={{"flexDirection": "column"}}>

                    <div className={classes.field}>
                        <label>Комментарий</label>
                        <input onChange={onChangeInfo} name="notification" value={terminal.notification || ''}/>
                    </div>
                    <div>
                        <label>Обновление</label> <input onChange={onChangeCheckbox} name="updated" type='checkbox' checked={terminal.updated}/>
                    </div>
                    <div>
                        <label>На складе</label> <input onChange={onChangeCheckbox} name="stock" type='checkbox' checked={terminal.stock}/>
                    </div>
                    <div>
                        <label>Сломан</label> <input onChange={onChangeCheckbox} name="broken" type='checkbox' checked={terminal.broken}/>
                    </div>
                    <div>
                        <label>Удален</label> <input onChange={onChangeCheckbox} name="deleted" type='checkbox' checked={terminal.deleted}/>
                    </div>
                    <div>
                        <label>ФН установлен</label> <input onChange={onChangeCheckbox} name="hasFN" type='checkbox' checked={terminal?.hasFN}/>
                    </div>
                </div>
                <div className={classes.footer}>
                    <button onClick={clickUpdateKkt}>Сохранить</button>
                </div>

            </div>
        )
    }
    return view();
}