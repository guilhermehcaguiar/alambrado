export type NationalTeam = {
  displayName: string;
  slug: string;
};

export const NATIONAL_TEAMS: Record<string, NationalTeam> = {
  brasil: { displayName: "Brasil", slug: "brasil" },
  argentina: { displayName: "Argentina", slug: "argentina" },
  uruguai: { displayName: "Uruguai", slug: "uruguai" },
  franca: { displayName: "França", slug: "franca" },
  alemanha: { displayName: "Alemanha", slug: "alemanha" },
  espanha: { displayName: "Espanha", slug: "espanha" },
  italia: { displayName: "Itália", slug: "italia" },
  portugal: { displayName: "Portugal", slug: "portugal" },
  inglaterra: { displayName: "Inglaterra", slug: "inglaterra" },
  paisesbaixos: { displayName: "Países Baixos", slug: "paises-baixos" },
  belgica: { displayName: "Bélgica", slug: "belgica" },
  croacia: { displayName: "Croácia", slug: "croacia" },
  mexica: { displayName: "México", slug: "mexico" },
  mex: { displayName: "México", slug: "mexico" },
  estadosunidos: { displayName: "Estados Unidos", slug: "estados-unidos" },
  usa: { displayName: "Estados Unidos", slug: "estados-unidos" },
};
