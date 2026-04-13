import { useState } from "react";
import { workshopTypeApi } from "../api/endpoints";
import { useMinLoading } from "../hooks/useMinLoading";
import { BookOpen, Clock, FileText, Loader2 } from "lucide-react";
import { SkeletonCard } from "../components/Skeleton";

function unwrap(res) {
  return res.data.results ?? res.data;
}

export default function WorkshopTypes() {
  const [expanded, setExpanded] = useState(null);

  const { loading, data: types } = useMinLoading(
    async () => {
      const res = await workshopTypeApi.list();
      return unwrap(res);
    },
    [],
    600
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 shimmer" />
          <div className="h-7 w-44 shimmer" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-black flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Workshop Types</h1>
      </div>

      {!types || types.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border shadow-sm">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No workshop types available</h3>
          <p className="text-gray-400 text-sm mt-1 font-light">Workshop types will appear here once they are added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {types.map((wt) => (
            <div
              key={wt.id}
              className="bg-white border border-border shadow-sm hover:border-accent/20 card-hover transition-colors overflow-hidden"
            >
              <div className="p-5">
                <h2 className="font-semibold tracking-tight text-gray-800 text-lg">{wt.name}</h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-3 font-light">{wt.description}</p>
                <div className="flex items-center gap-1.5 text-sm text-accent mt-3">
                  <Clock className="w-4 h-4" />
                  {wt.duration} day{wt.duration > 1 ? "s" : ""}
                </div>
              </div>
              {wt.terms_and_conditions && (
                <>
                  <button
                    onClick={() => setExpanded(expanded === wt.id ? null : wt.id)}
                    className="w-full px-5 py-3 bg-surface text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 border-t border-border"
                  >
                    <FileText className="w-4 h-4" />
                    {expanded === wt.id ? "Hide" : "View"} Terms & Conditions
                  </button>
                  {expanded === wt.id && (
                    <div className="px-5 py-4 bg-surface border-t border-border animate-slide-down">
                      <p className="text-sm text-gray-600 font-light whitespace-pre-wrap">{wt.terms_and_conditions}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
