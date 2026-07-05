import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMe, login as loginApi, register as registerApi } from "../api/auth";

type User = {
  id: string;
  name: string;
  email: string;
};

type Organization = {
  id: string;
  name: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  organizations: Organization[];
  currentOrganizationId: string | null;
  setCurrentOrganizationId: (id: string) => void;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganizationId, setCurrentOrganizationIdState] = useState<
    string | null
  >(localStorage.getItem("currentOrganizationId"));

  function setCurrentOrganizationId(id: string) {
    localStorage.setItem("currentOrganizationId", id);
    setCurrentOrganizationIdState(id);
  }

  async function loadUser() {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const userData = await getMe();
      setUser(userData.user || userData);

      if (userData.organizations) {
        setOrganizations(userData.organizations);

        if (!currentOrganizationId && userData.organizations[0]) {
          setCurrentOrganizationId(userData.organizations[0].id);
        }
      }
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      setOrganizations([]);
      setCurrentOrganizationIdState(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(data: { email: string; password: string }) {
    const result = await loginApi(data);

    localStorage.setItem("token", result.token);
    setUser(result.user);

    setOrganizations(result.organizations || []);

    if (result.organizations?.[0]) {
      setCurrentOrganizationId(result.organizations[0].id);
    }
  }

  async function register(data: {
    name: string;
    email: string;
    password: string;
    organizationName: string;
  }) {
    const result = await registerApi(data);

    localStorage.setItem("token", result.token);
    setUser(result.user);

    if (result.organization) {
      const org = {
        id: result.organization.id,
        name: result.organization.name,
        role: "OWNER",
      };

      setOrganizations([org]);
      setCurrentOrganizationId(org.id);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("currentOrganizationId");
    localStorage.removeItem("selectedProjectId");
    localStorage.removeItem("selectedQueueId");

    setUser(null);
    setOrganizations([]);
    setCurrentOrganizationIdState(null);
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        organizations,
        currentOrganizationId,
        setCurrentOrganizationId,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}