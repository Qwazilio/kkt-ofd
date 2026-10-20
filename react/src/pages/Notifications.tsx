import classes from "./Notifications.module.scss"
import NotificationRules, { type Rule, type RuleDraft } from "../components/NotificationRules.tsx";

export default function Notifications() {
    const f = () => {
    }

    return (
        <div className={classes.wrapper}>
            <title>Уведомления</title>
            <NotificationRules rules={[]} onCreate={function(draft: RuleDraft): Promise<void> {
                throw new Error("Function not implemented.");
            } } onToggle={function(id: Rule["id"]): void | Promise<void> {
                throw new Error("Function not implemented.");
            } } onDelete={function(id: Rule["id"]): void | Promise<void> {
                throw new Error("Function not implemented.");
            } } />
    </div>)
}