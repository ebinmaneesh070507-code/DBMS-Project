import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import ChooseRole from './pages/ChooseRole';
import Scanner from './pages/Scanner';
import ReportIncident from './pages/ReportIncident';
import MyContributions from './pages/MyContributions';
import RespondBoard from './pages/RespondBoard';
import Dashboard from './pages/Dashboard';
import Prediction from './pages/Prediction';
import Assistant from './pages/Assistant';
import AdminIncidents from './pages/AdminIncidents';
import AdminTeams from './pages/AdminTeams';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/choose-role" element={<ChooseRole />} />

          {/* Any signed-in user */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/prediction" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />
          <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />

          {/* Citizen (+ admin) */}
          <Route path="/report" element={<ProtectedRoute roles={['citizen']}><ReportIncident /></ProtectedRoute>} />
          <Route path="/my-reports" element={<ProtectedRoute roles={['citizen']}><MyContributions /></ProtectedRoute>} />

          {/* Responder (+ admin) */}
          <Route path="/respond" element={<ProtectedRoute roles={['responder']}><RespondBoard /></ProtectedRoute>} />

          {/* Admin only */}
          <Route path="/admin/incidents" element={<ProtectedRoute roles={['admin']}><AdminIncidents /></ProtectedRoute>} />
          <Route path="/admin/teams" element={<ProtectedRoute roles={['admin']}><AdminTeams /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
