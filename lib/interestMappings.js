// Přechodové mapování starých user_interests do současného číselníku.
// Hodnota `zajmove-skupiny` zůstává samostatnou legacy skupinou, dokud
// nebude schválen její konkrétní nový význam.
export const LEGACY_INTEREST_MAP = {
  ucitele: "ucitele",
  "druhy-stupen": "skola_2_stupen",
  "prvni-stupen": "skola_1_stupen",
  rodice: "rodice_deti",
  seniori: "seniori",
  komunita: "komunita",
  "karierni-poradenstvi": "karierni_poradenstvi",
  "filmovy-klub": "filmovy_klub",
  wellbeing: "wellbeing",
  "english-live": "anglictina",
  "smart-city": "smart_city",
  "ctenarsky-klub": "ctenarsky_klub",
  "veda-a-objevy": "veda_a_objevy",
  "svet-v-souvislostech": "svet_v_souvislostech",
};
