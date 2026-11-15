import { routes, type VercelConfig, type Header } from "@vercel/config/v1";

const corsHeaders: Header[] = [
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
  { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
];

export const config: VercelConfig = {
  buildCommand: "npm run build",
  devCommand: "npm run dev",
  installCommand: "npm install",
  framework: "nextjs",
  regions: ["iad1"],
  functions: {
    "src/app/api/**/*.ts": {
      maxDuration: 30,
    },
  },
  crons: [
    { path: "/api/aggregates/refresh", schedule: "0 * * * *" },
  ],
  headers: [
    routes.header("/api/**", corsHeaders),
  ],
  rewrites: [
    routes.rewrite("/api/churches/:id/media/:mediaId", "/api/media/churches/:id/:mediaId"),
  ],
};