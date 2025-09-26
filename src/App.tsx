import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/layout/Header';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { PublicRoute } from './components/layout/PublicRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrintersPage } from './pages/PrintersPage';
import { OrdersPage } from './pages/OrdersPage';
import DeliveryPage from './pages/DeliveryPage';
import { AdminPage } from './pages/AdminPage';
import { ComingSoonPage } from './pages/ComingSoonPage';
import { PrinterRegisterPage } from './pages/PrinterRegisterPage';
import { PrinterOwnerDashboard } from './pages/PrinterOwnerDashboard';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-theme-bg transition-colors duration-300">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <LoginPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicRoute>
                      <SignupPage />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/printers"
                  element={
                    <ProtectedRoute>
                      <PrintersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  }
/>

                {/* Add Printer registration page */}
                <Route
                  path="/printers/add"
                  element={
                    <ProtectedRoute>
                      <PrinterRegisterPage />
                    </ProtectedRoute>
                  }
                />
                
                {/* Printer Owner Dashboard */}
                <Route
                  path="/printer-dashboard"
                  element={
                    <ProtectedRoute>
                      <PrinterOwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/delivery"
                  element={
                    <ProtectedRoute>
                      <DeliveryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coming-soon"
                  element={
                    <ProtectedRoute>
                      <ComingSoonPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;