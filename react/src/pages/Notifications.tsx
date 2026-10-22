import classes from "./Notifications.module.scss"
import NotificationRules from "../components/NotificationRules.tsx";

export default function Notifications() {

    return (
        <div className={classes.wrapper}>
            <title>Уведомления</title>
            <NotificationRules />
    </div>)
}