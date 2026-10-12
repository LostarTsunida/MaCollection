"""Fiches détaillées des recettes, rangées par région (un fichier par région)."""
from api.db.fiches import (
    americaine,
    chinoise,
    espagnole,
    francaise,
    indienne,
    italienne,
    japonaise,
    marocaine,
    mexicaine,
)

TOUTES_LES_FICHES = (
    italienne.FICHES + francaise.FICHES + espagnole.FICHES + chinoise.FICHES
    + japonaise.FICHES + indienne.FICHES + mexicaine.FICHES + marocaine.FICHES
    + americaine.FICHES
)

# accès rapide par titre de recette
FICHES_PAR_TITRE = {fiche["titre"]: fiche for fiche in TOUTES_LES_FICHES}


def temps_total(fiche: dict) -> int:
    return fiche["temps_preparation"] + fiche["temps_cuisson"] + fiche["temps_repos"]
