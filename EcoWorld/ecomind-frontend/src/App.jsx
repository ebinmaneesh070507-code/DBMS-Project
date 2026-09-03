import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import ReportWaste from './pages/ReportWaste';
import Dashboard from './pages/Dashboard';
import SmartBins from './pages/SmartBins';
import Prediction from './pages/Prediction';
import Collection from './pages/Collection';
import DumpingReports from './pages/DumpingReports';
import Assistant from './pages/Assistant';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/report" element={<ReportWaste />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bins" element={<SmartBins />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/dumping-reports" element={<DumpingReports />} />
        <Route path="/assistant" element={<Assistant />} />
      </Routes>
    </BrowserRouter>
  );
}
