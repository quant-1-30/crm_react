// src/App.js
import React  from "react";
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

// import { Layout} from "antd";
// import Layout from "./pages/Layout";
import MembershipManager from "./pages/Membership";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import CoporateManager from "./pages/Coprate";
import DisplayPieChart from "./pages/Analyze";
import { ProtectedRoute, AuthProvider } from "./components/context";
import AppLayout from "./pages/Layout";

// const { Header, Content } = Layout;

function App() {

    return (
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* default redirect to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AppLayout>
                  <DashboardPage />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/membership" element={
              <ProtectedRoute>
                <MembershipManager />
              </ProtectedRoute>
            } />
            <Route path="/coporate" element={
              <ProtectedRoute>
                <CoporateManager />
              </ProtectedRoute>
            } />
            <Route path="/stats" element={
              <ProtectedRoute>
                <DisplayPieChart />
              </ProtectedRoute>
            } />

            {/* 404 redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />

          </Routes>
        </AuthProvider>
      </BrowserRouter>
    )

}

export default App;
