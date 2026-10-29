import React, { useEffect, useState } from 'react';
import { getMe, updateMe } from '../api/endpoints';
import { useSession } from '../session/SessionContext';
import { prettyDate } from '../lib/format';

export default function SettingsPage() {
  const { user, setUser } = useSession();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', password2: '' });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    getMe().then(
      (data) => {
        if (!active) return;
        setMe(data);
        setForm((f) => ({ ...f, email: data.email || '' }));
      },
      () => {}
    );
    return () => {
      active = false;
    };
  }, []);

  const change = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    if (form.password && form.password !== form.password2) {
      setMessage({ type: 'danger', text: 'Passwords do not match' });
      return;
    }
    const body = { email: form.email };
    if (form.password) body.password = form.password;
    try {
      await updateMe(body);
      setMessage({ type: 'success', text: 'Saved!' });
      setUser({ ...(user || {}), email: form.email });
      setForm((f) => ({ ...f, password: '', password2: '' }));
    } catch (err) {
      setMessage({ type: 'danger', text: 'Error saving settings' });
    }
  };

  return (
    <div className="row">
      <div className="col-md-5">
        <h3>Settings</h3>
        {me && (
          <p className="text-muted">
            Signed in as <b>{me.username}</b> since {prettyDate(me.created_at)}
          </p>
        )}
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label htmlFor="set-email">Email</label>
            <input
              id="set-email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={change('email')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="set-password">New password</label>
            <input
              id="set-password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={change('password')}
              placeholder="leave empty to keep"
            />
          </div>
          <div className="form-group">
            <label htmlFor="set-password2">Repeat new password</label>
            <input
              id="set-password2"
              type="password"
              className="form-control"
              value={form.password2}
              onChange={change('password2')}
            />
          </div>
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}
