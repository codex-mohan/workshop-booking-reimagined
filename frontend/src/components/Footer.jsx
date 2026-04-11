import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">FOSSEE Workshops</span>
          </div>
          <p className="text-sm text-gray-400">
            Developed by FOSSEE group, IIT Bombay
          </p>
        </div>
      </div>
    </footer>
  );
}
