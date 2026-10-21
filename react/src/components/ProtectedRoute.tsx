// ProtectedRoute.tsx
import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from "../api.ts";

export function ProtectedRoute() {
    const [status, setStatus] = useState<'loading' | 'ok' | 'fail'>('loading');

    useEffect(() => {
        api.get('/auth/me')
            .then(() => setStatus('ok'))
            .catch(() => setStatus('fail'));
    }, []);

    if (status === 'loading') return <div>Загрузка...</div>;
    if (status === 'fail') return <Navigate to="/" replace />;

    return <Outlet />;
}