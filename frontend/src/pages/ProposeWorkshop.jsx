import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { workshopApi, workshopTypeApi } from "../api/endpoints";
import { PlusCircle, Calendar, FileText, Loader2, AlertCircle } from "lucide-react";

export default function ProposeWorkshop() {
  const navigate = useNavigate();
  const [workshopTypes, setWorkshopTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    workshop_type: "",
    date: "",
    tnc_accepted: false,
  });
  const [tncContent, setTncContent] = useState("");

  useEffect(() => {
    async function fetchTypes() {
      try {
        const res = await workshopTypeApi.list();
        setWorkshopTypes(res.data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchTypes();
  }, []);

  const handleTypeChange = async (e) => {
    const typeId = e.target.value;
    setForm({ ...form, workshop_type: typeId });
    if (typeId) {
      try {
        const res = await workshopTypeApi.getTnC(typeId);
        setTncContent(res.data.terms_and_conditions);
      } catch {
        setTncContent("Could not load terms and conditions.");
      }
    } else {
      setTncContent("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.tnc_accepted) {
      setError("You must accept the terms and conditions");
      return;
    }
    setSubmitting(true);
    try {
      await workshopApi.proposeWorkshop(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to propose workshop");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Propose a Workshop</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="workshop_type" className="block text-sm font-medium text-gray-700 mb-1.5">
              Workshop Type
            </label>
            <select
              id="workshop_type"
              value={form.workshop_type}
              onChange={handleTypeChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm bg-white"
            >
              <option value="">Select a workshop type</option>
              {workshopTypes.map((wt) => (
                <option key={wt.id} value={wt.id}>{wt.name} ({wt.duration} day{wt.duration > 1 ? "s" : ""})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Preferred Date
            </label>
            <input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm"
            />
          </div>

          {tncContent && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" /> Terms & Conditions
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {tncContent}
              </p>
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.tnc_accepted}
              onChange={(e) => setForm({ ...form, tnc_accepted: e.target.checked })}
              className="mt-1 w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
            <span className="text-sm text-gray-600">
              I accept the terms and conditions for this workshop
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting || !form.tnc_accepted}
            className="w-full py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Propose Workshop"}
          </button>
        </form>
      </div>
    </div>
  );
}
