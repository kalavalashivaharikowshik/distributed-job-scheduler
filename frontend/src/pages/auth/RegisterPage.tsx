import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");

      await register({
        name,
        email,
        password,
        organizationName,
      });

      toast.success("Account created successfully");

      navigate("/");
    } catch {
      setError("Registration failed. Please check your details.");
      toast.error("Registration failed");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <UserPlus size={26} />
        </div>

        <h1>Create Account</h1>
        <p>Create your organization and start scheduling jobs.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Minimum 6 characters"
          />

          <label>Organization Name</label>
          <input
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="Example: Acme Org"
          />

          <button className="primary-btn" type="submit">
            Register
          </button>
        </form>

        <span className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </span>
      </div>
    </div>
  );
}