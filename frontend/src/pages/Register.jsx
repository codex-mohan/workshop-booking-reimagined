import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../api/endpoints";
import { UserPlus, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirm_password: "",
    first_name: "", last_name: "", phone_number: "",
    institute: "", department: "", location: "", state: "IN-MH",
    title: "Mr", how_did_you_hear_about_us: "FOSSEE website",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(", ");
        setError(msgs);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6 sm:mt-8 animate-scale-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 sm:p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" name="first_name" value={form.first_name} onChange={handleChange} required />
            <Field label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Username" name="username" value={form.username} onChange={handleChange} required />
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-shadow text-sm pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Field label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange} required />
          </div>

          <Field label="Institute" name="institute" value={form.institute} onChange={handleChange} required placeholder="Full name of your institute" />
          <Field label="Phone Number" name="phone_number" value={form.phone_number} onChange={handleChange} required placeholder="10-digit number" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField label="Title" name="title" value={form.title} onChange={handleChange}
              options={[["Mr", "Mr."], ["Mrs", "Mrs."], ["Miss", "Ms."], ["Professor", "Prof."], ["Doctor", "Dr."]]} />
            <SelectField label="Department" name="department" value={form.department} onChange={handleChange}
              options={[["computer engineering", "Computer Science"], ["information technology", "Information Technology"], ["civil engineering", "Civil Engineering"], ["electrical engineering", "Electrical Engineering"], ["mechanical engineering", "Mechanical Engineering"], ["chemical engineering", "Chemical Engineering"], ["aerospace engineering", "Aerospace Engineering"], ["biosciences and bioengineering", "Biosciences and BioEngineering"], ["electronics", "Electronics"], ["energy science and engineering", "Energy Science and Engineering"]]} />
          </div>

          <Field label="City / Location" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Mumbai" />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-accent hover:underline font-medium">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = "text", placeholder }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-shadow text-sm"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-shadow text-sm bg-white"
      >
        {options.map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </div>
  );
}
