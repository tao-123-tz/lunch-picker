import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ManagePage from './pages/ManagePage';
import AddDishPage from './pages/AddDishPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const { isLoggedIn, ready, login } = useAuth();

  if (!ready) {
    return (
      <div className="loading-hint" style={{ minHeight: '100vh' }}>
        加载中...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={login} />;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/manage" element={<ManagePage />} />
      <Route path="/add" element={<AddDishPage />} />
      <Route path="/add/:id" element={<AddDishPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
