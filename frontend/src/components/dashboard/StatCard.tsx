import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  color: string;
  icon: LucideIcon;
};

export function StatCard({
  title,
  value,
  color,
  icon: Icon,
}: Props) {
  return (
    <div className="stat-card">
      <div
        className="stat-icon"
        style={{ background: color }}
      >
        <Icon size={22} color="white" />
      </div>

      <div>
        <p className="stat-title">{title}</p>
        <h2 className="stat-value">{value}</h2>
      </div>
    </div>
  );
}