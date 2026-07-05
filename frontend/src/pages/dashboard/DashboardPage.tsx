import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Server,
} from "lucide-react";

import {
  SkeletonCard,
  SkeletonList,
} from "../../components/ui/Skeleton";

import { socket } from "../../api/socket";
import toast from "react-hot-toast";

import {
  getDashboardOverview,
  getSystemMetrics,
} from "../../api/dashboard";

import { StatCard } from "../../components/dashboard/StatCard";
import { StatusCard } from "../../components/dashboard/StatusCard";
import { ChartsSection } from "../../components/dashboard/ChartsSection";

export function DashboardPage() {
    const [, setOverview] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    async function loadDashboard() {
      socket.connect();

      socket.on("job:created", () => {
        toast.success("Live update: new job created");
        loadDashboard();
      });

      return () => {
        socket.off("job:created");
        socket.disconnect();
        clearInterval(interval);
      };
        try {
        const [overviewData, metricsData] = await Promise.all([
            getDashboardOverview(),
            getSystemMetrics(),
        ]);

        setOverview(overviewData);
        setMetrics(metricsData);
        } catch (err) {
        console.error(err);
        } finally {
        setLoading(false);
        }
    }

    loadDashboard();

    const interval = setInterval(loadDashboard, 10000);

    return () => clearInterval(interval);
    }, []);

    if (loading) {
      return (
        <>
          <div className="stats-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          <SkeletonList count={5} />
        </>
      );
    }

  return (
    <div className="dashboard-grid">
      <div>
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">
          Monitor job throughput, queue health, worker activity, and failures.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Jobs"
          value={metrics.totalJobs}
          color="linear-gradient(135deg, #4f46e5, #7c3aed)"
          icon={Activity}
        />

        <StatCard
          title="Completed"
          value={metrics.completedJobs}
          color="linear-gradient(135deg, #16a34a, #22c55e)"
          icon={CheckCircle2}
        />

        <StatCard
          title="Workers"
          value={metrics.workersOnline + metrics.workersOffline}
          color="linear-gradient(135deg, #0891b2, #06b6d4)"
          icon={Server}
        />

        <StatCard
          title="Success Rate"
          value={`${metrics.successRate}%`}
          color="linear-gradient(135deg, #f59e0b, #f97316)"
          icon={Clock}
        />
      </div>

      <div className="status-grid">
        <ChartsSection metrics={metrics} />
        <StatusCard title="Queue Health">
          <div className="status-row">
            <span className="status-label">Queued Jobs</span>
            <strong>{metrics.queuedJobs}</strong>
          </div>

          <div className="status-row">
            <span className="status-label">Scheduled Jobs</span>
            <strong>{metrics.scheduledJobs}</strong>
          </div>

          <div className="status-row">
            <span className="status-label">Running Jobs</span>
            <strong>{metrics.runningJobs}</strong>
          </div>

          <div className="status-row">
            <span className="status-label">Retrying Jobs</span>
            <strong>{metrics.retryingJobs}</strong>
          </div>

          <div className="status-row">
            <span className="status-label">Dead Letter Jobs</span>
            <strong>{metrics.deadLetterJobs}</strong>
          </div>
        </StatusCard>

        <StatusCard title="System Status">
          <div className="system-good">
            <span className="pulse-dot" />
            <div>
              <strong>
                {metrics.workersOnline > 0 ? "Operational" : "Workers Offline"}
              </strong>

              <p>
                {metrics.workersOnline} worker(s) online •{" "}
                {metrics.workersOffline} offline
              </p>
            </div>
          </div>
        </StatusCard>
      </div>
    </div>
  );
}