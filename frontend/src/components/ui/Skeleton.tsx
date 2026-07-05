export function SkeletonCard() {
  return <div className="skeleton-card" />;
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-row" key={index}>
          <div className="skeleton-avatar" />
          <div className="skeleton-lines">
            <div />
            <div />
          </div>
        </div>
      ))}
    </div>
  );
}