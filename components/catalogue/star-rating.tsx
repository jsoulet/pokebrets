import { useState } from "react";
import { Star } from "lucide-react";

// Composant de présentation pur (Story 2.1) : ne lit/écrit jamais
// `localStorage` lui-même, reçoit `value`/`onChange` en props — même
// philosophie que `catalogue-tile.tsx` (Story 1.5/1.6). Réutilisé
// uniquement dans `FlavorDetailDialog` pour cette story, mais gardé dans
// son propre fichier pour rester testable isolément.
const STAR_VALUES = [1, 2, 3, 4, 5] as const;

type StarRatingProps = {
  value: number | undefined;
  onChange: (value: number | null) => void;
};

export function StarRating({ value, onChange }: StarRatingProps) {
  // [Review] Survol (retour utilisateur) : `hoveredValue` ne modifie jamais
  // la vraie note (`value`/`onChange`), purement visuel — prévisualise le
  // remplissage jusqu'à l'étoile survolée, comme un composant de notation
  // classique. Réinitialisé à `null` dès que le pointeur quitte le groupe
  // pour ne jamais laisser un état de survol "collé".
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  return (
    <div
      role="group"
      aria-label="Notation"
      className="flex gap-1"
      onPointerLeave={() => setHoveredValue(null)}
    >
      {STAR_VALUES.map((starValue) => {
        const isFilled = starValue <= (hoveredValue ?? value ?? 0);
        // Retap sur l'étoile de la note actuelle retire la note (AC #2) ;
        // taper sur une autre étoile attribue cette nouvelle note.
        const isCurrentValue = value === starValue;

        return (
          <button
            key={starValue}
            type="button"
            aria-pressed={isCurrentValue}
            aria-label={`Noter ${starValue} étoile${starValue > 1 ? "s" : ""} sur 5`}
            onClick={() => onChange(isCurrentValue ? null : starValue)}
            onPointerEnter={() => setHoveredValue(starValue)}
            className="text-primary rounded-md p-0.5 transition-transform hover:scale-125"
          >
            <Star aria-hidden="true" className="size-6" fill={isFilled ? "currentColor" : "none"} />
          </button>
        );
      })}
    </div>
  );
}
