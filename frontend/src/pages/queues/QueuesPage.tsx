import { useEffect, useState } from "react";
import {
  Eye,
  PauseCircle,
  PlayCircle,
  Plus,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SkeletonList } from "../../components/ui/Skeleton";
import {
  createQueue,
  deleteQueue,
  getQueues,
  pauseQueue,
  resumeQueue,
} from "../../api/queues";
import type { Queue } from "../../types/queue";
import toast from "react-hot-toast";


export function QueuesPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(0);
  const [concurrencyLimit, setConcurrencyLimit] = useState(1);
  const [loading, setLoading] = useState(true);
  const selectedProjectId = localStorage.getItem("selectedProjectId");

  async function loadQueues() {
    if (!selectedProjectId) {
      setQueues([]);
      setLoading(false);
      return;
    }

    try {
      const data = await getQueues(selectedProjectId);
      setQueues(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  async function handleCreateQueue(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedProjectId) {
      toast.error("Please select a project first.");
      return;
    }

    if (!name.trim()) return;

    await createQueue({
      name,
      description,
      priority,
      concurrencyLimit,
      projectId: selectedProjectId!,
    });

    toast.success("Queue created successfully");

    setName("");
    setDescription("");
    setPriority(0);
    setConcurrencyLimit(1);
    loadQueues();
  }

  async function handleToggleQueue(queue: Queue) {
    if (queue.status === "ACTIVE") {
      await pauseQueue(queue.id);
      toast.success("Queue paused successfully");
    } else {
      await resumeQueue(queue.id);
      toast.success("Queue resumed successfully");
    }

    loadQueues();
  }

  async function handleDeleteQueue(id: string) {
    const confirmed = confirm("Are you sure you want to delete this queue?");

    if (!confirmed) return;

    await deleteQueue(id);
    toast.success("Queue deleted successfully");
    loadQueues();
  }

  useEffect(() => {
    loadQueues();
  }, []);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Queues</h1>
          <p className="page-subtitle">
            Configure job queues with priority, concurrency, and pause/resume controls.
          </p>
        </div>
      </div>

      <div className="queues-layout">
        <form className="create-panel" onSubmit={handleCreateQueue}>
          <div className="panel-icon">
            <Plus size={22} />
          </div>

          <h3>Create Queue</h3>
          <p>Define a queue for related background jobs.</p>

          <label>Queue Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: email-queue"
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={4}
          />

          <div className="form-two">
            <div>
              <label>Priority</label>
              <input
                type="number"
                value={priority}
                min={0}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Concurrency</label>
              <input
                type="number"
                value={concurrencyLimit}
                min={1}
                max={100}
                onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
              />
            </div>
          </div>

          <button className="primary-btn" type="submit">
            Create Queue
          </button>
        </form>

        <div className="queue-list">
          {loading ? (
            <div className="empty-state"><SkeletonList count={5} /></div>
          ) : queues.length === 0 ? (
            <div className="empty-state">No queues created yet.</div>
          ) : (
            queues.map((queue) => (
              <div className="queue-card" key={queue.id}>
                <div className="queue-card-main">
                  <div className="queue-icon">
                    <SlidersHorizontal size={24} />
                  </div>

                  <div>
                    <div className="queue-title-row">
                      <h3>{queue.name}</h3>
                      <span
                        className={
                          queue.status === "ACTIVE"
                            ? "status-badge active-badge"
                            : "status-badge paused-badge"
                        }
                      >
                        {queue.status}
                      </span>
                    </div>

                    <p>{queue.description || "No description provided"}</p>

                    <div className="queue-meta">
                      <span>Priority: {queue.priority}</span>
                      <span>Concurrency: {queue.concurrencyLimit}</span>
                      <span>
                        Created {new Date(queue.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="queue-actions">
                <Link
                  to={`/queues/${queue.id}`}
                  onClick={() =>
                    localStorage.setItem("selectedQueueId", queue.id)
                  }
                  className="soft-icon-btn"
                  title="View Queue"
                >
                  <Eye size={18} />
                </Link>

                <button
                  className="soft-icon-btn"
                  onClick={() => handleToggleQueue(queue)}
                  title={
                    queue.status === "ACTIVE"
                      ? "Pause Queue"
                      : "Resume Queue"
                  }
                >
                  {queue.status === "ACTIVE" ? (
                    <PauseCircle size={18} />
                  ) : (
                    <PlayCircle size={18} />
                  )}
                </button>

                <button
                  className="danger-icon-btn"
                  onClick={() => handleDeleteQueue(queue.id)}
                  title="Delete Queue"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}