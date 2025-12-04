import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UploadPage } from './pages/Upload';
import { Dashboard } from './pages/Dashboard';
import { CommodityDetail } from './pages/CommodityDetail';
import { CostVarianceAnalysis } from './pages/CostVarianceAnalysis';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/commodity/:commodityName" element={<CommodityDetail />} />
        <Route path="/cost-variance" element={<CostVarianceAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
