import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../session/SessionContext';

export default function RegisterPage() {
  const { register } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '' });
  const [error, setError] = useState(null);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 3) {
      setError('Password too short');
      return;
    }
    setError(null);
    try {
      await register(form.username, form.password, form.email);
      navigate('/todos');
    } catch (err) {
      setError((err && err.data && err.data.error) || 'Registration failed');
    }
  };

  return (
    <div className="row">
      <div className="col-md-4 col-md-offset-4">
        <div className="panel panel-default auth-panel">
          <div className="panel-heading"><h3 className="panel-title">Create account</h3></div>
          <div className="panel-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <input
                  id="reg-username"
                  type="text"
                  className="form-control"
                  value={form.username}
                  onChange={change('username')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={change('email')}
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={change('password')}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="reg-password2">Repeat password</label>
                <input
                  id="reg-password2"
                  type="password"
                  className="form-control"
                  value={form.password2}
                  onChange={change('password2')}
                  required
                />
              </div>
              <button type="submit" className="btn btn-success btn-block">Register</button>
            </form>
            <hr />
            <p className="text-center"><Link to="/login">Back to sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
