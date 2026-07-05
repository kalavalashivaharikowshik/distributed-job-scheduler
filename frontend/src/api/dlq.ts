import { api } from "./client";

export async function getDLQEntries(queueId: string) {
  const response = await api.get("/dlq", {
    params: {
      queueId,
    },
  });

  return response.data.data;
}

export async function retryDLQEntry(id: string) {
  const response = await api.patch(`/dlq/${id}/retry`);
  return response.data.data;
}