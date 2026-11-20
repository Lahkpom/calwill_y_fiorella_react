import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Login.scss';

const Login = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate('/mi_cuenta');
  }, [user, navigate]);

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);
    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Credenciales incorrectas');
      return;
    }

    navigate('/productos');
  };

  return (
    <div className="login_container container py-3 py-sm-4 py-md-5 rounded-3">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-6 text-center">
          <h2>Iniciar Sesión</h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin}>
            <div className="form-floating mb-3">
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
                placeholder="Email"
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="password-input-container mb-3">
              <div className="form-floating position-relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                  placeholder="Contraseña"
                />
                <label htmlFor="password">Contraseña</label>

                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((visible) => !visible)}
                  tabIndex={-1}
                  disabled={loading}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="main-btn-style mb-3">
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div>
            <p>
              ¿No tenés cuenta?{' '}
              <Link to="/registrarse">Registrate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
