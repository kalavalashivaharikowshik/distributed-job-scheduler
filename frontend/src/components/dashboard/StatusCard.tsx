type Props = {
  title: string;
  children: React.ReactNode;
};

export function StatusCard({
  title,
  children,
}: Props) {
  return (
    <div className="status-card">
      <h3>{title}</h3>

      {children}
    </div>
  );
}