import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

import { getProjects } from "../../api/projects";
import { getQueues } from "../../api/queues";
import { getJobs } from "../../api/jobs";
import { getWorkers } from "../../api/workers";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [queues, setQueues] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const selectedProjectId = localStorage.getItem("selectedProjectId");
const selectedQueueId = localStorage.getItem("selectedQueueId");

  async function loadData() {
    if (!selectedProjectId || !selectedQueueId) {
    return;
    }
    try {
      const [projectData, queueData, jobData, workerData] =
        await Promise.all([
          getProjects(),
          getQueues(selectedProjectId),
          getJobs({
        queueId: selectedQueueId,
        page: 1,
        limit: 100,
        }),
        getWorkers(selectedQueueId)
        ]);

      setProjects(projectData);
      setQueues(queueData);
      setJobs(jobData.jobs);
      setWorkers(workerData);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const search = query.toLowerCase();

    return [
      ...projects
        .filter((p) => p.name.toLowerCase().includes(search))
        .map((p) => ({
          id: p.id,
          name: p.name,
          type: "Project",
          link: "/projects",
        })),

      ...queues
        .filter((q) => q.name.toLowerCase().includes(search))
        .map((q) => ({
          id: q.id,
          name: q.name,
          type: "Queue",
          link: `/queues/${q.id}`,
        })),

      ...jobs
        .filter((j) => j.name.toLowerCase().includes(search))
        .map((j) => ({
          id: j.id,
          name: j.name,
          type: "Job",
          link: `/jobs/${j.id}`,
        })),

      ...workers
        .filter((w) => w.name.toLowerCase().includes(search))
        .map((w) => ({
          id: w.id,
          name: w.name,
          type: "Worker",
          link: "/workers",
        })),
    ].slice(0, 8);
  }, [query, projects, queues, jobs, workers]);

  return (
    <div className="global-search">
      <div className="search-input-wrap">
        <Search size={18} />

        <input
          placeholder="Search projects, queues, jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {query && (
        <div className="search-dropdown">
          {results.length === 0 ? (
            <div className="search-empty">
              No results found.
            </div>
          ) : (
            results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                to={item.link}
                className="search-item"
                onClick={() => setQuery("")}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.type}</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}