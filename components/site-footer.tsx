// Mentions légales minimales (projet fan-made non-commercial) : rendu sur
// toutes les pages (app/layout.tsx), jamais dupliqué ailleurs. But : préciser
// clairement l'absence de lien avec Bret's (marque, visuels, noms de
// recettes) pour limiter le risque d'ennuis, sans prétendre à un avis
// juridique complet.
export function SiteFooter() {
  return (
    <footer className="text-muted-foreground border-border mt-auto w-full border-t px-5 py-8 text-center text-xs">
      <p>
        Crounch est un projet personnel, non-commercial et à but purement ludique, réalisé par un
        fan pour suivre ses dégustations. Le site n&rsquo;est ni affilié à, ni sponsorisé,
        approuvé ou soutenu par la marque Bret&rsquo;s ou son fabricant. Le nom
        « Bret&rsquo;s », les noms de recettes et les visuels de paquets restent la propriété de
        leurs titulaires respectifs et ne sont utilisés ici qu&rsquo;à titre d&rsquo;illustration,
        sans intention de porter atteinte à leurs droits. Aucune donnée n&rsquo;est collectée :
        tes dégustations restent stockées uniquement sur ton appareil. Si vous êtes un ayant
        droit et que vous souhaitez le retrait d&rsquo;un contenu, contactez-moi et je le ferai
        sans délai.
      </p>
    </footer>
  );
}
