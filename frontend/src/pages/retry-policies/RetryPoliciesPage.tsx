import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { SkeletonList } from "../../components/ui/Skeleton";
import {
  createRetryPolicy,
  deleteRetryPolicy,
  getRetryPolicies,
} from "../../api/retryPolicies";
import type { BackoffType, RetryPolicy } from "../../types/retryPolicy";

export function RetryPoliciesPage() {
  const [policies, setPolicies] = useState<RetryPolicy[]>([]);
  const [name, setName] = useState("");
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [initialDelayMs, setInitialDelayMs] = useState(1000);
  const [maxDelayMs, setMaxDelayMs] = useState(60000);
  const [backoffType, setBackoffType] = useState<BackoffType>("FIXED");
  const [loading, setLoading] = useState(true);
  const selectedProjectId = localStorage.getItem("selectedProjectId");

  async function loadPolicies() {
    if (!selectedProjectId) {
        setPolicies([]);
        setLoading(false);
        return;
    }

    try {
        setLoading(true);
      const data = await getRetryPolicies(selectedProjectId!);
      setPolicies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePolicy(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedProjectId) {
        toast.error("Please select a project first.");
        return;
    }

    if (!name.trim()) return;

    await createRetryPolicy({
      name,
      maxAttempts,
      initialDelayMs,
      maxDelayMs,
      backoffType,
      projectId: selectedProjectId!,
    });
    toast.success("Retry policy created successfully");

    setName("");
    setMaxAttempts(3);
    setInitialDelayMs(1000);
    setMaxDelayMs(60000);
    setBackoffType("FIXED");
    loadPolicies();
  }

  async function handleDeletePolicy(id: string) {
    const confirmed = confirm("Delete this retry policy?");

    if (!confirmed) return;

    await deleteRetryPolicy(id);
    toast.success("Retry policy deleted successfully");
    loadPolicies();
  }

  useEffect(() => {
    loadPolicies();
  }, []);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Retry Policies</h1>
          <p className="page-subtitle">
            Configure retry attempts, delay strategy, and backoff behavior.
          </p>
        </div>
      </div>

      <div className="retry-layout">
        <form className="create-panel" onSubmit={handleCreatePolicy}>
          <div className="panel-icon">
            <Plus size={22} />
          </div>

          <h3>Create Retry Policy</h3>
          <p>Define how failed jobs should retry.</p>

          <label>Policy Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: email-retry-policy"
          />

          <label>Backoff Type</label>
          <select
            value={backoffType}
            onChange={(e) => setBackoffType(e.target.value as BackoffType)}
          >
            <option value="FIXED">FIXED</option>
            <option value="LINEAR">LINEAR</option>
            <option value="EXPONENTIAL">EXPONENTIAL</option>
          </select>

          <div className="form-two">
            <div>
              <label>Max Attempts</label>
              <input
                type="number"
                min={1}
                max={20}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Initial Delay</label>
              <input
                type="number"
                min={0}
                value={initialDelayMs}
                onChange={(e) => setInitialDelayMs(Number(e.target.value))}
              />
            </div>
          </div>

          <label>Max Delay Ms</label>
          <input
            type="number"
            min={1}
            value={maxDelayMs}
            onChange={(e) => setMaxDelayMs(Number(e.target.value))}
          />

          <button className="primary-btn" type="submit">
            Create Policy
          </button>
        </form>

        <div className="retry-list">
          {loading ? (
            <div className="empty-state"><SkeletonList count={4} /></div>
          ) : policies.length === 0 ? (
            <div className="empty-state">No retry policies created yet.</div>
          ) : (
            policies.map((policy) => (
              <div className="retry-card" key={policy.id}>
                <div className="retry-icon">
                  <RotateCcw size={24} />
                </div>

                <div className="retry-info">
                  <div className="retry-title-row">
                    <h3>{policy.name}</h3>
                    <span className="status-badge active-badge">
                      {policy.backoffType}
                    </span>
                  </div>

                  <div className="queue-meta">
                    <span>Max Attempts: {policy.maxAttempts}</span>
                    <span>Initial Delay: {policy.initialDelayMs}ms</span>
                    <span>Max Delay: {policy.maxDelayMs || "-"}ms</span>
                  </div>

                  <p>
                    Created {new Date(policy.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  className="danger-icon-btn"
                  onClick={() => handleDeletePolicy(policy.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}