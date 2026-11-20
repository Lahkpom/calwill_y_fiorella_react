import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import AdminProducts from './AdminProducts';

const AdminPanel = () => {
    const { user, role, signOut } = useAuth();
    const [activeSection, setActiveSection] = useState(null);

    return (
        <div className="admin_panel_container container py-3 py-sm-4 py-md-5 rounded-3">
            <div className="row justify-content-center">
                <div className="col-10 col-lg-8">
                    <h1>Panel de Administración</h1>
                    
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary" onClick={() => setActiveSection('products')}>
                            Gestionar Productos
                        </button>
                        <button className="btn btn-outline-primary">
                            Ver Ventas
                        </button>
                        {(role === 'ADMIN' || role === 'OPERATOR') && (
                            <button className="btn btn-outline-success">
                                Crear Usuario Mayorista
                            </button>
                        )}
                        <button 
                            className="btn btn-outline-danger ms-auto" 
                            onClick={signOut}
                        >
                            Cerrar Sesión
                        </button>
                    </div>

                    <div>
                        {/* ESTE ESPACIO VA A SER EL QUE RENDERICE LA INFORMACIÓN DE CADA BOTÓN */}

                        {activeSection === 'products' ? <AdminProducts /> : (
                            <>
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h5>Información del Usuario</h5>
                                    </div>
                                    <div className="card-body">
                                        <p><strong>Email:</strong> {user?.userEmail}</p>
                                        <p><strong>Nombre:</strong> {user?.userName}</p>
                                        <p><strong>Rol:</strong> <span className="badge bg-primary">{role}</span></p>
                                        <p><strong>Teléfono:</strong> {user?.userPhone || 'No especificado'}</p>
                                        {user?.companyName && (
                                            <p><strong>Empresa:</strong> {user.companyName}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="alert alert-info">
                                    <h5>Acciones disponibles según tu rol:</h5>
                                    <ul>
                                        {(role === 'ADMIN' || role === 'OPERATOR') && (
                                            <>
                                                <li>✅ Crear usuarios mayoristas</li>
                                                <li>✅ Gestionar productos y stock</li>
                                                <li>✅ Ver todas las ventas</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
