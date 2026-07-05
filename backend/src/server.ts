import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { initSocket } from "./socket";

const PORT = env.port || 5000;

const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});