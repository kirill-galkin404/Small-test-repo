import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../session/SessionContext';

export default function LoginPage() {
  const { login } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/todos');
    } catch (err) {
      setError((err && err.data && err.data.error) || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-md-4 col-md-offset-4">
        <div className="panel panel-default auth-panel">
          <div className="panel-heading"><h3 className="panel-title">Sign in</h3></div>
          <div className="panel-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="login-username">Username</label>
                <input
                  id="login-username"
                  type="text"
                  className="form-control"
                  value={form.username}
                  onChange={change('username')}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={change('password')}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <hr />
            <p className="text-center">No account? <Link to="/register">Register</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
