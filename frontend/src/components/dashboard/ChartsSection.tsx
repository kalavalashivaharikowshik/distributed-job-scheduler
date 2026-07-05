import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

type Props = {
  metrics: any;
};

export function ChartsSection({ metrics }: Props) {
  const jobStatusData = [
    { name: "Queued", value: metrics.queuedJobs },
    { name: "Scheduled", value: metrics.scheduledJobs },
    { name: "Running", value: metrics.runningJobs },
    { name: "Retrying", value: metrics.retryingJobs },
    { name: "Completed", value: metrics.completedJobs },
    { name: "DLQ", value: metrics.deadLetterJobs },
  ];

  const workerData = [
    { name: "Online", value: metrics.workersOnline, color: "#22c55e" },
    { name: "Offline", value: metrics.workersOffline, color: "#ef4444" },
  ];

  const totalWorkers = metrics.workersOnline + metrics.workersOffline;

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h3>Jobs by Status</h3>
            <p>Live distribution of jobs across lifecycle states.</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={jobStatusData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card worker-chart-card">
        <div className="chart-header">
          <div>
            <h3>Worker Health</h3>
            <p>Online versus offline worker capacity.</p>
          </div>
        </div>

        <div className="donut-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={workerData}
                dataKey="value"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={4}
              >
                {workerData.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="donut-center">
            <strong>{totalWorkers}</strong>
            <span>Total Workers</span>
          </div>
        </div>

        <div className="chart-legend">
          {workerData.map((item) => (
            <div key={item.name}>
              <span style={{ background: item.color }} />
              {item.name}: {item.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}