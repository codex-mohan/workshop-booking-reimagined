import { useState } from "react";
import { statsApi, filterApi } from "../api/endpoints";
import { useMinLoading } from "../hooks/useMinLoading";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { BarChart3, Filter, Calendar, MapPin } from "lucide-react";
import { SkeletonChart, SkeletonRow } from "../components/Skeleton";

export default function Statistics() {
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const { loading, data, error, setData } = useMinLoading(
    async () => {
      const [statsRes, filterRes] = await Promise.all([
        statsApi.getPublicStats(),
        filterApi.getOptions(),
      ]);
      return { stats: statsRes.data, filters: filterRes.data };
    },
    [],
    800
  );

  const applyFilters = async () => {
    const params = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (selectedState) params.state = selectedState;
    if (selectedType) params.workshop_type = selectedType;
    const res = await statsApi.getPublicStats(params);
    setData({ stats: res.data, filters: data?.filters });
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 shimmer" />
          <div className="h-7 w-48 shimmer" />
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

  const stats = data?.stats;
  const filters = data?.filters;

  const stateChartData = (stats?.state_chart?.labels || []).map((label, i) => ({
    state: label,
    count: stats?.state_chart?.data?.[i] || 0,
  }));

  const typeChartData = (stats?.type_chart?.labels || []).map((label, i) => ({
    type: label,
    count: stats?.type_chart?.data?.[i] || 0,
  }));

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-800">Workshop Statistics</h1>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-border shadow-sm p-4 sm:p-5 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm bg-white"
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
                className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm bg-white"
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
            className="mt-4 px-5 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Apply Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title="Workshops by State" data={stateChartData} dataKey="count" xKey="state" color="#0070f3" />
        <ChartCard title="Workshops by Type" data={typeChartData} dataKey="count" xKey="type" color="#7928ca" />
      </div>

      <h2 className="text-lg font-semibold tracking-tight text-gray-700 mb-3">
        Upcoming Workshops ({stats?.total || 0})
      </h2>

      {stats?.workshops?.length === 0 ? (
        <div className="text-center py-12 bg-white border border-border shadow-sm">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-light">No upcoming workshops found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stats?.workshops?.map((ws, i) => (
            <div
              key={ws.id}
              className="bg-white p-4 border border-border shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 animate-fade-up card-hover"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="min-w-0">
                <h3 className="font-medium text-gray-800 text-sm truncate">{ws.workshop_type_name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{ws.date}</span>
                  {ws.coordinator_institute && (
                    <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3 shrink-0" />{ws.coordinator_institute}</span>
                  )}
                </div>
              </div>
              <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 shrink-0 w-fit">
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
    <div className="bg-white border border-border shadow-sm p-5">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">{title}</h3>
      {!data || data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8 font-light">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <XAxis dataKey={xKey} tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip color={color} />} />
            <Bar dataKey={dataKey} fill={color} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function CustomTooltip({ active, payload, label, color }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border shadow-sm px-3 py-2 text-sm">
      <p className="font-medium">{label}</p>
      <p style={{ color }}>{payload[0].value} workshops</p>
    </div>
  );
}
