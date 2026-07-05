import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { SkeletonCard, SkeletonList } from "../../../components/ui/Skeleton";
import {
  Activity,
  CheckCircle2,
  Layers,
  Server,
} from "lucide-react";
import {
  getQueueById,
  getQueueStats,
  pauseQueue,
  resumeQueue,
} from "../../../api/queues";
import { getJobs } from "../../../api/jobs";
import { getWorkerHealth } from "../../../api/workers";
import { StatCard } from "../../../components/dashboard/StatCard";
import { StatusCard } from "../../../components/dashboard/StatusCard";
import type { Queue } from "../../../types/queue";
import type { Job } from "../../../types/job";
import type { WorkerHealth } from "../../../types/worker";

export function QueueDetailsPage() {
  const { id } = useParams();

  const [queue, setQueue] = useState<Queue | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [workers, setWorkers] = useState<WorkerHealth[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadQueueDetails() {
    if (!id) return;

    try {
      const [queueData, statsData, jobsData, workersData] = await Promise.all([
        getQueueById(id),
        getQueueStats(id),
        getJobs({
          queueId: id,
          page: 1,
          limit: 5,
        }),
        getWorkerHealth(id),
      ]);

      setQueue(queueData);
      setStats(statsData);
      setJobs(jobsData.jobs);
      setWorkers(workersData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleQueue() {
    if (!queue) return;

    if (queue.status === "ACTIVE") {
        await pauseQueue(queue.id);
    } else {
        await resumeQueue(queue.id);
    }
    toast.success(
    queue.status === "ACTIVE"
        ? "Queue paused successfully"
        : "Queue resumed successfully"
    );

    loadQueueDetails();
    }

  useEffect(() => {
    loadQueueDetails();

    const interval = setInterval(loadQueueDetails, 10000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
        <div className="empty-state">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonList count={5} />
        </div>
    );
    }

  if (!queue || !stats) {
    return <div className="empty-state">Queue not found.</div>;
  }

  return (
    <div className="queue-detail-page">
      <div className="page-header-row">
        <div>
            <h1 className="page-title">{queue.name}</h1>
            <p className="page-subtitle">
            Queue configuration, statistics, workers, and recent jobs.
            </p>
        </div>

        <div className="queue-detail-actions">
            <span
            className={
                queue.status === "ACTIVE"
                ? "status-badge active-badge"
                : "status-badge paused-badge"
            }
            >
            {queue.status}
            </span>

            <button className="header-action-btn" onClick={handleToggleQueue}>
            {queue.status === "ACTIVE" ? "Pause Queue" : "Resume Queue"}
            </button>

            <button className="secondary-btn" onClick={loadQueueDetails}>
            Refresh
            </button>
        </div>
        </div>

      <div className="stats-grid">
        <StatCard
          title="Queued"
          value={stats.statistics.queued}
          color="linear-gradient(135deg, #4f46e5, #7c3aed)"
          icon={Layers}
        />

        <StatCard
          title="Completed"
          value={stats.statistics.completed}
          color="linear-gradient(135deg, #16a34a, #22c55e)"
          icon={CheckCircle2}
        />

        <StatCard
          title="Workers"
          value={stats.workers.online + stats.workers.offline}
          color="linear-gradient(135deg, #0891b2, #06b6d4)"
          icon={Server}
        />

        <StatCard
          title="Throughput 24h"
          value={stats.throughput.last24Hours}
          color="linear-gradient(135deg, #f59e0b, #f97316)"
          icon={Activity}
        />
      </div>

      <div className="queue-detail-grid">
        <StatusCard title="Queue Configuration">
          <div className="detail-row">
            <span>Status</span>
            <strong>{queue.status}</strong>
          </div>

          <div className="detail-row">
            <span>Priority</span>
            <strong>{queue.priority}</strong>
          </div>

          <div className="detail-row">
            <span>Concurrency</span>
            <strong>{queue.concurrencyLimit}</strong>
          </div>

          <div className="detail-row">
            <span>Retry Policy</span>
            <strong>{queue.retryPolicyId || "Not attached"}</strong>
          </div>
        </StatusCard>

        <StatusCard title="Queue Health">
          <div className="detail-row">
            <span>Scheduled</span>
            <strong>{stats.statistics.scheduled}</strong>
          </div>

          <div className="detail-row">
            <span>Running</span>
            <strong>{stats.statistics.running}</strong>
          </div>

          <div className="detail-row">
            <span>Retrying</span>
            <strong>{stats.statistics.retrying}</strong>
          </div>

          <div className="detail-row">
            <span>Dead Letter</span>
            <strong>{stats.statistics.deadLetter}</strong>
          </div>
        </StatusCard>
      </div>

      <div className="queue-detail-grid">
        <StatusCard title="Recent Jobs">
          <div className="compact-list">
            {jobs.length === 0 ? (
              <p className="muted-text">No jobs found.</p>
            ) : (
              jobs.map((job) => (
                <div className="compact-item" key={job.id}>
                  <div>
                    <strong>{job.name}</strong>
                    <span>{job.type}</span>
                  </div>
                  <b>{job.status}</b>
                </div>
              ))
            )}
          </div>
        </StatusCard>

        <StatusCard title="Workers">
          <div className="compact-list">
            {workers.length === 0 ? (
              <p className="muted-text">No workers found.</p>
            ) : (
              workers.map((worker) => (
                <div className="compact-item" key={worker.id}>
                  <div>
                    <strong>{worker.name}</strong>
                    <span>
                      {worker.runningJobs} running job(s)
                    </span>
                  </div>
                  <b>{worker.isHealthy ? "HEALTHY" : worker.status}</b>
                </div>
              ))
            )}
          </div>
        </StatusCard>
      </div>
    </div>
  );
}