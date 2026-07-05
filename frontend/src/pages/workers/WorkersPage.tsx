import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { SkeletonList } from "../../components/ui/Skeleton";
import {
  Activity,
  RefreshCcw,
  Server,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import {
  getWorkerHealth,
  markStaleWorkersOffline,
} from "../../api/workers";
import type { WorkerHealth } from "../../types/worker";

function formatHeartbeatAge(ms?: number | null) {
  if (ms === null || ms === undefined) return "No heartbeat";

  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  return `${hours}h ago`;
}

function statusClass(worker: WorkerHealth) {
  if (worker.isHealthy) return "worker-status healthy";
  if (worker.status === "SHUTTING_DOWN") return "worker-status warning";
  if (worker.status === "ONLINE") return "worker-status stale";
  return "worker-status offline";
}

export function WorkersPage() {
  const [workers, setWorkers] = useState<WorkerHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedQueueId = localStorage.getItem("selectedQueueId");

  async function loadWorkers() {
    if (!selectedQueueId) {
      setWorkers([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getWorkerHealth(selectedQueueId);
      setWorkers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkStaleOffline() {
    const result = await markStaleWorkersOffline();

    toast.success(`${result.markedOffline} stale worker(s) marked offline`);

    loadWorkers();
  }

  useEffect(() => {
    loadWorkers();

    const interval = setInterval(loadWorkers, 10000);

    return () => clearInterval(interval);
  }, []);

  const online = workers.filter((worker) => worker.isHealthy).length;
  const stale = workers.filter(
    (worker) => worker.status === "ONLINE" && !worker.isHealthy
  ).length;
  const offline = workers.filter((worker) => worker.status === "OFFLINE").length;

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Workers</h1>
          <p className="page-subtitle">
            Monitor worker health, heartbeat freshness, and running jobs.
          </p>
        </div>

        <button className="header-action-btn" onClick={handleMarkStaleOffline}>
          <RefreshCcw size={17} />
          Mark stale offline
        </button>
      </div>

      <div className="worker-summary-grid">
        <div className="worker-summary-card">
          <ShieldCheck size={24} />
          <div>
            <p>Healthy</p>
            <strong>{online}</strong>
          </div>
        </div>

        <div className="worker-summary-card">
          <Activity size={24} />
          <div>
            <p>Stale</p>
            <strong>{stale}</strong>
          </div>
        </div>

        <div className="worker-summary-card">
          <WifiOff size={24} />
          <div>
            <p>Offline</p>
            <strong>{offline}</strong>
          </div>
        </div>
      </div>

      <div className="worker-list">
        {loading ? (
          <div className="empty-state"><SkeletonList count={6} /></div>
        ) : workers.length === 0 ? (
          <div className="empty-state">No workers registered.</div>
        ) : (
          workers.map((worker) => (
            <div className="worker-card" key={worker.id}>
              <div className="worker-icon">
                <Server size={24} />
              </div>

              <div className="worker-info">
                <div className="worker-title-row">
                  <h3>{worker.name}</h3>
                  <span className={statusClass(worker)}>
                    {worker.isHealthy ? "HEALTHY" : worker.status}
                  </span>
                </div>

                <div className="worker-meta">
                  <span>Concurrency: {worker.concurrency}</span>
                  <span>Running Jobs: {worker.runningJobs}</span>
                  <span>Heartbeat: {formatHeartbeatAge(worker.heartbeatAgeMs)}</span>
                </div>

                <p>ID: {worker.id}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}