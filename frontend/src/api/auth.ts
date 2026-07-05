import { api } from "./client";

export async function login(data: {
  email: string;
  password: string;
}) {
  const response = await api.post("/auth/login", data);
  return response.data.data;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) {
  const response = await api.post("/auth/register", data);
  return response.data.data;
}

export async function getMe() {
  const response = await api.get("/users/me");
  return response.data.data;
}