import classes from "./TerminalList.module.scss";
import {useTerminalStore} from "../hooks/store/useTerminalStore.ts";
import useModalWindow from "../hooks/useModalWindow.ts";
import TerminalInfo from "./modal/TerminalInfo.tsx";
import type {TerminalEntity} from "../types.ts";

export default function TerminalList() {
  const { filteredTerminals } = useTerminalStore();

  return (
      <div className={classes.wrapper}>
        <div className={classes.headerTerminal}>
          <label className={classes.important}>Название</label>
          <label>Адрес</label>
          <label className={classes.important}>ККМ</label>
          <label>Срок подписки</label>
          <label>Срок ФН</label>
        </div>
        {filteredTerminals.map((terminal: TerminalEntity, index: number) => <TerminalNode key={index} terminal={terminal}/>)}
      </div>
  );
}

function TerminalNode({terminal}: {terminal: TerminalEntity}) {
  const {createWindow} = useModalWindow();

  //Для подробного просмотра данных терминала
  const viewTerminal = async (kkt_id: number) => {
    createWindow((id) => <TerminalInfo id={id} terminal_id={kkt_id}/>, "Информация")
  };

  //Определяет статус терминала устанавливая цвет
  const statusKkt = () => {
    if(!terminal.hasFN) return classes.warning;
    if(terminal.broken) return classes.broken;
  }

  const whenEnd = (date: Date | null | undefined) => {
      if(!date) date = new Date(0);
      const ms = new Date(date).getTime() - Date.now();
      const days = Math.floor(ms / 86_400_000);

      const statusStyle = days <= 365 ? classes.warning : classes.success;

      const left = ()=>  {
          if(days > 365){
              return `через ${Math.round((days / 365) * 10) / 10} г.`
          } else if(days > 30){
              return `через ${Math.floor(days/30)} мес.`
          } else if(days > 0){
              return `${days} д.`
          } else {
              return `устарел`
          }
      }

      return (<div className={statusStyle}>{left()}</div>)
  }


  return (
      <div
          className={`
            ${classes.terminal}
            ${statusKkt()}
        `}
          key={terminal.uid_terminal}
          onClick={() => {
            if(!terminal.id) return;
            return viewTerminal(terminal.id);
          }}
      >
        <div className={` ${classes.info} ${classes.important}`}>{terminal.name_terminal}</div>
        <div className={classes.info}>{terminal.address}</div>
        <div className={` ${classes.info} ${classes.important}`}>{terminal.uid_terminal}</div>
        <div className={classes.info}>
          {terminal.end_date_sub
              ? new Date(terminal.end_date_sub).toLocaleDateString()
              : "Нет подписки"}
            <div className={classes.deadlines}>{whenEnd(terminal?.end_date_sub)}</div>
        </div>
        <div className={` ${classes.info} ${classes.important}`}>
          {terminal.active_card
              ? new Date(terminal.active_card.end_date_card).toLocaleDateString() : "Нет ФН"
          }
            <div  className={classes.deadlines}>{whenEnd(terminal?.active_card?.end_date_card)}</div>
        </div>
      </div>
  );
}