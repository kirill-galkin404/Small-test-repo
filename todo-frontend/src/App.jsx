import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodosPage from './pages/TodosPage';
import TodoEditPage from './pages/TodoEditPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

// The router (HashRouter in main.jsx, MemoryRouter in tests) and SessionProvider are supplied by the caller.
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/todos" element={<RequireAuth><TodosPage /></RequireAuth>} />
        <Route path="/todos/:id" element={<RequireAuth><TodoEditPage /></RequireAuth>} />
        <Route path="/stats" element={<RequireAuth><StatsPage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/todos" replace />} />
      </Routes>
    </Layout>
  );
}
