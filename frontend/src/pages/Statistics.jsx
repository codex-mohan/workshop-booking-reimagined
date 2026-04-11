import { useState, useEffect } from "react";
import { statsApi, filterApi } from "../api/endpoints";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { BarChart3, Filter, Loader2, Calendar, MapPin } from "lucide-react";
import { SkeletonChart, SkeletonRow } from "../components/Skeleton";

export default function Statistics() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const [statsRes, filterRes] = await Promise.all([
          statsApi.getPublicStats(),
          filterApi.getOptions(),
        ]);
        setData(statsRes.data);
        setFilters(filterRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      if (selectedState) params.state = selectedState;
      if (selectedType) params.workshop_type = selectedType;
      const res = await statsApi.getPublicStats(params);
      setData(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-7 w-48 bg-gray-200 rounded-md animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="space-y-2">
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  const stateChartData = (data?.state_chart?.labels || []).map((label, i) => ({
    state: label,
    count: data?.state_chart?.data?.[i] || 0,
  }));

  const typeChartData = (data?.type_chart?.labels || []).map((label, i) => ({
    type: label,
    count: data?.type_chart?.data?.[i] || 0,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Workshop Statistics</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="">All States</option>
                {filters?.states?.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Workshop Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-accent outline-none"
              >
                <option value="">All Types</option>
                {filters?.workshop_types?.map((wt) => (
                  <option key={wt.id} value={wt.id}>{wt.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={applyFilters}
            className="mt-4 px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Workshops by State" data={stateChartData} dataKey="count" xKey="state" color="#04a9cf" />
        <ChartCard title="Workshops by Type" data={typeChartData} dataKey="count" xKey="type" color="#1e3a5f" />
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Upcoming Workshops ({data?.total || 0})
      </h2>

      {data?.workshops?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No upcoming workshops found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.workshops?.map((ws) => (
            <div key={ws.id} className="bg-white rounded-lg p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-medium text-gray-800 text-sm">{ws.workshop_type_name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ws.date}</span>
                  {ws.coordinator_institute && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{ws.coordinator_institute}</span>
                  )}
                </div>
              </div>
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 shrink-0">
                Confirmed
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, data, dataKey, xKey, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
