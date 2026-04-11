import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { workshopApi } from "../api/endpoints";
import {
  Calendar, MapPin, User, MessageSquare, Send,
  ArrowLeft, Loader2, CheckCircle, Clock,
} from "lucide-react";
import { SkeletonText, Skeleton } from "../components/Skeleton";

export default function WorkshopDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await workshopApi.getWorkshop(id);
        setData(res.data);
      } catch {
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id, navigate]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const res = await workshopApi.addComment(id, {
        comment,
        public: user?.is_instructor ? true : true,
      });
      setData((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), res.data],
      }));
      setComment("");
    } catch {
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="h-4 w-20 bg-gray-200 rounded-md animate-pulse mb-4" />
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-6 w-48 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-44" />
            </div>
            <div className="border-t border-gray-100 pt-6">
              <SkeletonText lines={4} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ws = data?.workshop;
  const comments = data?.comments || [];

  const statusStyles = {
    0: "bg-amber-100 text-amber-700",
    1: "bg-green-100 text-green-700",
    2: "bg-red-100 text-red-700",
  };
  const statusLabels = { 0: "Pending", 1: "Accepted", 2: "Deleted" };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-primary/5 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800">
              {ws?.workshop_type_name}
            </h1>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[ws?.status]}`}>
              {statusLabels[ws?.status]}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Date" value={ws?.date} />
            <InfoRow icon={<MapPin className="w-4 h-4" />} label="Institute" value={ws?.coordinator_institute} />
            <InfoRow icon={<User className="w-4 h-4" />} label="Coordinator" value={ws?.coordinator_name} />
            {ws?.instructor_name && (
              <InfoRow icon={<CheckCircle className="w-4 h-4" />} label="Instructor" value={ws?.instructor_name} />
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Comments
            </h2>

            <form onSubmit={handleComment} className="flex gap-2 mb-6">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none text-sm"
              />
              <button
                type="submit"
                disabled={posting || !comment.trim()}
                className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {comments.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No comments yet</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">{c.author_name}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(c.created_date).toLocaleDateString()}
                      </span>
                      {!c.public && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Private</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400">{icon}</span>
      <span className="text-gray-500">{label}:</span>
      <span className="font-medium text-gray-800">{value || "—"}</span>
    </div>
  );
}
