import classes from "./Navbar.module.scss"
import {NavLink} from "react-router-dom";

export default function Navbar() {
    return (


    <nav className={classes.wrapper}>
        <div className={classes.links}>
            <div className={classes.link}>
                <NavLink to="/terminals" >Терминалы</NavLink>
            </div>
            <div className={classes.link}>
                <NavLink to="/notifications">Оповещения</NavLink>
            </div>


        </div>
    </nav>)
}