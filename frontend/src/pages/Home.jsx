import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, BarChart3, Users, ArrowRight, GraduationCap, MapPin } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="text-center py-10 sm:py-20">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border text-xs font-medium text-gray-500 mb-6 animate-fade-up">
          <GraduationCap className="w-3.5 h-3.5" />
          IIT Bombay
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-black mb-4 animate-fade-up animate-delay-100">
          FOSSEE Workshop Booking
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed animate-fade-up animate-delay-200 font-light">
          Book and manage workshops conducted by FOSSEE across India.
          Coordinators propose, instructors accept.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up animate-delay-300">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-black text-black text-sm font-medium hover:bg-black hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        <FeatureCard icon={<BookOpen className="w-5 h-5" />} title="Book Workshops" description="Propose workshops at your institution with available FOSSEE instructors" delay="animate-delay-300" />
        <FeatureCard icon={<BarChart3 className="w-5 h-5" />} title="View Statistics" description="Explore workshop data across India with interactive charts and filters" delay="animate-delay-400" />
        <FeatureCard icon={<Users className="w-5 h-5" />} title="Manage Profiles" description="Keep your institutional details updated for smooth coordination" delay="animate-delay-500" />
      </div>

      <div className="mt-8 sm:mt-12 border border-border p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm mb-1">Workshops across India</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              FOSSEE conducts workshops at colleges and universities across all states in India.
              Browse upcoming workshops or propose one at your institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <div className={`bg-white border border-border p-5 card-hover animate-fade-up ${delay || ""}`}>
      <div className="text-black mb-3">{icon}</div>
      <h3 className="font-medium text-sm mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed font-light">{description}</p>
    </div>
  );
}
