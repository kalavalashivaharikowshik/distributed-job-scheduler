import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon">
          <SearchX size={56} />
        </div>

        <h1>404</h1>

        <h2>Page Not Found</h2>

        <p>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link className="primary-btn" to="/">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}