import classes from "./NotFound.module.scss"
import {useNavigate} from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (<div className={classes.wrapper}>
        <div className={classes.content}>
            <div className={classes.header}>404</div>
            <div className={classes.body}>
                <h1>Страница не найдена</h1>
                <div>Возможно, адрес набран с ошибкой или страница была перемещена.</div>
            </div>
            <div className={classes.footer}>
                <button onClick={() => navigate("/")}>На главную</button>
            </div>
        </div>
    </div>)
}