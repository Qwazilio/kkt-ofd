import {type modalWindowType, useModalWindowsStore} from "../hooks/store/useModalWindowStore.ts";
import ModalWindow from "../ui/ModalWindow.tsx";

export default function ModalWindows() {
    const { windows } = useModalWindowsStore();

    return (
        <div>{windows.length > 0
            ? windows.map((window: modalWindowType) => (
                <ModalWindow
                    key={window.id}
                    id={window.id}
                    title={window.title}
                >
                    {window.content(window.id)}
                </ModalWindow>
            ))
            : null
        }</div>
    )
}