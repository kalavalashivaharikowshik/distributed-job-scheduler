import { api } from "./client";

export async function getDashboardOverview() {
  const response = await api.get("/dashboard/overview");
  return response.data.data;
}

export async function getSystemMetrics() {
  const response = await api.get("/metrics/system");
  return response.data.data;
}