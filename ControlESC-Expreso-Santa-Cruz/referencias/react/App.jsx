import { Navigate, Route, Routes } from 'react-router-dom';
import './styles/variables.css';
import './styles/components.css';
import './styles/mobile.css';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import PublicRoute from './auth/PublicRoute';
import { ToastProvider } from './toast/ToastProvider';
import MandatoryPasswordChange from './components/MandatoryPasswordChange';
import Login from './components/Login';
import Menu from './components/Menu';
import Perfil from './components/Perfil';
import EncomiendaForm from './modules/encomiendas/components/EncomiendaForm';
import HistorialEncomiendas from './modules/encomiendas/components/HistorialEncomiendas';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Routes>
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<Login />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/menu" element={<Menu />} />
                        <Route element={<ProtectedRoute roles={['encomiendas']} />}>
                            <Route path="/encomienda" element={<EncomiendaForm />} />
                            <Route path="/historial" element={<HistorialEncomiendas />} />
                        </Route>
                        <Route path="/perfil" element={<Perfil />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/menu" replace />} />
                    <Route path="*" element={<Navigate to="/menu" replace />} />
                </Routes>
                <MandatoryPasswordChange />
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;