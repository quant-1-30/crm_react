// src/App.js
import React  from "react";
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

// import { Layout} from "antd";
// import Layout from "./pages/Layout";
import MembershipManager from "./pages/Membership";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import CoporateManager from "./pages/Coprate";
import DisplayChart from "./pages/Analyze";
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
                <AppLayout>
                  <MembershipManager />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/coporate" element={
              <ProtectedRoute>
                <AppLayout>
                  <CoporateManager />
                </AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/analyze" element={
              <ProtectedRoute>
                <AppLayout>
                  <DisplayChart />
                </AppLayout>
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
