import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../session/SessionContext';

// Only /login and /register are public; everything else is wrapped in this guard.
export default function RequireAuth({ children }) {
  const { token } = useSession();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
