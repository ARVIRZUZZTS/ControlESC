import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { modulosPorRol } from '../config/roles';
import BottomNav from './BottomNav';

function Menu() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const modulos = modulosPorRol(user?.rol);

    return (
        <div className="bg-menu overlay">
            <header className="header">
                <button className="btn btn-outline btn-sm header-back" style={{border: '1px solid white', color: 'white'}} onClick={() => navigate('/menu')}>&lt;</button>
                <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="header-logo" />
                <div style={{ width: '44px' }}></div>
            </header>

            <main className="app">
                <div className="container">
                    <div className="card">
                        <h3 className="card-title">¡Hola, Bienvenido!</h3>
                        <p className="text-center mb-2">
                            Bienvenido a la aplicación de Expresos Santa Cruz
                        </p>
                    </div>

                    {modulos.length === 0 ? (
                        <div className="card">
                            <p className="text-center">No hay módulos disponibles para tu rol.</p>
                        </div>
                    ) : (
                        <div className="menu-grid">
                            {modulos.map(modulo => (
                                <Link key={modulo.id} className="menu-item" to={modulo.path}>
                                    <div className="menu-item-icon">{modulo.icon}</div>
                                    <div className="menu-item-title">{modulo.label}</div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <BottomNav currentView="menu" />
        </div>
    );
}

export default Menu;
