import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import { useToast } from '../../../toast/ToastProvider';
import { getDestinos, createEncomienda } from '../services/encomiendasService';
import { clearEncomiendasCache } from '../services/cacheService';
import { MAX_LENGTH, limitLength, hardFilter, decimalFilter, comillasFilter, strFecha } from '../../../utils/validators';
import BottomNav from '../../../components/BottomNav';
import { tieneAcceso } from '../../../config/roles';

const ESTADOS_PAGO = {
    CANCELADO: 1,
    POR_PAGAR: 2,
    PRIMER_TRAMO: 3,
    SEGUNDO_TRAMO: 4
};

function EncomiendaForm() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const showToast = useToast();
    const [destinos, setDestinos] = useState([]);
    const [formData, setFormData] = useState({
        remitente: '',
        remtelf: '',
        consignatario: '',
        contelf: '',
        destino: '',
        tiene_tramos: false,
        primer_tramo: '',
        segundo_tramo: '',
        total: '',
        bulto: '',
        valdeclarado: 'No',
        estadopaga: ESTADOS_PAGO.CANCELADO,
        tipo_pago: 'efectivo'
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDestinos();
    }, []);

    useEffect(() => {
        if (user && !tieneAcceso(user.rol, 'encomienda')) {
            navigate('/menu', { replace: true });
        }
    }, [user, navigate]);

    const loadDestinos = async () => {
        try {
            const data = await getDestinos(user?.sucursal || 1);
            setDestinos(data);
        } catch (error) {
            console.error('Error loading destinos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDestinoChange = (e) => {
        const destinoNombre = e.target.value;
        const selected = destinos.find(d => d.nombre_destino === destinoNombre);
        const tieneTramos = selected ? selected.tiene_tramos : false;

        setFormData(prev => {
            const newState = {
                ...prev,
                destino: destinoNombre,
                tiene_tramos: tieneTramos,
                primer_tramo: '',
                segundo_tramo: ''
            };

            if (!tieneTramos && (prev.estadopaga === ESTADOS_PAGO.PRIMER_TRAMO || prev.estadopaga === ESTADOS_PAGO.SEGUNDO_TRAMO)) {
                newState.estadopaga = ESTADOS_PAGO.CANCELADO;
            }

            return newState;
        });
    };

    const getEstadoOptions = () => {
        const opciones = [
            { value: ESTADOS_PAGO.CANCELADO, label: 'Cancelado' },
            { value: ESTADOS_PAGO.POR_PAGAR, label: 'Por Pagar' }
        ];
        if (formData.tiene_tramos) {
            opciones.push(
                { value: ESTADOS_PAGO.PRIMER_TRAMO, label: 'Primer Tramo' },
                { value: ESTADOS_PAGO.SEGUNDO_TRAMO, label: 'Segundo Tramo' }
            );
        }
        return opciones;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const primerTramo = formData.tiene_tramos ? parseFloat(formData.primer_tramo) || 0 : 0;
            const segundoTramo = formData.tiene_tramos ? parseFloat(formData.segundo_tramo) || 0 : 0;
            const totalCalculado = formData.tiene_tramos ? primerTramo + segundoTramo : parseFloat(formData.total) || 0;

            const data = {
                remitente: formData.remitente,
                remtelf: formData.remtelf,
                consignatario: formData.consignatario,
                contelf: formData.contelf,
                destino: formData.destino,
                primer_tramo: primerTramo,
                segundo_tramo: segundoTramo,
                total: totalCalculado,
                bulto: formData.bulto,
                valdeclarado: formData.valdeclarado,
                estadopaga: formData.estadopaga,
                tipo_pago: formData.estadopaga === ESTADOS_PAGO.POR_PAGAR ? '-' : formData.tipo_pago,
                sucursal: user?.sucursal || 1,
                registrador: user?.nombre || 'desconocido',
                fecha: strFecha()
            };

            await createEncomienda(data);
            clearEncomiendasCache();
            showToast('Encomienda guardada correctamente');
            navigate('/historial', { replace: true });
        } catch (error) {
            alert('Error al guardar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-encomienda overlay">
                <header className="header">
                    <button className="btn btn-outline btn-sm header-back" onClick={() => navigate('/menu')}>&lt;</button>
                    <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="header-logo" />
                    <div style={{ width: '44px' }}></div>
                </header>
                <main className="app">
                    <div className="container">
                        <div className="loading">
                            <div className="spinner"></div>
                        </div>
                    </div>
                </main>
                <BottomNav currentView="encomienda" />
            </div>
        );
    }

    return (
        <div className="bg-encomienda overlay">
            <header className="header">
                <button className="btn btn-outline btn-sm header-back" onClick={() => navigate('/menu')}>&lt;</button>
                <img src="/images/logoX.png" alt="Expreso Santa Cruz" className="header-logo" />
                <div style={{ width: '44px' }}></div>
            </header>

            <main className="app">
                <div className="container">
                    <form className="encomienda-form" onSubmit={handleSubmit}>
                        <div className="encomienda-section">
                            <h4 className="encomienda-section-title">Datos del Remitente</h4>
                            <div className="form-group">
                                <label className="form-label">Remitente</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="remitente"
                                    maxLength={MAX_LENGTH.REMITENTE}
                                    placeholder="Nombre del remitente"
                                    value={formData.remitente}
                                    onChange={handleChange}
                                    onKeyDown={limitLength(MAX_LENGTH.REMITENTE)}
                                    onKeyPress={comillasFilter}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono Remitente</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    name="remtelf"
                                    maxLength={MAX_LENGTH.TELEFONO}
                                    placeholder="Teléfono"
                                    value={formData.remtelf}
                                    onChange={handleChange}
                                    onKeyDown={limitLength(MAX_LENGTH.TELEFONO)}
                                    onKeyPress={hardFilter}
                                />
                            </div>
                        </div>

                        <div className="encomienda-section">
                            <h4 className="encomienda-section-title">Datos del Consignatario</h4>
                            <div className="form-group">
                                <label className="form-label">Consignatario</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="consignatario"
                                    maxLength={MAX_LENGTH.CONSIGNATARIO}
                                    placeholder="Nombre del consignatario"
                                    value={formData.consignatario}
                                    onChange={handleChange}
                                    onKeyDown={limitLength(MAX_LENGTH.CONSIGNATARIO)}
                                    onKeyPress={comillasFilter}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Teléfono Consignatario</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    name="contelf"
                                    maxLength={MAX_LENGTH.TELEFONO}
                                    placeholder="Teléfono"
                                    value={formData.contelf}
                                    onChange={handleChange}
                                    onKeyDown={limitLength(MAX_LENGTH.TELEFONO)}
                                    onKeyPress={hardFilter}
                                />
                            </div>
                        </div>

                        <div className="encomienda-section">
                            <h4 className="encomienda-section-title">Detalles del Envío</h4>
                            <div className="form-group">
                                <label className="form-label">Bultos / Contenido</label>
                                <textarea
                                    className="form-textarea"
                                    name="bulto"
                                    maxLength={MAX_LENGTH.BULTO}
                                    placeholder="Descripción del contenido"
                                    value={formData.bulto}
                                    onChange={handleChange}
                                    onKeyDown={limitLength(MAX_LENGTH.BULTO)}
                                    onKeyPress={comillasFilter}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Destino</label>
                                <select
                                    className="form-select"
                                    name="destino"
                                    value={formData.destino}
                                    onChange={handleDestinoChange}
                                    required
                                >
                                    <option value="">Seleccione destino</option>
                                    {destinos.map(d => (
                                        <option key={d.id} value={d.nombre_destino}>
                                            {d.nombre_destino} {d.tiene_tramos ? '(2 tramos)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {formData.tiene_tramos && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Primer Tramo (Bs)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="primer_tramo"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            value={formData.primer_tramo}
                                            onChange={handleChange}
                                            onKeyPress={decimalFilter}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Segundo Tramo (Bs)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            name="segundo_tramo"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            value={formData.segundo_tramo}
                                            onChange={handleChange}
                                            onKeyPress={decimalFilter}
                                        />
                                    </div>
                                </>
                            )}
                            <div className="form-group">
                                <label className="form-label">Valor Declarado</label>
                                <select
                                    className="form-select"
                                    name="valdeclarado"
                                    value={formData.valdeclarado}
                                    onChange={handleChange}
                                >
                                    <option value="No">No</option>
                                    <option value="Si">Si</option>
                                </select>
                            </div>
                        </div>

                        <div className="encomienda-section">
                            <h4 className="encomienda-section-title">Pago</h4>
                            <div className="form-group">
                                <label className="form-label">Estado de Pago</label>
                                <select
                                    className="form-select"
                                    name="estadopaga"
                                    value={formData.estadopaga}
                                    onChange={handleChange}
                                >
                                    {getEstadoOptions().map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tipo de Pago</label>
                                <select
                                    className="form-select"
                                    name="tipo_pago"
                                    value={formData.tipo_pago}
                                    onChange={handleChange}
                                    disabled={formData.estadopaga === ESTADOS_PAGO.POR_PAGAR}
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="qr">QR</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Total (Bs)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    name="total"
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    value={formData.tiene_tramos
                                        ? (parseFloat(formData.primer_tramo) || 0) + (parseFloat(formData.segundo_tramo) || 0)
                                        : formData.total
                                    }
                                    onChange={handleChange}
                                    onKeyPress={decimalFilter}
                                    readOnly={formData.tiene_tramos}
                                    style={formData.tiene_tramos ? { backgroundColor: 'var(--color-gray)' } : {}}
                                />
                            </div>
                        </div>

                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-cancel flex-1" onClick={() => navigate('/menu')}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar Encomienda'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            <BottomNav currentView="encomienda" />
        </div>
    );
}

export default EncomiendaForm;
