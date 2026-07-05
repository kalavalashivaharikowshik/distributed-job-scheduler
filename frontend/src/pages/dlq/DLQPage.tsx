import { useEffect, useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { getDLQEntries, retryDLQEntry } from "../../api/dlq";
import toast from "react-hot-toast";
import { SkeletonList } from "../../components/ui/Skeleton";

export function DLQPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedQueueId = localStorage.getItem("selectedQueueId");

  async function loadEntries() {
    if (!selectedQueueId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getDLQEntries(selectedQueueId);
      setEntries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRetry(id: string) {
    await retryDLQEntry(id);
    toast.success("Job retried from DLQ successfully");
    loadEntries();
  }

  useEffect(() => {
    loadEntries();
  }, []);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Dead Letter Queue</h1>
          <p className="page-subtitle">
            Inspect permanently failed jobs and retry them safely.
          </p>
        </div>
      </div>

      <div className="dlq-list">
        {loading ? (
          <div className="empty-state"><SkeletonList count={5} /></div>
        ) : entries.length === 0 ? (
          <div className="empty-state">No dead letter jobs found.</div>
        ) : (
          entries.map((entry) => (
            <div className="dlq-card" key={entry.id}>
              <div className="dlq-icon">
                <AlertTriangle size={24} />
              </div>

              <div className="dlq-info">
                <div className="dlq-title-row">
                  <h3>{entry.job?.name || "Unknown Job"}</h3>
                  <span className="job-status failed">DEAD LETTER</span>
                </div>

                <p>{entry.reason}</p>

                <div className="job-meta">
                  <span>Attempts: {entry.job?.attemptsMade}</span>
                  <span>Priority: {entry.job?.priority}</span>
                  <span>
                    Failed: {new Date(entry.failedAt).toLocaleString()}
                  </span>
                </div>

                {entry.errorMessage && (
                  <pre className="error-box">{entry.errorMessage}</pre>
                )}
              </div>

              <button
                className="header-action-btn"
                onClick={() => handleRetry(entry.id)}
              >
                <RotateCcw size={17} />
                Retry
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}