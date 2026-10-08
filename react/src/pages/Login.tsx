import classes from "./Login.module.scss"
import {useNavigate} from "react-router-dom";
import {useEffect} from "react";

export default function Login(){
    const navigate = useNavigate();

    useEffect(() => { //в будущем мб
        navigate("/terminals");
    }, []);



    return (
    <div className={classes.wrapper}>
        <div className={classes.content}>
            <div className={classes.poster}>
                <h1>Терминалы</h1>
                <h4>Сроки подписки и фискальных накопителей — в одном списке.</h4>
            </div>
            <div className={classes.form}>
                <div>
                    <h1>Вход</h1>
                    <h4>Просмотр информации о терминалах и возможно управление...</h4>
                </div>
                <div className={classes.in}>
                    <label htmlFor={"username"}>Логин</label>
                    <input type={"text"} name={"username"}/>
                </div>
                <div className={classes.in}>
                    <label htmlFor={"password"}>Пароль</label>
                    <input type={"password"} name={"password"}/>
                </div>

                <button>Войти</button>
            </div>
        </div>

    </div>)
}