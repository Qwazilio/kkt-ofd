import {BrowserRouter as Router, Routes, Route, Outlet, useLocation} from 'react-router-dom'
import Terminals from "./pages/Terminals.tsx";
import Login from "./pages/Login.tsx";
import "./App.scss"
import {useTheme} from "./hooks/useTheme.ts";
import NotFound from "./pages/NotFound.tsx";
import Notifications from "./pages/Notifications.tsx";
import {ToastContainer} from "react-toastify";
import Navbar from "./components/Navbar.tsx";

function Layout() {
    const { pathname } = useLocation();

    return (<>
        <Navbar />
        <main className="page" key={pathname} style={{ padding: 24 }}>
            <Outlet />
        </main>
    </>)
}

function App() {
    useTheme();

    return (
    <Router>
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Login />} />
                <Route path="/terminals" element={<Terminals />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
        <ToastContainer position={"bottom-right"}/>
    </Router>
    )
}

export default App
