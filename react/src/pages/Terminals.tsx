import useSocket from "../hooks/useSocket.ts";
import useTerminalEvents from "../hooks/useTerminalEvents.ts";
import TerminalList from "../components/TerminalList.tsx";
import classes from "./Terminals.module.scss";
import {ToastContainer} from "react-toastify";
import ModalWindows from "../components/ModalWindows.tsx";
import TerminalHeader from "../components/TerminalHeader.tsx";
import {useEffect, useState} from "react";
import useTerminalList from "../hooks/useTerminalList.ts";

export default function Terminals(){
    const socket = useSocket("terminal");
    const [connected, setConnected] = useState(socket.connected);

    useEffect(() => {
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [socket]);


    useTerminalEvents(); //сокет ивент
    useTerminalList()

    if(!connected) return <div>Подключение к серверу...</div>;
    return(
    <div>
        <div className={classes.main}>
            <TerminalHeader />
            <TerminalList />
        </div>
        <ToastContainer position={"bottom-right"}/>
        <ModalWindows />
    </div>)
}