// socket.ts
import { io, Socket } from "socket.io-client";

const SOCKET_URL = "http://localhost:3001";
const sockets = new Map<string, Socket>();

export function getSocket(namespace = ""): Socket {
    let socket = sockets.get(namespace);
    if (!socket) {
        socket = io(namespace ? `${SOCKET_URL}/${namespace}` : SOCKET_URL, {
            transports: ["websocket"],
            autoConnect: false,
        });
        sockets.set(namespace, socket);
    }
    return socket;
}