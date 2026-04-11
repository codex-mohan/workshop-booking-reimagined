import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { workshopApi, workshopTypeApi } from "../api/endpoints";
import {
  Calendar, Clock, MapPin, PlusCircle, CheckCircle,
  AlertCircle, Loader2, BookOpen,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [workshops, setWorkshops] = useState([]);
  const [workshopTypes, setWorkshopTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const endpoint = user?.is_instructor
          ? workshopApi.getInstructorWorkshops
          : workshopApi.getCoordinatorWorkshops;
        const [wsRes, typesRes] = await Promise.all([
          endpoint(),
          workshopTypeApi.list(),
        ]);
        setWorkshops(wsRes.data);
        setWorkshopTypes(typesRes.data);
      } catch (err) {
        setError("Failed to load workshops");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const pending = workshops.filter((w) => w.status === 0);
  const accepted = workshops.filter((w) => w.status === 1);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.full_name || user?.username}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {user?.is_instructor ? "Instructor" : "Coordinator"} &middot; {user?.profile?.institute}
          </p>
        </div>
        {!user?.is_instructor && (
          <Link
            to="/propose"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-light transition-colors font-medium text-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Propose Workshop
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Workshops" value={workshops.length} icon={<BookOpen className="w-5 h-5" />} color="bg-primary/10 text-primary" />
        <StatCard label="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} color="bg-warning/10 text-amber-600" />
        <StatCard label="Accepted" value={accepted.length} icon={<CheckCircle className="w-5 h-5" />} color="bg-success/10 text-success" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {workshops.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No workshops yet</h3>
          <p className="text-gray-400 text-sm mt-1">
            {!user?.is_instructor
              ? "Propose a workshop to get started"
              : "Pending workshops will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">
            {user?.is_instructor ? "Pending Requests" : "Your Workshops"}
          </h2>
          {workshops.map((ws) => (
            <WorkshopCard key={ws.id} workshop={ws} isInstructor={user?.is_instructor} />
          ))}
        </div>
      )}

      {workshopTypes.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Available Workshop Types</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workshopTypes.map((wt) => (
              <div key={wt.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:border-accent/30 hover:shadow-sm transition-all">
                <h3 className="font-semibold text-gray-800">{wt.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{wt.description}</p>
                <div className="flex items-center gap-1.5 text-xs text-accent mt-3">
                  <Clock className="w-3.5 h-3.5" />
                  {wt.duration} day{wt.duration > 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function WorkshopCard({ workshop, isInstructor }) {
  const statusColors = {
    0: "bg-amber-100 text-amber-700",
    1: "bg-green-100 text-green-700",
    2: "bg-red-100 text-red-700",
  };
  const statusLabels = { 0: "Pending", 1: "Accepted", 2: "Deleted" };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-800 truncate">
              {workshop.workshop_type_name}
            </h3>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[workshop.status]}`}>
              {statusLabels[workshop.status]}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {workshop.date}
            </span>
            {workshop.coordinator_institute && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {workshop.coordinator_institute}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isInstructor && workshop.status === 0 && (
            <AcceptButton workshopId={workshop.id} />
          )}
          <Link
            to={`/workshop/${workshop.id}`}
            className="px-4 py-2 text-sm font-medium text-accent hover:bg-accent/5 rounded-lg transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

function AcceptButton({ workshopId }) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await workshopApi.acceptWorkshop(workshopId);
      setAccepted(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-success">
        <CheckCircle className="w-4 h-4" /> Accepted
      </span>
    );
  }

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="px-4 py-2 bg-success text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
    >
      {loading ? "Accepting..." : "Accept"}
    </button>
  );
}
