import classes from "./Login.module.scss"
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import api from "../api.ts";
import {toast} from "react-toastify";

export default function Login(){
    const navigate = useNavigate();
    const [name, setName] = useState<string>('')
    const [password, setPassword] = useState<string>('')


    useEffect(() => { //в будущем мб
        const me = async () => {
            try{
                const res = await api.get("/auth/me")
                if(res) navigate("/terminals");
            } catch (e) {
                console.log(e)
            }
        }
        me();
    }, []);

    const onLogin = async () => {
        if(name.length === 0 && password.length === 0) {
            toast.error("Введите учетные данные");
            return;
        }
        try {
            const res = await api.post("/auth/login", {
                name: name,
                password: password
            })
            if(res.status === 200) navigate("/terminals");
        } catch (e) {
            console.error(e)
            toast.error(e instanceof Error ? e.message : "Ошибка входа");
        }
    }

    return (
    <div className={classes.wrapper}>
        <title>Вход</title>
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
                    <input
                        type={"text"}
                        onChange={(e) => setName(e.target.value)}
                        name={"username"}
                        placeholder={"Имя"}
                    />
                </div>
                <div className={classes.in}>
                    <input
                        placeholder={"Пароль"}
                        type={"password"}
                        name={"password"}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button onClick={onLogin}>Войти</button>
            </div>
        </div>

    </div>)
}