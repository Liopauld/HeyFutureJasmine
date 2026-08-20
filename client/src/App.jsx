import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Anchor } from "lucide-react";
import OceanBackground from "./components/layout/OceanBackground.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import PageWrapper from "./components/layout/PageWrapper.jsx";
import RequireAuth from "./components/auth/RequireAuth.jsx";
import LoadingCompass from "./components/common/LoadingCompass.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import DevInspectorBar from "./components/common/DevInspectorBar.jsx";
import OfflineBanner from "./components/common/OfflineBanner.jsx";
import { useAuthBootstrap } from "./hooks/useAuth.js";

// Code-split each route so heavy deps (TipTap, Framer Motion, DayPicker)
// only load on the pages that use them.
const Home = lazy(() => import("./pages/Home.jsx"));
const WriteLetter = lazy(() => import("./pages/WriteLetter.jsx"));
const CaptainsLog = lazy(() => import("./pages/CaptainsLog.jsx"));
const TreasureChest = lazy(() => import("./pages/TreasureChest.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Noticeboard = lazy(() => import("./pages/Noticeboard.jsx"));
const Login = lazy(() => import("./pages/Auth/Login.jsx"));
const Register = lazy(() => import("./pages/Auth/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("./pages/Auth/VerifyEmail.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function App() {
  useAuthBootstrap();

  return (
    <div className="relative flex min-h-screen flex-col font-ui text-text-primary">
      <OfflineBanner />
      <OceanBackground />
      <Navbar />
      <PageWrapper>
        <ErrorBoundary>
          <Suspense fallback={<LoadingCompass full />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/noticeboard" element={<Noticeboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              {/* Public one-time view for non-users */}
              <Route path="/unlock/:token" element={<TreasureChest />} />

              {/* Protected */}
              <Route
                path="/write"
                element={
                  <RequireAuth>
                    <WriteLetter />
                  </RequireAuth>
                }
              />
              <Route
                path="/write/:id/edit"
                element={
                  <RequireAuth>
                    <WriteLetter />
                  </RequireAuth>
                }
              />
              <Route
                path="/log"
                element={
                  <RequireAuth>
                    <CaptainsLog />
                  </RequireAuth>
                }
              />
              <Route
                path="/treasure/:id"
                element={
                  <RequireAuth>
                    <TreasureChest />
                  </RequireAuth>
                }
              />
              <Route
                path="/profile"
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </PageWrapper>
      <DevInspectorBar />
      <footer className="relative z-10 mt-auto pb-8 pt-12">
        <div className="mx-auto flex max-w-shell items-center gap-4 px-6 text-gold/30">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/25" />
          <Anchor className="h-4 w-4" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/25" />
        </div>
        <p className="mt-3 text-center text-xs text-text-muted">HeyFutureJasmine!</p>
      </footer>
    </div>
  );
}
