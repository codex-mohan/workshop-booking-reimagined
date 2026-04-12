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
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-7 w-44 bg-gray-200 rounded-md animate-pulse" />
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
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Workshop Types</h1>
      </div>

      {!types || types.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-gray-600 font-medium">No workshop types available</h3>
          <p className="text-gray-400 text-sm mt-1">Workshop types will appear here once they are added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {types.map((wt) => (
            <div
              key={wt.id}
              className="bg-white rounded-xl border border-gray-100 hover:border-accent/20 hover:shadow-sm transition-all overflow-hidden"
            >
              <div className="p-5">
                <h2 className="font-semibold text-gray-800 text-lg">{wt.name}</h2>
                <p className="text-sm text-gray-500 mt-2 line-clamp-3">{wt.description}</p>
                <div className="flex items-center gap-1.5 text-sm text-accent mt-3">
                  <Clock className="w-4 h-4" />
                  {wt.duration} day{wt.duration > 1 ? "s" : ""}
                </div>
              </div>
              {wt.terms_and_conditions && (
                <>
                  <button
                    onClick={() => setExpanded(expanded === wt.id ? null : wt.id)}
                    className="w-full px-5 py-3 bg-gray-50 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 border-t border-gray-100"
                  >
                    <FileText className="w-4 h-4" />
                    {expanded === wt.id ? "Hide" : "View"} Terms & Conditions
                  </button>
                  {expanded === wt.id && (
                    <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{wt.terms_and_conditions}</p>
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
