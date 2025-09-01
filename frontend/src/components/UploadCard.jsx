import { Link } from 'react-router-dom';
import { UploadCloud } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-center">
      <h1 className="text-4xl font-hank text-pathlo mb-4">Welcome to PlantDetect</h1>
      <p className="text-lg font-helvetica text-axolotl mb-6 max-w-xl">
        Upload a photo of a plant leaf and let our AI model detect potential diseases with confidence scores.
      </p>

      <Link
        to="/upload"
        className="bg-deer hover:bg-royalbrown text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 inline-flex items-center gap-2"
      >
        <UploadCloud className="w-5 h-5" /> Upload Image
      </Link>
    </div>
  );
}
