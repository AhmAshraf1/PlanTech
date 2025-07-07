import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Results from './pages/Results';
import History from './pages/History';

export default function App() {
  return (
    <Router>
      <header className="bg-pathlo text-white p-4 flex justify-between items-center shadow-md">
        <Link to="/" className="text-2xl font-hank text-asparagus">PlanTech</Link>
        <nav className="space-x-4 font-helvetica">
          <Link to="/upload" className="hover:underline">Upload</Link>
          <Link to="/history" className="hover:underline">History</Link>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/results" element={<Results />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </Router>
  );
}
