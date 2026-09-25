import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import { Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Portal from './pages/Portal';
import MyAppeals from './pages/MyAppeals';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Apply from './pages/Apply';
import ModerationPopOut from './pages/ModerationPopOut';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useDesktopApp } from '@/hooks/useDesktopApp';
import DesktopSplashScreen from '@/components/desktop/DesktopSplashScreen';
import DesktopNotifications from '@/components/desktop/DesktopNotifications';
import { useSeasonalTheme } from '@/hooks/useSeasonalTheme';
import SeasonalEffects from '@/components/SeasonalEffects';
import IpBanCheck from '@/components/IpBanCheck';
import MaintenanceGuard from '@/components/site/MaintenanceGuard';
import AccentApplier from '@/components/AccentApplier';
import WelcomeModal from '@/components/WelcomeModal';
import AppLoadingScreen from '@/components/AppLoadingScreen';
import { useUserPrefs } from '@/lib/userPrefs';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const isDesktopApp = useDesktopApp();
  const season = useSeasonalTheme();
  const prefs = useUserPrefs();

  const isLoading = isLoadingPublicSettings || isLoadingAuth;
  const showSplash = isDesktopApp || new URLSearchParams(window.location.search).has('splash');

  let content;
  if (isLoading) {
    content = <AppLoadingScreen />;
  } else if (authError?.type === 'user_not_registered') {
    content = <UserNotRegisteredError />;
  } else if (authError?.type === 'auth_required') {
    navigateToLogin();
    content = null;
  } else {
    content = (
      <Routes>
        {/* Add your page Route elements here */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/portal" element={<Portal />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/my-appeals" element={<MyAppeals />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/apply/:id" element={<Apply />} />
          <Route path="/moderation-popout" element={<ModerationPopOut />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    );
  }

  return (
    <IpBanCheck>
      <MaintenanceGuard>
        <AccentApplier />
        {prefs.seasonal_effects && <SeasonalEffects season={season} />}
        {!isLoading && <WelcomeModal />}
        {showSplash && <DesktopSplashScreen ready={!isLoading && !authError} />}
        <DesktopNotifications isDesktopApp={isDesktopApp} />
        {content}
      </MaintenanceGuard>
    </IpBanCheck>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App