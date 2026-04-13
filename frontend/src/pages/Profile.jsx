import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { profileApi, authApi } from "../api/endpoints";
import { User, Save, Loader2, MapPin, Phone, Building, Lock } from "lucide-react";

export default function Profile() {
  const { user, refetch } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    setChangingPassword(true);
    setPasswordError("");
    try {
      await authApi.changePassword(passwordForm);
      setPasswordSuccess(true);
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || "Failed to change password");
    } finally {
      setChangingPassword(false);
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

      <div className="bg-white border border-border shadow-sm mt-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-sm text-gray-700">Change Password</h2>
            </div>
            {!showPasswordForm && (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Change
              </button>
            )}
          </div>
        </div>
        {showPasswordForm && (
          <div className="p-6 sm:p-7 animate-slide-down">
            {passwordSuccess && (
              <div className="border border-green-200 text-green-700 px-4 py-3 mb-4 text-sm">
                Password changed successfully!
              </div>
            )}
            {passwordError && (
              <div className="border border-red-200 text-red-700 px-4 py-3 mb-4 text-sm">
                {passwordError}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2.5 bg-black text-white hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordError("");
                    setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
                  }}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
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
