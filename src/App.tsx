import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StorePage from "./pages/StorePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/RequireAuth";
import { RequireAdmin } from "./components/RequireAdmin";
import { ConfigProvider } from "./context/ConfigContext";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/loja/:slug" element={<StorePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/personalizar"
        element={
          <RequireAuth>
            <ConfigProvider>
              <DashboardPage />
            </ConfigProvider>
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminPage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
