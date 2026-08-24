import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to handle guest API requests
function guestApiPlugin() {
  return {
    name: "guest-api",
    configureServer(server) {
      const guestsFilePath = resolve(__dirname, "public/guests.json");

      // GET /api/guests - Read guests
      server.middlewares.use("/api/guests", (req, res, next) => {
        if (req.method === "GET") {
          try {
            const data = fs.readFileSync(guestsFilePath, "utf-8");
            res.setHeader("Content-Type", "application/json");
            res.end(data);
          } catch {
            res.setHeader("Content-Type", "application/json");
            res.end("[]");
          }
          return;
        }

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              const guests = JSON.parse(body);
              fs.writeFileSync(guestsFilePath, JSON.stringify(guests, null, 2));
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), guestApiPlugin()],
});
