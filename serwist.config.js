// @ts-check
import { spawnSync } from "node:child_process";
import { serwist } from "@serwist/next/config";

// La révision aide Serwist à versionner les entrées précachées afin
// d'éviter qu'une réponse périmée reste servie après un déploiement.
const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ??
  crypto.randomUUID();

export default serwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  additionalPrecacheEntries: [{ url: "/manifest.json", revision }],
});
