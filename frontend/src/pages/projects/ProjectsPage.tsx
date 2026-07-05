import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import {
  createProject,
  deleteProject,
  getProjects,
} from "../../api/projects";
import type { Project } from "../../types/project";
import { SkeletonList } from "../../components/ui/Skeleton";
import { useAuth } from "../../context/AuthContext";



export function ProjectsPage() {
  const { currentOrganizationId } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadProjects() {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();

    if (!currentOrganizationId) {
      toast.error("No organization selected");
      return;
    }

    if (!name.trim()) return;

    await createProject({
      name,
      description,
      organizationId: currentOrganizationId!,
    });
    toast.success("Project created successfully");

    setName("");
    setDescription("");
    loadProjects();
  }

  async function handleDeleteProject(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this project?");

    if (!confirmed) return;

    await deleteProject(id);
    toast.success("Project deleted successfully");
    loadProjects();
  }
  function selectProject(projectId: string) {
    localStorage.setItem("selectedProjectId", projectId);
    toast.success("Project selected");
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div>
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            Organize queues, jobs, workers, and metrics by project workspace.
          </p>
        </div>
      </div>

      <div className="projects-layout">
        <form className="create-panel" onSubmit={handleCreateProject}>
          <div className="panel-icon">
            <Plus size={22} />
          </div>

          <h3>Create Project</h3>
          <p>Create a workspace for related queues and jobs.</p>

          <label>Project Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Example: Email Processing"
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description"
            rows={4}
          />

          <button className="primary-btn" type="submit">
            Create Project
          </button>
        </form>

        <div className="project-list">
          {loading ? (
            <div className="empty-state"><SkeletonList count={5} /></div>
          ) : projects.length === 0 ? (
            <div className="empty-state">No projects created yet.</div>
          ) : (
            projects.map((project) => (
              <div className="project-card" key={project.id}>
                <div className="project-icon">
                  <FolderKanban size={24} />
                </div>

                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p>{project.description || "No description provided"}</p>

                  <span>
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  className="secondary-btn"
                  onClick={() => selectProject(project.id)}
                >
                  Select
                </button>

                <button
                  className="danger-icon-btn"
                  onClick={() => handleDeleteProject(project.id)}
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