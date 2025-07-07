import { Link } from 'react-router-dom';
import { Leaf, UploadCloud, History } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-pathlo text-white p-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-2xl font-hank text-asparagus flex items-center gap-2 transition-all duration-300">
        <Leaf className="w-6 h-6 animate-bounce" />
        PlantDetect
      </Link>
      <nav className="space-x-4 font-helvetica">
        <Link
          to="/upload"
          className="hover:text-asparagus transition-colors duration-300 inline-flex items-center gap-1"
        >
          <UploadCloud className="w-4 h-4" /> Upload
        </Link>
        <Link
          to="/history"
          className="hover:text-asparagus transition-colors duration-300 inline-flex items-center gap-1"
        >
          <History className="w-4 h-4" /> History
        </Link>
      </nav>
    </header>
  );
}