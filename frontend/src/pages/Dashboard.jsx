import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { workshopApi, workshopTypeApi } from "../api/endpoints";
import { useMinLoading } from "../hooks/useMinLoading";
import {
  Calendar, Clock, MapPin, PlusCircle, CheckCircle,
  AlertCircle, Loader2, BookOpen,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { SkeletonStatCard, SkeletonRow, SkeletonCard } from "../components/Skeleton";

function unwrap(res) {
  return res.data.results ?? res.data;
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 500;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { loading, data, error, setData: _ } = useMinLoading(
    async () => {
      const endpoint = user?.is_instructor
        ? workshopApi.getInstructorWorkshops
        : workshopApi.getCoordinatorWorkshops;
      const [wsRes, typesRes] = await Promise.all([endpoint(), workshopTypeApi.list()]);
      return { workshops: unwrap(wsRes), workshopTypes: unwrap(typesRes) };
    },
    [user],
    600
  );

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <div className="h-6 w-40 shimmer mb-2" />
          <div className="h-4 w-52 shimmer" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
        </div>
        <div className="space-y-2"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>
      </div>
    );
  }

  const workshops = data?.workshops || [];
  const workshopTypes = data?.workshopTypes || [];
  const pending = workshops.filter((w) => w.status === 0);
  const accepted = workshops.filter((w) => w.status === 1);
  const deleted = workshops.filter((w) => w.status === 2);

  const pieData = [
    { name: "Pending", value: pending.length, color: "#f5a623" },
    { name: "Accepted", value: accepted.length, color: "#0070f3" },
    { name: "Rejected", value: deleted.length, color: "#e00" },
  ].filter((d) => d.value > 0);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {user?.full_name || user?.username}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.is_instructor ? "Instructor" : "Coordinator"} &middot; {user?.profile?.institute}
          </p>
        </div>
        {!user?.is_instructor && (
          <Link
            to="/propose"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Propose Workshop
          </Link>
        )}
      </div>

      {error && (
        <div className="border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {workshops.length === 0 ? (
        <div className="text-center py-16 border border-border">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium">No workshops yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            {!user?.is_instructor ? "Propose a workshop to get started" : "Pending workshops will appear here"}
          </p>
          {!user?.is_instructor && (
            <Link to="/propose" className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
              <PlusCircle className="w-4 h-4" /> Propose Workshop
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            <StatCard label="Total" value={workshops.length} borderColor="#000" icon={<BookOpen className="w-4 h-4" />} />
            <StatCard label="Pending" value={pending.length} borderColor="#f5a623" icon={<Clock className="w-4 h-4" />} />
            <StatCard label="Accepted" value={accepted.length} borderColor="#0070f3" icon={<CheckCircle className="w-4 h-4" />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-2">
              <h2 className="text-sm font-medium text-gray-500 mb-3">
                {user?.is_instructor ? "Pending Requests" : "Your Workshops"}
              </h2>
              {workshops.slice(0, 10).map((ws, i) => (
                <WorkshopCard key={ws.id} workshop={ws} isInstructor={user?.is_instructor} index={i} />
              ))}
            </div>

            {pieData.length > 0 && (
              <div className="border border-border p-5 shadow-sm">
                <h3 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-3">
                  {pieData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-2 h-2" style={{ backgroundColor: d.color }} />
                      {d.name}: {d.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {workshopTypes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Available Types</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {workshopTypes.map((wt) => (
              <div key={wt.id} className="bg-white border border-border p-4 card-hover">
                <h3 className="font-medium text-sm">{wt.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 font-light">{wt.description}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400 mt-2.5">
                  <Clock className="w-3 h-3" />{wt.duration} day{wt.duration > 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, borderColor, icon }) {
  return (
    <div className="bg-white border border-border p-4 shadow-sm" style={{ borderLeft: `3px solid ${borderColor}` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-semibold mt-1"><AnimatedNumber value={value} /></p>
        </div>
        <div className="w-8 h-8 bg-surface flex items-center justify-center text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function WorkshopCard({ workshop, isInstructor, index }) {
  const statusStyles = { 0: "bg-amber-50 text-amber-700", 1: "bg-green-50 text-green-700", 2: "bg-red-50 text-red-700" };
  const statusLabels = { 0: "Pending", 1: "Accepted", 2: "Deleted" };

  return (
    <div
      className="bg-white border border-border p-4 card-hover animate-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm truncate">{workshop.workshop_type_name}</h3>
            <span className={`px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[workshop.status]}`}>
              {statusLabels[workshop.status]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{workshop.date}</span>
            {workshop.coordinator_institute && (
              <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" />{workshop.coordinator_institute}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isInstructor && workshop.status === 0 && (
            <>
              <AcceptButton workshopId={workshop.id} />
              <RejectButton workshopId={workshop.id} />
            </>
          )}
          <Link to={`/workshop/${workshop.id}`} className="px-3 py-1.5 text-xs font-medium hover:bg-surface transition-colors">
            View &rarr;
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
    } catch {} finally {
      setLoading(false);
    }
  };

  if (accepted) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 animate-checkmark">
        <CheckCircle className="w-3.5 h-3.5" /> Accepted
      </span>
    );
  }

  return (
    <button onClick={handleAccept} disabled={loading} className="px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1">
      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      {loading ? "Accepting..." : "Accept"}
    </button>
  );
}

function RejectButton({ workshopId }) {
  const [loading, setLoading] = useState(false);
  const [rejected, setRejected] = useState(false);

  const handleReject = async () => {
    setLoading(true);
    try {
      await workshopApi.rejectWorkshop(workshopId);
      setRejected(true);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (rejected) {
    return (
      <span className="text-xs font-medium text-red-600 animate-checkmark">Rejected</span>
    );
  }

  return (
    <button onClick={handleReject} disabled={loading} className="px-3 py-1.5 border border-border text-xs font-medium hover:bg-surface transition-colors disabled:opacity-50 inline-flex items-center gap-1">
      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      {loading ? "Rejecting..." : "Reject"}
    </button>
  );
}

function CustomPieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-border shadow-sm px-3 py-2 text-xs">
      <span className="font-medium">{d.name}</span>: {d.value}
    </div>
  );
}
