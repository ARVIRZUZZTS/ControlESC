import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { tieneAcceso } from '../config/roles';

function BottomNav({ currentView }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const rol = user?.rol;

    return (
        <nav className="bottom-nav">
            {tieneAcceso(rol, 'historial') && (
                <button
                    className={`bottom-nav-item ${currentView === 'historial' ? 'active' : ''}`}
                    onClick={() => navigate('/historial')}
                >
                    <span className="bottom-nav-icon">📋</span>
                    <span>Historial</span>
                </button>
            )}
            {tieneAcceso(rol, 'encomienda') && (
                <button
                    className={`bottom-nav-item bottom-nav-center ${currentView === 'encomienda' ? 'active' : ''}`}
                    onClick={() => navigate('/encomienda')}
                >
                    <span className="bottom-nav-icon">📦</span>
                    <span>Nueva</span>
                </button>
            )}
            <button
                className={`bottom-nav-item ${currentView === 'perfil' ? 'active' : ''}`}
                onClick={() => navigate('/perfil')}
            >
                <span className="bottom-nav-icon">👤</span>
                <span>Perfil</span>
            </button>
        </nav>
    );
}

export default BottomNav;
