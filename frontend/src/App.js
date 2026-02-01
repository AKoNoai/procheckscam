import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ProfileDetail from './pages/ProfileDetail';
import Report from './pages/Report';
import WarningDetail from './pages/WarningDetail';
import Search from './pages/Search';
import InsuranceList from './pages/InsuranceList';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import MarketplaceCreate from './pages/MarketplaceCreate';
import About from './pages/About';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Terms from './pages/Terms';
import Contact from './pages/Contact';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Reports from './pages/admin/Reports';
import MarketplaceManagement from './pages/admin/MarketplaceManagement';
import NewsManagement from './pages/admin/NewsManagement';
import Settings from './pages/admin/Settings';
import BannerManagement from './pages/admin/BannerManagement';
import BotCheckManagement from './pages/admin/BotCheckManagement';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requireAdmin={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin={true}>
                <UserManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/reports" element={
              <ProtectedRoute requireAdmin={true}>
                <Reports />
              </ProtectedRoute>
            } />

            <Route path="/admin/marketplace" element={
              <ProtectedRoute requireAdmin={true}>
                <MarketplaceManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/news" element={
              <ProtectedRoute requireAdmin={true}>
                <NewsManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/banners" element={
              <ProtectedRoute requireAdmin={true}>
                <BannerManagement />
              </ProtectedRoute>
            } />

            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin={true}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/admin/bot-check" element={
              <ProtectedRoute requireAdmin={true}>
                <BotCheckManagement />
              </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="/*" element={
              <>
                <main className="main">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/admin-profile/:id" element={<ProfileDetail />} />
                    <Route path="/report" element={<Report />} />
                    <Route path="/warning/:id" element={<WarningDetail />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/insurance" element={<InsuranceList />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/marketplace/create" element={<MarketplaceCreate />} />
                    <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
