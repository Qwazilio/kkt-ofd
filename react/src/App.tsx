import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Terminals from "./pages/Terminals.tsx";
import Login from "./pages/Login.tsx";
import "./App.module.scss"
import {useTheme} from "./hooks/useTheme.ts";
import NotFound from "./pages/NotFound.tsx";

function App() {
    useTheme();


    return (
    <Router>
        <Routes>
            <Route path="/terminals" element={<Terminals />} />
            <Route path="/" element={<Login />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </Router>
    )
}

export default App
