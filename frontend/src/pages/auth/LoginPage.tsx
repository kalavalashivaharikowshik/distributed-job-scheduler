import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("deekshitha@example.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");

      await login({ email, password });

      toast.success("Login successful");

      navigate("/");
    } catch {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <LogIn size={26} />
        </div>

        <h1>Welcome Back</h1>
        <p>Login to manage your distributed job scheduler.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>

        <span className="auth-switch">
          New here? <Link to="/register">Create account</Link>
        </span>
      </div>
    </div>
  );
}