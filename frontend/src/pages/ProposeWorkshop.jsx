import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { workshopApi, workshopTypeApi } from "../api/endpoints";
import { useMinLoading } from "../hooks/useMinLoading";
import { PlusCircle, Calendar, FileText, Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from "../components/Skeleton";

function unwrap(res) {
  return res.data.results ?? res.data;
}

export default function ProposeWorkshop() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    workshop_type: "",
    date: "",
    tnc_accepted: false,
  });
  const [tncContent, setTncContent] = useState("");

  const { loading, data: workshopTypes } = useMinLoading(
    async () => {
      const res = await workshopTypeApi.list();
      return unwrap(res);
    },
    [],
    600
  );

  const handleTypeChange = async (e) => {
    const typeId = e.target.value;
    setForm({ ...form, workshop_type: typeId });
    if (typeId) {
      try {
        const res = await workshopTypeApi.getTnC(typeId);
        setTncContent(res.data.terms_and_conditions || "");
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 shimmer" />
          <div className="h-7 w-48 shimmer" />
        </div>
        <div className="bg-white border border-border shadow-sm p-7 space-y-5">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-black flex items-center justify-center">
          <PlusCircle className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Propose a Workshop</h1>
      </div>

      <div className="bg-white border border-border shadow-sm p-7">
        {error && (
          <div className="border border-red-200 text-red-700 px-4 py-3 mb-4 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {!workshopTypes || workshopTypes.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No workshop types available yet.</p>
            <p className="text-gray-400 text-sm mt-1 font-light">Please check back later or contact an admin.</p>
          </div>
        ) : (
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
                className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm bg-white"
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
                className="w-full px-4 py-2.5 border border-gray-300 focus:border-black outline-none transition-colors text-sm"
              />
            </div>

            {tncContent && (
              <div className="bg-surface p-4 border border-border">
                <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4" /> Terms & Conditions
                </div>
                <p className="text-sm text-gray-600 font-light whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {tncContent}
                </p>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.tnc_accepted}
                onChange={(e) => setForm({ ...form, tnc_accepted: e.target.checked })}
                className="mt-1 w-4 h-4 text-accent border-gray-300 focus:border-black"
              />
              <span className="text-sm text-gray-600 font-light">
                I accept the terms and conditions for this workshop
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !form.tnc_accepted}
              className="w-full py-2.5 bg-black text-white hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : "Propose Workshop"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
