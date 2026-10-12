from pydantic import BaseModel

from api.schemas.item import Difficulte


class Ingredient(BaseModel):
    quantite: str
    nom: str


class FicheRead(BaseModel):
    """Fiche complète d'une recette : même structure pour toutes les recettes."""

    item_id: int
    titre: str
    description: str
    portions: int
    temps_preparation: int
    temps_cuisson: int
    temps_repos: int
    temps_total: int
    difficulte: Difficulte
    ingredients: list[Ingredient]
    ustensiles: list[str]
    etapes: list[str]
    astuces: list[str]
    variantes: list[str]
    conservation: str
