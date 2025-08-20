import { defineConfig } from "vitest/config";

process.env.DOTENV_CONFIG_PATH = ".env.test";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["dotenv/config"],
  },
});
