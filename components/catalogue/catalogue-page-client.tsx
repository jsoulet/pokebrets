"use client";

import { useRef, useState } from "react";
import { useCatalogue } from "@/lib/catalogue";
import { useTasted } from "@/lib/tasted";
import { useRating } from "@/lib/rating";
import { useSortPreference } from "@/lib/sort-preference";
import { useTastedFilter } from "@/lib/tasted-filter";
import { sortFlavors } from "@/lib/catalogue/sort";
import { Button } from "@/components/ui/button";
import { CatalogueGrid } from "./catalogue-grid";
import { CatalogueGridSkeleton } from "./catalogue-grid-skeleton";
import { FlavorDetailDialog } from "./flavor-detail-dialog";
import { SortControl } from "./sort-control";
import { TastedFilterControl } from "./tasted-filter-control";

// [Review] Filet zigzag façon bord de sachet ouvert (DESIGN.md >
// components.section-divider). Reproduit via un masque SVG (`mask-image`)
// à taille de dent fixe en pixels plutôt qu'un `clip-path` en pourcentage
// (qui s'étire/aplatit les dents sur les grands écrans) ou un dégradé CSS
// à coins (`to bottom right/left`) — testé et rejeté car il produit des
// dents en forme de "maison"/étoile tronquée plutôt que des triangles nets
// (le stop à 50% d'un `linear-gradient` d'angle ne suit pas la diagonale
// exacte voulue). Le masque SVG donne un contrôle exact du tracé
// (triangle plein 0,0 → 14,14 → 28,0 → 28,14 → 0,14) et se répète
// (`mask-repeat: repeat-x`) à taille constante.
// [Review] Passage de `mask` à `background-image` (SVG complet, couleur +
// trait) : un `mask` ne peut porter qu'une couleur pleine découpée, jamais
// de contour — impossible d'y ajouter la bordure noire de la DA brets.fr
// (référence utilisateur) qui trace uniquement l'arête en dents de scie
// (`polyline` ouverte, pas le polygone fermé, pour ne pas dessiner aussi un
// trait sur la base plate invisible entre deux répétitions).
const ZIGZAG_TOOTH_PX = 14;
const ZIGZAG_COLOR = "%23ffc602";
const ZIGZAG_BACKGROUND_SVG_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 28 14' preserveAspectRatio='none'%3E%3Cpolygon points='0,14 14,0 28,14 28,0 0,0' fill='${ZIGZAG_COLOR}'/%3E%3Cpolyline points='0,14 14,0 28,14' fill='none' stroke='%23000000' stroke-width='2.5' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E")`;
const ZIGZAG_BACKGROUND_STYLE = {
  backgroundImage: ZIGZAG_BACKGROUND_SVG_URL,
  backgroundSize: `${ZIGZAG_TOOTH_PX * 2}px ${ZIGZAG_TOOTH_PX}px`,
  backgroundRepeat: "repeat-x",
} as const;

// Contour du titre "CROUNCH" (DESIGN.md > Colors, traitement "titre
// contouré" de brets.fr) : une pile de `text-shadow` décalées à 1px sur
// tout le pourtour plutôt qu'un simple `-webkit-text-stroke`, qui rendait
// un contour plus fin/anguleux avec cette police display et manquait de
// support hors Chromium/Safari. Une dernière couche, sans flou et décalée
// en diagonale, ajoute l'ombre portée "dure" façon sticker/BD (cf. mockup
// "LES CHIPS DE CRÊPES").
const TITLE_TEXT_SHADOW =
  "rgb(0, 0, 0) 2px 0px 0px, rgb(0, 0, 0) 1.75517px 0.958851px 0px, rgb(0, 0, 0) 1.0806px 1.68294px 0px, rgb(0, 0, 0) 0.141474px 1.99499px 0px, rgb(0, 0, 0) -0.832294px 1.81859px 0px, rgb(0, 0, 0) -1.60229px 1.19694px 0px, rgb(0, 0, 0) -1.97998px 0.28224px 0px, rgb(0, 0, 0) -1.87291px -0.701566px 0px, rgb(0, 0, 0) -1.30729px -1.5136px 0px, rgb(0, 0, 0) -0.421592px -1.95506px 0px, rgb(0, 0, 0) 0.567324px -1.91785px 0px, rgb(0, 0, 0) 1.41734px -1.41108px 0px, rgb(0, 0, 0) 1.92034px -0.558831px 0px, rgb(0, 0, 0) 6px 6px 0px";

// Frontière Client Component (AD-4) : ce composant est le seul consommateur
// de `useCatalogue()` (Story 1.3) et `useTasted()` (Story 1.5) de la page
// d'accueil. Il ne fait que composer/projeter leurs deux contrats — jamais de
// fetch, de lecture de localStorage, ni de comparaison de fraîcheur ici
// (lib/catalogue/ et lib/tasted/ restent les seuls propriétaires de leur état
// respectif). Story 1.6 : reste aussi le seul coordinateur de l'ouverture du
// détail de Saveur (une Dialog unique contrôlée), pour ne pas disperser
// l'état d'ouverture dans chaque tuile et pour garder l'annonce `aria-live`
// et la mutation goûté/pas goûté centralisées en un seul endroit.
export function CataloguePageClient() {
  const { data, status, error, isOffline, retry } = useCatalogue();
  const { tastedIds, toggleTasted } = useTasted();
  const { getRating, setRating } = useRating();
  const { sortMode, setSortMode } = useSortPreference();
  const { filterMode, setFilterMode } = useTastedFilter();

  // Annonce lecteur d'écran du changement d'état (AC #5, UX-DR14) : une
  // région `aria-live="polite"` distincte plutôt que de faire reposer toute
  // l'accessibilité sur `aria-pressed` seul. `catalogue-tile.tsx` reste ainsi
  // purement présentational et ignore tout de l'annonce.
  const [announcement, setAnnouncement] = useState("");

  // Story 1.6 : id de la Saveur dont le détail est ouvert (ou `null`) — seule
  // source de vérité pour une Dialog unique contrôlée, jamais un état
  // d'ouverture par tuile (AD-1 : jointure par `flavor.id`).
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null);
  // [Review] id de la Saveur affichée dans la Dialog, distinct de
  // `selectedFlavorId` : reste renseigné pendant toute la transition de
  // fermeture (Base UI `onOpenChangeComplete`) afin que `FlavorDetailDialog`
  // ne soit démonté qu'une fois la transition CSS de sortie réellement
  // terminée, plutôt que de façon synchrone dès le déclenchement de la
  // fermeture — sans quoi les classes de transition de `dialog.tsx` ne
  // pourraient jamais jouer.
  const [displayedFlavorId, setDisplayedFlavorId] = useState<string | null>(null);
  // Bouton info ayant ouvert la Dialog, pour lui rendre le focus à la
  // fermeture (Subtask 4.4), quelle que soit la cause de fermeture (Échap,
  // clic extérieur, bouton de fermeture explicite).
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);

  // [Review] Le header (bandeau moutarde, DESIGN.md > Colors + Header du
  // Catalogue, EXPERIENCE.md) reste visible quel que soit `status` — comme
  // dans le mockup (`.working/key-catalogue.html`), où le titre s'affiche
  // aussi pendant le chargement/l'état hors-ligne. Seuls le compteur et la
  // barre, qui dépendent des données, restent conditionnés à "ready". On ne
  // fait donc plus de retour anticipé complet ici : `flavors` reste un
  // tableau vide tant que `status !== "ready"` (data n'est garanti non-null
  // par le contrat du hook, Story 1.3, qu'une fois "ready" atteint).
  const flavors = status === "ready" ? (data?.flavors ?? []) : [];

  // Ordre des transformations (Story 2.2/2.3) : Catalogue brut → tri →
  // filtre goûté/non-goûté/toutes → grille. Le compteur de progression
  // ci-dessous continue d'utiliser `flavors` (l'ensemble complet), jamais
  // `sortedFlavors` ni `visibleFlavors` (AC #8 Story 2.3 — piège principal
  // identifié).
  const sortedFlavors = sortFlavors(flavors, sortMode, getRating);
  const visibleFlavors =
    filterMode === "all"
      ? sortedFlavors
      : sortedFlavors.filter((flavor) =>
          filterMode === "tasted" ? tastedIds.has(flavor.id) : !tastedIds.has(flavor.id),
        );

  // Compteur de progression (AC #4, UX-DR10) : `X` dérivé par jointure sur les
  // `flavor.id` du Catalogue courant, jamais par un compte déconnecté du
  // Catalogue (AD-1) — protège contre d'éventuelles clés orphelines dans
  // l'état persisté sans jamais le purger automatiquement.
  const tastedInCatalogueCount = flavors.filter((flavor) => tastedIds.has(flavor.id)).length;
  const displayedFlavor = flavors.find((flavor) => flavor.id === displayedFlavorId) ?? null;
  // Story 2.3, AC #4 : distinct du cas "Catalogue vide" (scrape sans
  // résultat, cf. deferred-work.md) — ici le Catalogue a des saveurs, mais
  // le filtre actif n'en laisse aucune visible.
  const showEmptyFilterState =
    status === "ready" && filterMode !== "all" && visibleFlavors.length === 0 && flavors.length > 0;

  function handleToggleFlavor(id: string) {
    const flavor = flavors.find((candidate) => candidate.id === id);
    const nextIsTasted = toggleTasted(id);

    if (flavor) {
      setAnnouncement(`${flavor.name}, ${nextIsTasted ? "goûtée" : "pas goûtée"}`);
    }
  }

  // Story 2.1, AC #5 : mutation totalement indépendante du toggle
  // goûté/pas goûté — ne touche jamais `toggleTasted`/`setTasted`.
  function handleRatingChange(id: string, value: number | null) {
    setRating(id, value);
  }

  function handleOpenFlavorDetail(id: string, triggerElement: HTMLButtonElement) {
    detailTriggerRef.current = triggerElement;
    setSelectedFlavorId(id);
    setDisplayedFlavorId(id);
  }

  function handleDetailOpenChange(open: boolean) {
    // Ouvrir/fermer la Dialog (Échap, clic extérieur, bouton de fermeture)
    // ne mute jamais l'état goûté/pas goûté : seul `handleToggleFlavor`,
    // appelé explicitement par le bouton toggle de la Dialog, le fait.
    if (!open) {
      setSelectedFlavorId(null);
    }
  }

  function handleDetailOpenChangeComplete(open: boolean) {
    // Ne démonte `FlavorDetailDialog` qu'une fois la transition de sortie de
    // Base UI réellement terminée (voir commentaire sur `displayedFlavorId`).
    if (!open) {
      setDisplayedFlavorId(null);
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col items-center">
      {/* DESIGN.md > Colors (primary moutarde) + EXPERIENCE.md > Header du
          Catalogue : bandeau plein écran, toujours visible (titre présent
          même pendant le chargement/hors-ligne, cf. mockup), qui porte le
          titre puis — une fois les données prêtes — le compteur/la barre de
          progression dans la même bande de couleur. */}
      <div className="flex w-full flex-col items-center gap-4 bg-gradient-to-b from-[#FEB30E] to-[#ffc602] px-6 pt-14 pb-12">
        <h1
          className="text-background font-tanker text-[76px] leading-none tracking-wide uppercase sm:text-[128px]"
          style={{ textShadow: TITLE_TEXT_SHADOW }}
        >
          Crounch
        </h1>
        {status === "ready" && flavors.length > 0 ? (
          <>
            <p className="text-foreground font-recoleta text-[30px] font-semibold">
              {tastedInCatalogueCount}/{flavors.length} saveurs goûtées
            </p>
            {/* EXPERIENCE.md > Component Patterns : "Barre de progression /
                compteur" — le compteur texte ci-dessus reste la source de
                vérité du contenu annoncé (microcopy), cette barre n'ajoute
                qu'un rendu visuel synchronisé sur la même valeur. Piste et
                remplissage repris du mockup (piste translucide sur le fond
                moutarde, remplissage `success` vert plutôt que `primary`
                pour rester lisible sur ce fond). Non rendue à 0 Saveur pour
                éviter une barre 0/0 dénuée de sens (cf. deferred-work.md :
                état vide explicite du Catalogue). */}
            <div
              role="progressbar"
              aria-valuenow={tastedInCatalogueCount}
              aria-valuemin={0}
              aria-valuemax={flavors.length}
              aria-valuetext={`${tastedInCatalogueCount}/${flavors.length} saveurs goûtées`}
              aria-label="Progression des saveurs goûtées"
              className="bg-background/40 h-2 w-full overflow-hidden rounded-full"
            >
              <div
                className="bg-success h-full rounded-full"
                style={{ width: `${(tastedInCatalogueCount / flavors.length) * 100}%` }}
              />
            </div>
          </>
        ) : null}
      </div>
      {/* DESIGN.md > components.section-divider : filet zigzag façon bord de
          sachet ouvert, séparant le header (titre + progression) de la
          grille — usage ponctuel réservé à cette seule transition de
          section (jamais une simple bordure de carte). Pleine largeur, comme
          le bandeau qu'il prolonge, plutôt que contraint en `max-w-xs`. */}
      <div
        aria-hidden="true"
        className="h-3.5 w-full flex-shrink-0"
        style={ZIGZAG_BACKGROUND_STYLE}
      />
      {status === "ready" && flavors.length > 0 ? (
        // Story 2.2/2.3 : toolbar tri + filtre regroupés côte à côte (pas
        // `justify-between`, qui les éloignait aux deux bouts et cassait la
        // cohérence visuelle des deux boutons pilule), juste sous le
        // zigzag, uniquement visible quand il y a des saveurs à trier/
        // filtrer (pas de sens pendant le chargement/l'erreur).
        <div className="flex w-full max-w-6xl flex-wrap items-center gap-4 px-6 pt-8 pb-6">
          <SortControl value={sortMode} onChange={setSortMode} />
          {/* Séparateur visuel : distingue le groupe "tri" (exclusif, une
              seule valeur active) du groupe "filtre" (indépendant,
              combinable avec n'importe quel tri) — sans lui les deux
              pilules identiques laissaient croire à une 3e option de tri. */}
          <div aria-hidden="true" className="bg-foreground/20 h-8 w-px" />
          <TastedFilterControl value={filterMode} onChange={setFilterMode} />
        </div>
      ) : null}
      {isOffline ? (
        // Story 1.7 (AC #1) : bannière discrète, non-bloquante, affichée
        // sous le bandeau/zigzag (fond crème) — le Catalogue en cache reste
        // affiché et le toggle goûté/pas goûté reste pleinement utilisable
        // (Subtask 2.3). `role="status"` (pas `role="alert"`) car ce n'est
        // jamais un état urgent/bloquant.
        <p
          role="status"
          className="bg-muted text-muted-foreground mx-4 mt-3 rounded-lg px-3 py-1.5 text-sm"
        >
          Hors ligne — dernière version connue affichée
        </p>
      ) : null}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      {status === "loading" ? <CatalogueGridSkeleton /> : null}
      {status === "error" ? (
        <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-foreground">{error}</p>
          <Button onClick={retry}>Réessayer</Button>
        </div>
      ) : null}
      {status === "ready" ? (
        <>
          {showEmptyFilterState ? (
            // Story 2.3, AC #4 : message dédié positif plutôt qu'un espace
            // vide silencieux — ton léger (UX-DR15), `role="status"` (pas
            // une erreur, cf. bannière hors-ligne ci-dessus). Message
            // distinct selon le filtre actif : "tout goûté" reste
            // valorisant pour le filtre "non goûtées", mais n'aurait aucun
            // sens pour le filtre "goûtées" (rien encore goûté).
            <p role="status" className="text-foreground p-8 text-center">
              {filterMode === "untasted"
                ? "Bravo, tu as tout goûté ! 🎉"
                : "Tu n'as encore rien goûté."}
            </p>
          ) : (
            <CatalogueGrid
              flavors={visibleFlavors}
              tastedIds={tastedIds}
              getRating={getRating}
              onToggleFlavor={handleToggleFlavor}
              onOpenFlavorDetail={handleOpenFlavorDetail}
            />
          )}
          {displayedFlavor ? (
            <FlavorDetailDialog
              flavor={displayedFlavor}
              open={selectedFlavorId !== null}
              onOpenChange={handleDetailOpenChange}
              onOpenChangeComplete={handleDetailOpenChangeComplete}
              isTasted={tastedIds.has(displayedFlavor.id)}
              onToggle={handleToggleFlavor}
              rating={getRating(displayedFlavor.id)}
              onRatingChange={handleRatingChange}
              finalFocusRef={detailTriggerRef}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

