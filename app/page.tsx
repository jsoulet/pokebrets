import { CataloguePageClient } from "@/components/catalogue/catalogue-page-client";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-2 p-4 pt-8">
      <h1 className="text-3xl font-bold">Crounch</h1>
      <CataloguePageClient />
    </main>
  );
}
