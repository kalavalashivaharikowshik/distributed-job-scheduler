export const logger = {
  info(message: string) {
    console.log(`[WORKER INFO] ${message}`);
  },

  error(message: string) {
    console.error(`[WORKER ERROR] ${message}`);
  },
};