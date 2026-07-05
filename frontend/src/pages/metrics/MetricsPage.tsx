import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Server,
  TrendingUp,
} from "lucide-react";
import {
  getQueueMetrics,
  getSystemMetrics,
  getWorkerMetrics,
} from "../../api/metrics";
import { StatCard } from "../../components/dashboard/StatCard";
import { StatusCard } from "../../components/dashboard/StatusCard";
import { getWorkerHealth } from "../../api/workers";

export function MetricsPage() {
  const [system, setSystem] = useState<any>(null);
  const [queue, setQueue] = useState<any>(null);
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const selectedQueueId = localStorage.getItem("selectedQueueId");

  async function loadMetrics() {
    if (!selectedQueueId) {
      setLoading(false);
      return;
    }

    const workers = await getWorkerHealth(selectedQueueId);
    const firstWorkerId = workers[0]?.id;
    try {
      const [systemData, queueData, workerData] = await Promise.all([
        getSystemMetrics(),
        getQueueMetrics(selectedQueueId),
        firstWorkerId ? getWorkerMetrics(firstWorkerId) : Promise.resolve(null),
      ]);

      setSystem(systemData);
      setQueue(queueData);
      setWorker(workerData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();

    const interval = setInterval(loadMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="empty-state">Loading metrics...</div>;
  }

  if (!system || !queue || !worker) {
    return <div className="empty-state">Unable to load metrics.</div>;
  }

  return (
    <div className="metrics-page">
      <div>
        <h1 className="page-title">Metrics</h1>
        <p className="page-subtitle">
          Analyze throughput, success rates, execution duration, and worker performance.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Jobs"
          value={system.totalJobs}
          color="linear-gradient(135deg, #4f46e5, #7c3aed)"
          icon={Activity}
        />

        <StatCard
          title="Completed"
          value={system.completedJobs}
          color="linear-gradient(135deg, #16a34a, #22c55e)"
          icon={CheckCircle2}
        />

        <StatCard
          title="Success Rate"
          value={`${system.successRate}%`}
          color="linear-gradient(135deg, #f59e0b, #f97316)"
          icon={TrendingUp}
        />

        <StatCard
          title="Avg Duration"
          value={`${system.averageExecutionTimeMs}ms`}
          color="linear-gradient(135deg, #0891b2, #06b6d4)"
          icon={Clock3}
        />
      </div>

      <div className="metrics-grid">
        <StatusCard title="Queue Performance">
          <div className="metric-section-title">
            <BarChart3 size={18} />
            <strong>{queue.queue.name}</strong>
          </div>

          <div className="metric-row">
            <span>Total Executions</span>
            <strong>{queue.totalExecutions}</strong>
          </div>

          <div className="metric-row">
            <span>Completed Executions</span>
            <strong>{queue.completedExecutions}</strong>
          </div>

          <div className="metric-row">
            <span>Failed Executions</span>
            <strong>{queue.failedExecutions}</strong>
          </div>

          <div className="metric-row">
            <span>Success Rate</span>
            <strong>{queue.successRate}%</strong>
          </div>

          <div className="metric-row">
            <span>Average Execution Time</span>
            <strong>{queue.averageExecutionTimeMs}ms</strong>
          </div>
        </StatusCard>

        {worker ? (
            <StatusCard title="Worker Performance">
              <div className="metric-section-title">
                <Server size={18} />
                <strong>{worker.worker.name}</strong>
              </div>

              <div className="metric-row">
                <span>Status</span>
                <strong>{worker.worker.status}</strong>
              </div>

              <div className="metric-row">
                <span>Total Executions</span>
                <strong>{worker.totalExecutions}</strong>
              </div>

              <div className="metric-row">
                <span>Completed</span>
                <strong>{worker.completedExecutions}</strong>
              </div>

              <div className="metric-row">
                <span>Failed</span>
                <strong>{worker.failedExecutions}</strong>
              </div>

              <div className="metric-row">
                <span>Success Rate</span>
                <strong>{worker.successRate}%</strong>
              </div>

              <div className="metric-row">
                <span>Average Duration</span>
                <strong>{worker.averageExecutionTimeMs}ms</strong>
              </div>
            </StatusCard>
          ) : (
            <StatusCard title="Worker Performance">
              <p className="muted-text">No worker available for selected queue.</p>
            </StatusCard>
          )}
      </div>
    </div>
  );
}