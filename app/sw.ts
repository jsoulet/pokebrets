/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// AD-2 : lib/catalogue/ est le seul propriétaire de la fraîcheur du Catalogue.
// Cette règle DOIT rester en tête de `runtimeCaching` : elle empêche le
// service worker d'intercepter/mettre en cache (precache ou runtime cache)
// toute requête vers l'hôte distant du Catalogue. Sans elle, la règle
// générique `/\.(?:json|xml|csv)$/i` de `defaultCache` (NetworkFirst,
// cache "static-data-assets") matcherait `data/catalogue.json` et
// court-circuiterait silencieusement la logique de fraîcheur/dégradation
// réseau déjà construite et testée dans lib/catalogue/ (Stories 1.3, 1.7).
const excludeCatalogueRemoteHost: RuntimeCaching = {
  matcher: ({ url }) => url.hostname === "raw.githubusercontent.com",
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [excludeCatalogueRemoteHost, ...defaultCache],
});

serwist.addEventListeners();
