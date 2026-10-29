import React, { createContext, useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSession } from '../session/SessionContext';

const GlobalErrorContext = createContext(() => {});

// Lets any descendant show the dismissible global error alert: const setGlobalError = useGlobalError().
export function useGlobalError() {
  return useContext(GlobalErrorContext);
}

export default function Layout({ children }) {
  const { user, token, logout } = useSession();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState(null);
  const signedIn = Boolean(token && user);

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) => (isActive ? 'active' : undefined);
  const item = ({ isActive }) => (isActive ? 'active' : '');

  return (
    <>
      <nav className="navbar navbar-inverse navbar-static-top">
        <div className="container">
          <div className="navbar-header">
            <Link className="navbar-brand" to="/">Todo</Link>
          </div>
          {signedIn && (
            <>
              <ul className="nav navbar-nav">
                {[['/todos', 'Todos'], ['/stats', 'Stats'], ['/settings', 'Settings']].map(([to, label]) => (
                  <li key={to}>
                    <NavLink to={to} className={linkClass}>{label}</NavLink>
                  </li>
                ))}
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li><p className="navbar-text">Hi, {user.username}</p></li>
                <li><a href="#/login" onClick={handleLogout}>Logout</a></li>
              </ul>
            </>
          )}
        </div>
      </nav>
      <div className="container">
        {globalError && (
          <div className="alert alert-danger" role="alert">
            <button type="button" className="close" aria-label="Close" onClick={() => setGlobalError(null)}>
              &times;
            </button>
            {globalError}
          </div>
        )}
        <GlobalErrorContext.Provider value={setGlobalError}>{children}</GlobalErrorContext.Provider>
      </div>
    </>
  );
}
