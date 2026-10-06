import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import IncidentsPage from './pages/IncidentsPage';
import TeamsPage from './pages/TeamsPage';
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
