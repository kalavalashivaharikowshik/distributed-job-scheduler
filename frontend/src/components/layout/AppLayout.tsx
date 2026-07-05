import { NavLink, Outlet } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { GlobalSearch } from "./GlobalSearch";
import {
  BarChart3,
  Briefcase,
  Gauge,
  Layers,
  ListChecks,
  Server,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: Gauge,
  },
  {
    label: "Projects",
    path: "/projects",
    icon: Briefcase,
  },
  {
    label: "Queues",
    path: "/queues",
    icon: Layers,
  },
  {
    label: "Jobs",
    path: "/jobs",
    icon: ListChecks,
  },
  {
    label: "Workers",
    path: "/workers",
    icon: Server,
  },
  {
    label: "Metrics",
    path: "/metrics",
    icon: BarChart3,
  },
  {
    label: "DLQ",
    path: "/dlq",
    icon: AlertTriangle,
  },
  {
    label: "Retry Policies",
    path: "/retry-policies",
    icon: RotateCcw,
  },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">JS</div>
          <div>
            <h1>JobScheduler</h1>
            <p>Distributed Engine</p>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-card">
          <p>System Health</p>
          <strong>Operational</strong>
          <span>Workers and queues monitored live</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">Production-inspired scheduler</p>
            <h2>Distributed Job Scheduling Platform</h2>
          </div>
          <GlobalSearch />
          <div className="topbar-actions">
            <div className="user-pill">
              <span>{user?.name}</span>
              <button onClick={logout}>
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        <section className="content-card page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}