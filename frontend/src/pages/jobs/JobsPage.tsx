import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ban, BriefcaseBusiness, Eye, Plus } from "lucide-react";
import { cancelJob, createJob, getJobs } from "../../api/jobs";
import type { Job, JobStatus } from "../../types/job";
import toast from "react-hot-toast";
import { SkeletonList } from "../../components/ui/Skeleton";

const statuses: (JobStatus | "")[] = [
  "",
  "QUEUED",
  "SCHEDULED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "RETRYING",
  "CANCELLED",
  "DEAD_LETTER",
];

function getStatusClass(status: JobStatus) {
  if (status === "COMPLETED") return "job-status completed";
  if (status === "RUNNING" || status === "CLAIMED") return "job-status running";
  if (status === "FAILED" || status === "DEAD_LETTER") return "job-status failed";
  if (status === "RETRYING" || status === "SCHEDULED") return "job-status warning";
  if (status === "CANCELLED") return "job-status cancelled";
  return "job-status queued";
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<JobStatus | "">("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(1);
  const [loading, setLoading] = useState(true);
  const selectedQueueId = localStorage.getItem("selectedQueueId");

  async function loadJobs() {
    if (!selectedQueueId) {
      setJobs([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getJobs({
        queueId: selectedQueueId,
        status,
        page,
        limit: 10,
      });

      setJobs(data.jobs);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQueueId) {
      toast.error("Please select a queue first.");
      return;
    }

    if (!name.trim()) return;

    await createJob({
      name,
      type: "IMMEDIATE",
      priority,
      queueId: selectedQueueId!,
      payload: {
        createdFrom: "frontend",
        message: "Created from dashboard",
      },
    });
    toast.success("Job created successfully");

    setName("");
    setPriority(1);
    setPage(1);
    loadJobs();
  }

  async function handleCancelJob(job: Job) {
    if (
      ["CLAIMED", "RUNNING", "COMPLETED", "DEAD_LETTER"].includes(job.status)
    ) {
      toast.error("This job cannot be cancelled");
      return;
    }

    await cancelJob(job.id);
    toast.success("Job cancelled successfully");
    loadJobs();
  }

  useEffect(() => {
    loadJobs();
  }, [status, page]);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Jobs Explorer</h1>
          <p className="page-subtitle">
            Create jobs, inspect lifecycle status, and manage queued work.
          </p>
        </div>
      </div>

      <div className="jobs-layout">
        <form className="create-panel" onSubmit={handleCreateJob}>
          <div className="panel-icon">
            <Plus size={22} />
          </div>

          <h3>Create Job</h3>
          <p>Create an immediate job in your main queue.</p>

          <label>Job Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: send-email-job"
          />

          <label>Priority</label>
          <input
            type="number"
            min={0}
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          />

          <button className="primary-btn" type="submit">
            Create Job
          </button>
        </form>

        <div className="jobs-panel">
          <div className="jobs-toolbar">
            <div>
              <h3>Job List</h3>
              <p>Filter and review jobs by lifecycle state.</p>
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as JobStatus | "");
                setPage(1);
              }}
            >
              {statuses.map((item) => (
                <option key={item || "ALL"} value={item}>
                  {item || "ALL STATUSES"}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="empty-state"><SkeletonList count={8} /></div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">No jobs found.</div>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <div className="job-icon">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div className="job-info">
                    <div className="job-title-row">
                      <h3>{job.name}</h3>
                      <span className={getStatusClass(job.status)}>
                        {job.status}
                      </span>
                    </div>

                    <div className="job-meta">
                      <span>Type: {job.type}</span>
                      <span>Priority: {job.priority}</span>
                      <span>Attempts: {job.attemptsMade}</span>
                    </div>

                    <p>
                      Created {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="job-actions">
                    <Link
                        className="soft-icon-btn"
                        to={`/jobs/${job.id}`}
                        title="View details"
                    >
                        <Eye size={18} />
                    </Link>

                    <button
                        className="danger-icon-btn"
                        onClick={() => handleCancelJob(job)}
                        title="Cancel job"
                    >
                        <Ban size={18} />
                    </button>
                    </div>
                </div>
              ))}
            </div>
          )}

          <div className="pagination-row">
            <button
              className="secondary-btn"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              className="secondary-btn"
              disabled={page === totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}