import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";

// Dashboard
import Dashboard from "./pages/Dashboard.jsx";

// Amazon
import AmazonUploadFail from "./pages/AmazonUploadFail.jsx";
import AmazonProcessedOutput from "./pages/AmazonProcessedOutput.jsx";
import AmazonMasterfail from "./pages/AmazonMasterfail.jsx";

// Flipkart
import FlipkartUploadFail from "./pages/FlipkartUploadFail.jsx";
import FlipkartProcessedOutput from "./pages/FlipkartProcessedOutput.jsx";
import FlipkartMasterfile from "./pages/FlipkartMasterfile.jsx";

// Master File Global Pages
import MasterFileEdit from "./pages/MasterFileEdit.jsx";
import MasterFileView from "./pages/MasterFileView.jsx";

// P&L Report
import PnlReport from "./pages/PnlReport.jsx";

// Analyze Page
import AnalyzePage from "./pages/AnalyzePage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-gray-100 min-h-screen">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <main className="flex-1">
          <Routes>

            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Amazon Upload + Output + Master */}
            <Route path="/amazon/upload-fail" element={<AmazonUploadFail />} />
            <Route path="/amazon/processed-output" element={<AmazonProcessedOutput />} />
            <Route path="/amazon/master-file" element={<AmazonMasterfail />} />

            {/* Flipkart Upload + Output + Master */}
            <Route path="/flipkart/upload-fail" element={<FlipkartUploadFail />} />
            <Route path="/flipkart/processed-output" element={<FlipkartProcessedOutput />} />
            <Route path="/flipkart/master-file" element={<FlipkartMasterfile />} />

            {/* Master File View & Edit */}
            <Route path="/master-file/view" element={<MasterFileView />} />
            <Route path="/master-file/edit" element={<MasterFileEdit />} />

            {/* P&L Report */}
            <Route path="/pnl-report" element={<PnlReport />} />

            {/* Analyze Page */}
            <Route path="/analyze/:id" element={<AnalyzePage />} />

          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
