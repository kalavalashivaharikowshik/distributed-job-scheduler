import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  Clock,
  FileText,
  History,
  ScrollText,
  Server,
} from "lucide-react";
import { SkeletonCard, SkeletonList } from "../../../components/ui/Skeleton";
import {
  getJobById,
  getJobExecutions,
  getJobLogs,
} from "../../../api/jobs";
import type { Job } from "../../../types/job";

export function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadJobDetails() {
    if (!id) return;

    try {
      const [jobData, logsData, executionsData] = await Promise.all([
        getJobById(id),
        getJobLogs(id),
        getJobExecutions(id),
      ]);

      setJob(jobData);
      setLogs(logsData);
      setExecutions(executionsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="empty-state">
        <SkeletonCard />
        <SkeletonList count={6} />
      </div>
    );
  }
  if (!job) {
    return <div className="empty-state">Job not found.</div>;
  }

  return (
    <div className="job-detail-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">{job.name}</h1>
          <p className="page-subtitle">
            Full job lifecycle, payload, logs, and execution history.
          </p>
        </div>

        <Link
          className="header-action-btn"
          to={`/jobs/${job.id}/executions`}
        >
          View Execution History
        </Link>
      </div>

      <div className="job-detail-grid">
        <div className="job-detail-card">
          <div className="detail-card-title">
            <FileText size={18} />
            <h3>Job Metadata</h3>
          </div>

          <div className="detail-row">
            <span>Status</span>
            <strong>{job.status}</strong>
          </div>

          <div className="detail-row">
            <span>Type</span>
            <strong>{job.type}</strong>
          </div>

          <div className="detail-row">
            <span>Priority</span>
            <strong>{job.priority}</strong>
          </div>

          <div className="detail-row">
            <span>Attempts</span>
            <strong>{job.attemptsMade}</strong>
          </div>

          <div className="detail-row">
            <span>Worker</span>
            <strong>{job.claimedByWorkerId || "Not assigned"}</strong>
          </div>
        </div>

        <div className="job-detail-card">
          <div className="detail-card-title">
            <Clock size={18} />
            <h3>Timestamps</h3>
          </div>

          <div className="detail-row">
            <span>Created</span>
            <strong>{new Date(job.createdAt).toLocaleString()}</strong>
          </div>

          <div className="detail-row">
            <span>Started</span>
            <strong>
              {job.startedAt ? new Date(job.startedAt).toLocaleString() : "-"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Completed</span>
            <strong>
              {job.completedAt
                ? new Date(job.completedAt).toLocaleString()
                : "-"}
            </strong>
          </div>

          <div className="detail-row">
            <span>Failed</span>
            <strong>
              {job.failedAt ? new Date(job.failedAt).toLocaleString() : "-"}
            </strong>
          </div>
        </div>
      </div>

      <div className="job-detail-card">
        <div className="detail-card-title">
          <ScrollText size={18} />
          <h3>Payload</h3>
        </div>

        <pre className="payload-box">
          {JSON.stringify(job.payload, null, 2)}
        </pre>
      </div>

      <div className="job-detail-grid">
        <div className="job-detail-card">
          <div className="detail-card-title">
            <History size={18} />
            <h3>Execution History</h3>
          </div>

          <div className="timeline-list">
            {executions.length === 0 ? (
              <p className="muted-text">No executions found.</p>
            ) : (
              executions.map((execution) => (
                <div className="timeline-item" key={execution.id}>
                  <strong>
                    Attempt {execution.attempt} • {execution.status}
                  </strong>
                  <span>
                    Duration: {execution.durationMs || 0}ms
                  </span>
                  {execution.errorMessage && (
                    <p>{execution.errorMessage}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="job-detail-card">
          <div className="detail-card-title">
            <Server size={18} />
            <h3>Logs</h3>
          </div>

          <div className="timeline-list">
            {logs.length === 0 ? (
              <p className="muted-text">No logs found.</p>
            ) : (
              logs.map((log) => (
                <div className="timeline-item" key={log.id}>
                  <strong>{log.level}</strong>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                  <p>{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}