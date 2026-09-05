import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Scanner from './pages/Scanner';
import ReportWaste from './pages/ReportWaste';
import Dashboard from './pages/Dashboard';
import MyImpact from './pages/MyImpact';
import SmartBins from './pages/SmartBins';
import Prediction from './pages/Prediction';
import Collection from './pages/Collection';
import DumpingReports from './pages/DumpingReports';
import Assistant from './pages/Assistant';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportWaste /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/my-impact" element={<ProtectedRoute><MyImpact /></ProtectedRoute>} />
          <Route path="/bins" element={<ProtectedRoute><SmartBins /></ProtectedRoute>} />
          <Route path="/prediction" element={<ProtectedRoute><Prediction /></ProtectedRoute>} />

          <Route path="/collection" element={<ProtectedRoute adminOnly><Collection /></ProtectedRoute>} />
          <Route path="/dumping-reports" element={<ProtectedRoute adminOnly><DumpingReports /></ProtectedRoute>} />
          <Route path="/assistant" element={<ProtectedRoute adminOnly><Assistant /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
