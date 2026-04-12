import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, BarChart3, Users, ArrowRight, GraduationCap, MapPin } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="text-center py-8 sm:py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium mb-6 animate-fade-up">
          <GraduationCap className="w-4 h-4" />
          IIT Bombay
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-4 leading-tight animate-fade-up animate-delay-100">
          FOSSEE<br className="sm:hidden" /> Workshop Booking
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed animate-fade-up animate-delay-200">
          Book and manage workshops conducted by FOSSEE. Coordinators propose workshops at their
          institution, and instructors accept and conduct them across India.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up animate-delay-300">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/20"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium shadow-lg shadow-primary/20"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8">
        <FeatureCard
          icon={<BookOpen className="w-7 h-7" />}
          title="Book Workshops"
          description="Propose workshops at your institution with available FOSSEE instructors"
          delay="animate-delay-300"
        />
        <FeatureCard
          icon={<BarChart3 className="w-7 h-7" />}
          title="View Statistics"
          description="Explore workshop data across India with interactive charts and filters"
          delay="animate-delay-400"
        />
        <FeatureCard
          icon={<Users className="w-7 h-7" />}
          title="Manage Profiles"
          description="Keep your institutional details updated for smooth coordination"
          delay="animate-delay-400"
        />
      </div>

      <div className="mt-12 bg-primary/5 rounded-2xl p-6 sm:p-8 border border-primary/10">
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-accent shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Workshops across India</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
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
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover animate-fade-up ${delay || ""}`}>
      <div className="text-accent mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
