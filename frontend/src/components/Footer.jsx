import { BookOpen, Code2, Mail, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-white/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white text-sm">FOSSEE Workshops</span>
            </div>
            <p className="text-sm font-light leading-relaxed">
              Free and Open Source Software for Education. Conducting workshops at colleges across India.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="https://fossee.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors inline-flex items-center gap-1">FOSSEE <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://spoken-tutorial.org" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors inline-flex items-center gap-1">Spoken Tutorial <ExternalLink className="w-3 h-3" /></a></li>
              <li><a href="https://iitb.ac.in" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors inline-flex items-center gap-1">IIT Bombay <ExternalLink className="w-3 h-3" /></a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <a href="mailto:contact@fossee.in" className="hover:text-accent transition-colors">contact@fossee.in</a>
              </li>
              <li className="flex items-center gap-2">
                <Code2 className="w-4 h-4 shrink-0" />
                <a href="https://github.com/FOSSEE" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">FOSSEE on GitHub</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>Developed by FOSSEE group, IIT Bombay</p>
          <p>Built with Django + React</p>
        </div>
      </div>
    </footer>
  );
}
