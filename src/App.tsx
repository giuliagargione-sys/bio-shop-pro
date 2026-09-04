import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
// A loja pública é o que mais importa em velocidade: ela fica no bundle
// principal e todo o resto (landing, dashboard, admin, login) é carregado
// só quando a rota é aberta — isso reduz o JS baixado pela cliente final.
import StorePage from "./pages/StorePage";
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const FirstPasswordPage = lazy(() => import("./pages/FirstPasswordPage"));
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const NotFound = lazy(() => import("./pages/NotFound"));
import { RequireAuth } from "./components/RequireAuth";
import { RequireAdmin } from "./components/RequireAdmin";
import { ConfigProvider } from "./context/ConfigContext";
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
      <Suspense fallback={<div className="min-h-screen" />}>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/vip" element={<LandingPage vip />} />
      <Route path="/VIP" element={<LandingPage vip />} />
      <Route path="/loja/:slug" element={<StorePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/trocar-senha" element={<FirstPasswordPage />} />
      <Route path="/bem-vindo" element={<WelcomePage />} />
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
      </Suspense>
    </>
  );
}
