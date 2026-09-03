import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StorePage from "./pages/StorePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import FirstPasswordPage from "./pages/FirstPasswordPage";
import NotFound from "./pages/NotFound";
import { RequireAuth } from "./components/RequireAuth";
import { RequireAdmin } from "./components/RequireAdmin";
import { ConfigProvider } from "./context/ConfigContext";

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MAIN_DOMAIN, STORE_ONLY_HOSTS, isReservedSlug } from "./lib/storeUrl";

/**
 * No domínio das lojas (lojabio.app), só existem links de loja (/nome-da-loja).
 * Raiz, login, dashboard etc. redirecionam para o domínio principal (bioquevende.app).
 */
function StoreHostGate() {
  const location = useLocation();

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    if (!STORE_ONLY_HOSTS.has(host)) return;

    const segments = location.pathname.split("/").filter(Boolean);
    const isStoreLink =
      segments.length === 1 && !isReservedSlug(segments[0]);

    if (!isStoreLink) {
      const target = `https://${MAIN_DOMAIN}${location.pathname}${location.search}${location.hash}`;
      window.location.replace(target);
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <>
      <StoreHostGate />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/loja/:slug" element={<StorePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/trocar-senha" element={<FirstPasswordPage />} />
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
      {/* Link curto da bio: www.lojabio.app/nome-da-loja */}
      <Route path="/:slug" element={<StorePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
