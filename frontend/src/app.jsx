import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/header';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Results from './pages/Results';
import BatchResults from './pages/BatchResults';
import History from './pages/History';
import Login from './pages/Login';
import Profile from './pages/Profile';
import FAQ from './pages/FAQ';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
    <Router>
          <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/results" element={<Results />} />
              <Route path="/batch-results" element={<BatchResults />} />
          <Route path="/history" element={<History />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </main>
    </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}
