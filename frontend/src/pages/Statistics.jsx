import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { statsApi, filterApi } from "../api/endpoints";
import { useMinLoading } from "../hooks/useMinLoading";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { BarChart3, Filter, Calendar, MapPin, Users, Download } from "lucide-react";
import { SkeletonChart, SkeletonRow } from "../components/Skeleton";

function IndiaMap({ data }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data || data.length <= 1) return;

    let resizeObserver;

    const drawChart = () => {
      if (!window.google?.visualization?.GeoChart || !containerRef.current) return;
      const el = containerRef.current;
      const w = el.offsetWidth;
      const h = Math.round(w * 0.6);
      el.style.width = w + "px";
      el.style.height = h + "px";
      const chart = new window.google.visualization.GeoChart(el);
      const tableData = window.google.visualization.arrayToDataTable(data);
      chart.draw(tableData, {
        region: "IN",
        resolution: "provinces",
        width: w,
        height: h,
        colorAxis: { colors: ["#e8f0fe", "#0070f3"] },
        datalessRegionColor: "#f5f5f5",
        defaultColor: "#f5f5f5",
        backgroundColor: "transparent",
        keepAspectRatio: false,
      });
    };

    const onLoad = () => {
      resizeObserver = new ResizeObserver(() => drawChart());
      if (containerRef.current) resizeObserver.observe(containerRef.current);
      drawChart();
    };

    if (window.google?.visualization?.GeoChart) {
      onLoad();
    } else if (window.google?.charts) {
      window.google.charts.load("current", { packages: ["geochart"] });
      window.google.charts.setOnLoadCallback(onLoad);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [data]);

  if (!data || data.length <= 1) {
    return <p className="text-sm text-gray-400 text-center py-8 font-light">No map data available</p>;
  }

  return <div ref={containerRef} className="w-full" style={{ height: 0, paddingBottom: "60%" }} />;
}

export default function Statistics() {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [instructorStats, setInstructorStats] = useState(null);

  const { loading, data, error, setData } = useMinLoading(
    async () => {
      const [statsRes, filterRes] = await Promise.all([
        statsApi.getPublicStats(),
        filterApi.getOptions(),
      ]);
      let instStats = null;
      if (user?.is_instructor || user?.is_admin) {
        try {
          const instRes = await statsApi.getInstructorStats();
          instStats = instRes.data;
        } catch {}
      }
      return { stats: statsRes.data, filters: filterRes.data, instructorStats: instStats };
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
    setData({ stats: res.data, filters: data?.filters, instructorStats: data?.instructorStats });
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
          <SkeletonRow /><SkeletonRow /><SkeletonRow />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const filters = data?.filters;
  const instStats = data?.instructorStats;

  const stateChartData = (stats?.state_chart?.labels || []).map((label, i) => ({
    state: label,
    count: stats?.state_chart?.data?.[i] || 0,
  }));

  const typeChartData = (stats?.type_chart?.labels || []).map((label, i) => ({
    type: label,
    count: stats?.type_chart?.data?.[i] || 0,
  }));

  const monthlyChartData = (stats?.monthly_chart?.labels || []).map((label, i) => ({
    month: label,
    count: stats?.monthly_chart?.data?.[i] || 0,
  }));

  const pieData = typeChartData.filter((d) => d.count > 0);
  const PIE_COLORS = ["#0070f3", "#7928ca", "#f5a623", "#50e3c2", "#e00", "#000"];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-black flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Workshop Statistics</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => statsApi.downloadCsv({ from_date: fromDate, to_date: toDate, state: selectedState, workshop_type: selectedType })}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-border shadow-sm p-4 sm:p-5 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">State</label>
              <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm bg-white">
                <option value="">All States</option>
                {filters?.states?.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Workshop Type</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 focus:border-black outline-none text-sm bg-white">
                <option value="">All Types</option>
                {filters?.workshop_types?.map((wt) => (<option key={wt.id} value={wt.id}>{wt.name}</option>))}
              </select>
            </div>
          </div>
          <button onClick={applyFilters} className="mt-4 px-5 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium">
            Apply Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Workshops by State" data={stateChartData} dataKey="count" xKey="state" color="#0070f3" />
        <ChartCard title="Workshops by Type" data={typeChartData} dataKey="count" xKey="type" color="#7928ca" />
      </div>

      <div className="bg-white border border-border shadow-sm p-5 mb-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Workshops Across India</h3>
        <IndiaMap data={stats?.state_map_data} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard title={`Monthly Count (${new Date().getFullYear()})`} data={monthlyChartData} dataKey="count" xKey="month" color="#50e3c2" />
        <div className="bg-white border border-border shadow-sm p-5">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Workshop Type Distribution</h3>
          {!pieData || pieData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8 font-light">No data available</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="type" strokeWidth={1} stroke="#fff">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {pieData.map((d, i) => (
                  <span key={d.type} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-2 h-2" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {d.type}: {d.count}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {(user?.is_instructor || user?.is_admin) && instStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StatsTable title="Instructor Statistics" data={instStats.instructors} />
          <StatsTable title="Coordinator Statistics" data={instStats.coordinators} />
        </div>
      )}

      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
        Workshops ({stats?.total || 0})
      </h2>

      {stats?.workshops?.length === 0 ? (
        <div className="text-center py-12 border border-border shadow-sm">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 font-light">No workshops found</p>
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
                <h3 className="font-medium text-sm truncate">{ws.workshop_type_name}</h3>
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

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border shadow-sm px-3 py-2 text-sm">
      <p className="font-medium">{payload[0].name}</p>
      <p className="text-gray-600">{payload[0].value} workshops</p>
    </div>
  );
}

function StatsTable({ title, data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="bg-white border border-border shadow-sm">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
      </div>
      {data.map((d, i) => (
        <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-border last:border-b-0 card-hover">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{d.name}</p>
            <p className="text-xs text-gray-400 truncate">{d.institute}</p>
          </div>
          <span className="text-sm font-semibold shrink-0 ml-3">{d.workshop_count}</span>
        </div>
      ))}
    </div>
  );
}


