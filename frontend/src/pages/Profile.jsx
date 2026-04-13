import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../api/endpoints";
import { User, Save, Loader2, MapPin, Phone, Building } from "lucide-react";

export default function Profile() {
  const { user, refetch } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    title: "Mr",
    institute: "",
    department: "",
    phone_number: "",
    position: "coordinator",
    location: "",
    state: "IN-MH",
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        title: user.profile?.title || "Mr",
        institute: user.profile?.institute || "",
        department: user.profile?.department || "",
        phone_number: user.profile?.phone_number || "",
        position: user.profile?.position || "coordinator",
        location: user.profile?.location || "",
        state: user.profile?.state || "IN-MH",
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await profileApi.updateMe(form);
      await refetch();
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-black flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">My Profile</h1>
      </div>

      {success && (
        <div className="border border-blue-200 text-blue-700 px-4 py-3 mb-4 text-sm">
          Profile updated successfully!
        </div>
      )}

      <div className="bg-white border border-border shadow-sm overflow-hidden">
        <div className="bg-black px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 flex items-center justify-center text-white text-2xl font-bold">
              {(user.full_name || user.username).charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">{user.full_name || user.username}</h2>
              <p className="text-sm text-white/60 font-light">{user.profile?.position === "instructor" ? "Instructor" : "Coordinator"}</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-7">

        {!editing ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProfileField icon={<Building className="w-4 h-4" />} label="Institute" value={user.profile?.institute} />
              <ProfileField icon={<Phone className="w-4 h-4" />} label="Phone" value={user.profile?.phone_number} />
              <ProfileField icon={<MapPin className="w-4 h-4" />} label="Location" value={user.profile?.location} />
              <ProfileField icon={<User className="w-4 h-4" />} label="Department" value={user.profile?.department} />
            </div>

            <button
              onClick={() => setEditing(true)}
              className="px-5 py-2 bg-black text-white hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Institute</label>
              <input
                value={form.institute}
                onChange={(e) => setForm({ ...form, institute: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-sm">
      <span className="text-gray-400">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs font-light">{label}</p>
        <p className="font-medium text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}
