import classes from "./TerminalImportAPI.module.scss"

import {useEffect, useState} from "react";
import api from "../api.ts";
import type {CompanyEntity} from "../types.ts";
import {toast} from "react-toastify";
import useTerminal from "../hooks/useTerminal.ts";

function CompanyNode ({company, func}: {company: CompanyEntity, func: Function}) {
    return (
        <div onClick={() => console.log(5)} className={classes.node}>
            <input value={company.nickname} readOnly={true} />
            <input type="password" value={company.nickname} readOnly={true}/>
            <button onClick={() => func(company.id)}>Удалить</button>
        </div>
    )
}

export default function TerminalImportAPI() {
    const [newCompany, setNewCompany] = useState<Partial<CompanyEntity> | null>(null);
    const [companies, setCompanies] = useState<CompanyEntity[]>([]);
    const {initImport} = useTerminal();

    useEffect(() => {
        getCompany();
    }, [])


    const getCompany = async () => {
        try{
            const { data } = await api.get(`/company`)
            if (data && data.length < 1) {
                toast.warning("Добавьте подключения")
            }
            setCompanies(data)
        } catch (e) {
            console.log(e)
        }
    }

    const addCompany = async () => {
        console.log(newCompany)
        if (!newCompany?.nickname && !newCompany?.token) {
            toast.error("Заполните все поля");
            return
        }
        try {
            const response = await api.post(`/company/create`, newCompany);
            if(response.status !== 201){
                throw new Error("Сервер дал неверный ответ");

            }
            toast.success("Успех")
            setNewCompany(null)
            getCompany()
        } catch (e) {
            if (e instanceof Error) {
                toast.error(e.message);
            }
            console.log(e)
        }
    }


    const companyList = () => {
        if(companies.length < 1) return <div>Компании не найдены</div>;
        return companies.map((company: CompanyEntity, index) => <CompanyNode func={deleteCompany} company={company} key={index} />)
    }

    const deleteCompany = async (id: number) => {
        console.log(id);
        try{
            const res = await api.delete(`/company/${id}`)
            if(res.status !== 204){
                throw new Error("Сервер дал неверный ответ");
            }
            toast.success("Успех")
            getCompany()
        } catch (e) {
            if (e instanceof Error) {
                toast.error(e.message);
            }
            console.log(e)
        }
    }

    const tryImport = () => {
        initImport();
        toast.success("Импортируем...")
    }

    return(
        <div className={classes.wrapper}>
            <div>Для каждого ключа создаётся новая компания. Укажите её название. Несколько ключей можно вставить сразу: каждый попадёт в свою строку.</div>
            <div className={classes.list}>
                <h2>Список подключений</h2>
                {companyList()}
            </div>
            <hr />
            <div className={classes.new}>
                <div>Добавить новый</div>
                <form>
                    <input
                        type={"text"}
                        value={newCompany?.nickname ?? ""}
                        onChange={(e) => setNewCompany({ ...newCompany, nickname: e.target.value})}
                        placeholder={"Имя"}
                    />
                    <input
                        type={"password"}
                        value={newCompany?.token ?? ""}
                        onChange={(e) => setNewCompany({ ...newCompany, token: e.target.value})}
                        placeholder={"Токен"}
                    />
                </form>
                <button onClick={() => addCompany()}>Добавить</button>
            </div>
            <hr />
            <div className={classes.footer}>
                <button onClick={() => tryImport()}>Импортировать</button>
            </div>
        </div>
    )
}
