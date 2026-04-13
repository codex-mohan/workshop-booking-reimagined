import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminApi, workshopTypeApi } from "../api/endpoints";
import { useMinLoading } from "../hooks/useMinLoading";
import {
  Shield, Users, BookOpen, ArrowUp, ArrowDown,
  Loader2, PlusCircle, Trash2,
} from "lucide-react";
import { Skeleton } from "../components/Skeleton";

function unwrap(res) {
  return res.data.results ?? res.data;
}

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("users");

  if (!user?.is_admin) {
    return (
      <div className="text-center py-16 border border-border">
        <Shield className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <h3 className="font-medium">Access Denied</h3>
        <p className="text-sm text-gray-500 mt-1">You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-black flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Admin Panel</h1>
      </div>

      <div className="flex gap-0 border-b border-border mb-6">
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "users" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          <Users className="w-4 h-4 inline mr-1.5" />Users
        </button>
        <button
          onClick={() => setTab("workshops")}
          className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "workshops" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-1.5" />Workshops
        </button>
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "workshops" && <WorkshopsTab />}
    </div>
  );
}

function UsersTab() {
  const { loading, data: users, setData } = useMinLoading(
    async () => {
      const res = await adminApi.getUsers();
      return res.data;
    },
    [],
    600
  );
  const [actionLoading, setActionLoading] = useState(null);

  const handlePromote = async (userId) => {
    setActionLoading(userId);
    try {
      await adminApi.promoteUser(userId);
      setData((prev) => prev.map((u) => u.id === userId ? { ...u, is_instructor: true, position: "instructor" } : u));
    } catch {} finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (userId) => {
    setActionLoading(userId);
    try {
      await adminApi.demoteUser(userId);
      setData((prev) => prev.map((u) => u.id === userId ? { ...u, is_instructor: false, position: "coordinator" } : u));
    } catch {} finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-border">
      <div className="grid grid-cols-12 gap-0 text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-2.5 border-b border-border bg-surface">
        <div className="col-span-3 sm:col-span-2">User</div>
        <div className="col-span-3 hidden sm:block">Institute</div>
        <div className="col-span-3 sm:col-span-2">Role</div>
        <div className="col-span-6 sm:col-span-5 text-right">Actions</div>
      </div>
      {users?.map((u) => (
        <div key={u.id} className="grid grid-cols-12 gap-0 items-center px-4 py-3 border-b border-border last:border-b-0 card-hover">
          <div className="col-span-3 sm:col-span-2 min-w-0">
            <p className="text-sm font-medium truncate">{u.first_name} {u.last_name}</p>
            <p className="text-xs text-gray-400 truncate">{u.username}</p>
          </div>
          <div className="col-span-3 hidden sm:block text-sm text-gray-500 truncate">{u.institute || "—"}</div>
          <div className="col-span-3 sm:col-span-2">
            <span className={`text-xs font-medium px-1.5 py-0.5 ${
              u.is_staff ? "bg-black text-white" :
              u.is_instructor ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-600"
            }`}>
              {u.is_staff ? "Admin" : u.is_instructor ? "Instructor" : "Coordinator"}
            </span>
          </div>
          <div className="col-span-6 sm:col-span-5 flex items-center justify-end gap-2">
            {!u.is_staff && (
              u.is_instructor ? (
                <button
                  onClick={() => handleDemote(u.id)}
                  disabled={actionLoading === u.id}
                  className="px-3 py-1.5 text-xs font-medium border border-border hover:bg-surface transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDown className="w-3 h-3" />}
                  Demote
                </button>
              ) : (
                <button
                  onClick={() => handlePromote(u.id)}
                  disabled={actionLoading === u.id}
                  className="px-3 py-1.5 text-xs font-medium bg-black text-white hover:bg-gray-800 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                >
                  {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUp className="w-3 h-3" />}
                  Make Instructor
                </button>
              )
            )}
            {u.is_staff && <span className="text-xs text-gray-400">Superuser</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkshopsTab() {
  const [showCreate, setShowCreate] = useState(false);
  const [workshopTypes, setWorkshopTypes] = useState([]);
  const [form, setForm] = useState({ workshop_type: "", date: "", coordinator: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      await adminApi.createWorkshop(form);
      setForm({ workshop_type: "", date: "", coordinator: "" });
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create workshop");
    } finally {
      setCreating(false);
    }
  };

  const loadTypes = async () => {
    const res = await workshopTypeApi.list();
    setWorkshopTypes(unwrap(res));
  };

  const openCreate = () => {
    loadTypes();
    setShowCreate(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Create workshops on behalf of coordinators.</p>
        <button
          onClick={openCreate}
          className="px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-1"
        >
          <PlusCircle className="w-3 h-3" /> Create Workshop
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-border shadow-sm p-5 mb-6 animate-slide-down">
          <h3 className="text-sm font-medium mb-4">Create New Workshop</h3>
          {error && <div className="border border-red-200 text-red-700 px-3 py-2 text-xs mb-3">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Workshop Type</label>
              <select
                value={form.workshop_type}
                onChange={(e) => setForm({ ...form, workshop_type: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm bg-white"
              >
                <option value="">Select type</option>
                {workshopTypes.map((wt) => (
                  <option key={wt.id} value={wt.id}>{wt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
              >
                {creating && <Loader2 className="w-3 h-3 animate-spin" />} Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-border text-sm hover:bg-surface transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <p className="text-sm text-gray-400 font-light">Workshop list can be managed from the Django admin at <code className="text-xs bg-surface px-1 py-0.5">/admin/</code></p>
    </div>
  );
}
