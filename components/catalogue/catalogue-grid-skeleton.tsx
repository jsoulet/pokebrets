// Skeleton affiché tant qu'aucune donnée n'est disponible (status "loading",
// premier chargement sans cache local) — UX-DR8. Mêmes classes de grille
// responsive que CatalogueGrid pour éviter tout saut de mise en page (CLS).
const PLACEHOLDER_COUNT = 12;

export function CatalogueGridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Chargement du catalogue"
      className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
    >
      {Array.from({ length: PLACEHOLDER_COUNT }, (_, index) => (
        <div
          key={index}
          className="bg-muted aspect-square animate-pulse rounded-3xl"
        />
      ))}
    </div>
  );
}
