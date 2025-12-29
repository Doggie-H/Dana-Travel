/**
 * Component Dashboard quản trị.
 * Hiển thị các biểu đồ thống kê traffic, logs và xu hướng tìm kiếm.
 */

import { useEffect, useRef } from "react";

export default function AdminDashboard({ accessLogs, health, trafficStats, trendStats }) {
  // Refs cho Canvas Element
  const visitorChartRef = useRef(null);
  const internalChartRef = useRef(null);
  const trendChartRef = useRef(null);
  
  // Refs lưu trữ Chart Instance để update/destroy
  const visitorInstanceRef = useRef(null);
  const internalInstanceRef = useRef(null);
  const trendInstanceRef = useRef(null);

  /**
   * Hàm khởi tạo và vẽ biểu đồ
   * Sử dụng dynamic import để load Chart.js (tối ưu performance)
   */
  async function buildCharts() {
    let Chart;
    try {
      const mod = await import("chart.js/auto");
      Chart = mod.default || mod.Chart || mod;
    } catch (e) {
      console.error("Lỗi khi tải thư viện Chart.js", e);
      return;
    }

    // --- 1. VISITOR TRAFFIC CHART (LINE) ---
    let labels = trafficStats?.length > 0 ? trafficStats.map(s => s.date) : ["Hôm nay"];
    let visitorData = trafficStats?.length > 0 ? trafficStats.map(s => s.visitors) : [0];

    // Fix: Nếu chỉ có 1 điểm dữ liệu, thêm điểm giả để vẽ được đường thẳng
    if (visitorData.length === 1) {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayLabel = yesterday.toISOString().split('T')[0];
      
      labels = [yesterdayLabel, ...labels];
      visitorData = [0, ...visitorData];
    }

    if (visitorInstanceRef.current) {
      // Update chart nếu đã tồn tại
      visitorInstanceRef.current.data.labels = labels;
      visitorInstanceRef.current.data.datasets[0].data = visitorData;
      visitorInstanceRef.current.data.datasets[0].pointRadius = 6;
      visitorInstanceRef.current.data.datasets[0].pointHoverRadius = 8;
      visitorInstanceRef.current.update();
    } else if (visitorChartRef.current) {
      // Tạo mới chart
      visitorInstanceRef.current = new Chart(visitorChartRef.current.getContext("2d"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Khách truy cập (Guest)",
              data: visitorData,
              borderColor: "#2563eb",
              backgroundColor: "rgba(37, 99, 235, 0.1)",
              tension: 0.4, // Đường cong mềm mại
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Lưu lượng khách truy cập" },
          },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    // --- 2. INTERNAL ACTIVITY CHART (BAR) ---
    const internalData = trafficStats?.length > 0 ? trafficStats.map(s => s.internal) : [0];

    if (internalInstanceRef.current) {
      internalInstanceRef.current.data.labels = labels;
      internalInstanceRef.current.data.datasets[0].data = internalData;
      internalInstanceRef.current.update();
    } else if (internalChartRef.current) {
      internalInstanceRef.current = new Chart(internalChartRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Hoạt động nội bộ (Admin/Staff)",
              data: internalData,
              backgroundColor: "#ef4444",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Hoạt động quản trị" },
          },
          scales: { y: { beginAtZero: true } },
        },
      });
    }

    // --- 3. USER TRENDS CHART (BAR - COLORED) ---
    const trendLabels = trendStats?.length > 0 ? trendStats.map(t => t.tag) : ["Chưa có dữ liệu"];
    const trendData = trendStats?.length > 0 ? trendStats.map(t => t.count) : [0];
    
    // Màu sắc ngẫu nhiên cho từng cột
    const backgroundColors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)',
      'rgba(40, 159, 64, 0.6)',
      'rgba(210, 99, 132, 0.6)',
    ];

    if (trendInstanceRef.current) {
      trendInstanceRef.current.data.labels = trendLabels;
      trendInstanceRef.current.data.datasets[0].data = trendData;
      trendInstanceRef.current.data.datasets[0].backgroundColor = backgroundColors.slice(0, trendLabels.length);
      trendInstanceRef.current.data.datasets[0].borderColor = backgroundColors.slice(0, trendLabels.length).map(c => c.replace('0.6', '1'));
      trendInstanceRef.current.update();
    } else if (trendChartRef.current) {
      trendInstanceRef.current = new Chart(trendChartRef.current.getContext("2d"), {
        type: "bar",
        data: {
          labels: trendLabels,
          datasets: [{
            label: 'Lượt tìm kiếm',
            data: trendData,
            backgroundColor: backgroundColors.slice(0, trendLabels.length),
            borderColor: backgroundColors.slice(0, trendLabels.length).map(c => c.replace('0.6', '1')),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: "Xu hướng tìm kiếm (Theo thẻ)" },
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        },
      });
    }
  }

  // Effect: Vẽ lại biểu đồ khi dữ liệu thay đổi
  useEffect(() => {
    buildCharts();
  }, [trafficStats, trendStats]);

  // Effect: Cleanup chart instances khi component unmount
  useEffect(() => {
    return () => {
      if (visitorInstanceRef.current) visitorInstanceRef.current.destroy();
      if (internalInstanceRef.current) internalInstanceRef.current.destroy();
      if (trendInstanceRef.current) trendInstanceRef.current.destroy();
    };
  }, []);

  /**
   * Xuất dữ liệu Access Logs ra file CSV
   */
  const exportAccessLogsCSV = () => {
    if (!accessLogs || accessLogs.length === 0) return;

    const headers = ["Thời gian", "Người dùng", "Hành động", "IP"];
    const rows = accessLogs.map(log => [
      `"${new Date(log.ts || log.timestamp).toLocaleString("vi-VN")}"`,
      `"${log.username || "Guest"}"`,
      `"${log.action || log.method + " " + log.endpoint}"`,
      `"${log.ip}"`
    ]);

    const csvContent = "\uFEFF" + [ // BOM for Excel UTF-8
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "access_logs.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* --- HEALTH STATUS CARD --- */}
      {health && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Trạng thái hệ thống</h3>
            <p className="text-sm text-gray-500">Cập nhật lần cuối: {new Date(health.ts).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-gray-900">{health.count}</p>
              <p className="text-xs text-gray-400 font-bold uppercase">Địa điểm</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* --- CHARTS GRID --- */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Visitor Traffic */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <canvas ref={visitorChartRef} />
        </div>
        
        {/* Internal Activity */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <canvas ref={internalChartRef} />
        </div>

        {/* User Trends - Full Width */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
           <div className="w-full max-w-lg h-96">
             <canvas ref={trendChartRef} />
           </div>
        </div>
      </div>

      {/* --- LOGS TABLE --- */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Nhật ký truy cập (Gần đây)</h3>
          <button
            onClick={exportAccessLogsCSV}
            className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold uppercase rounded-lg hover:bg-gray-100 transition-colors"
          >
            Xuất CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!accessLogs || accessLogs.length === 0) ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                    Chưa có dữ liệu nhật ký
                  </td>
                </tr>
              ) : (
                accessLogs.slice(0, 10).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(log.ts || log.timestamp).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {log.username || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
