import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Clock3, Server } from "lucide-react";
import { getJobExecutions } from "../../api/jobs";

export function ExecutionsPage() {
  const { id } = useParams();

  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadExecutions() {
    if (!id) return;

    try {
      const data = await getJobExecutions(id);
      setExecutions(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExecutions();
  }, [id]);

  if (loading) {
    return <div className="empty-state">Loading executions...</div>;
  }

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Execution History</h1>
          <p className="page-subtitle">
            Every execution attempt made for this job.
          </p>
        </div>
      </div>

      <div className="execution-list">
        {executions.length === 0 ? (
          <div className="empty-state">No executions found.</div>
        ) : (
          executions.map((execution) => (
            <div className="execution-card" key={execution.id}>
              <div className="execution-icon">
                <Clock3 size={22} />
              </div>

              <div className="execution-content">
                <div className="execution-title">
                  <strong>Attempt {execution.attempt}</strong>

                  <span
                    className={`status-badge ${
                      execution.status === "COMPLETED"
                        ? "active-badge"
                        : execution.status === "FAILED"
                        ? "failed-badge"
                        : ""
                    }`}
                  >
                    {execution.status}
                  </span>
                </div>

                <div className="queue-meta">
                  <span>
                    <Server size={14} />
                    {execution.worker?.name || "-"}
                  </span>

                  <span>Duration: {execution.durationMs ?? 0} ms</span>
                </div>

                <div className="queue-meta">
                  <span>
                    Started:
                    {" "}
                    {execution.startedAt
                      ? new Date(execution.startedAt).toLocaleString()
                      : "-"}
                  </span>

                  <span>
                    Completed:
                    {" "}
                    {execution.completedAt
                      ? new Date(execution.completedAt).toLocaleString()
                      : "-"}
                  </span>
                </div>

                {execution.errorMessage && (
                  <pre className="error-box">
                    {execution.errorMessage}
                  </pre>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}