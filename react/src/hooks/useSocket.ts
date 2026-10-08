// useSocket.ts
import { useEffect } from "react";
import { getSocket } from "./../socket.ts";

export default function useSocket(namespace?: string) {
    const socket = getSocket(namespace);

    useEffect(() => {
        if (!socket.connected) socket.connect();
    }, [socket]);

    return socket;
}