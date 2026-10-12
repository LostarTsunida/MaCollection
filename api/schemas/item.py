from typing import Literal

from pydantic import BaseModel, ConfigDict

Difficulte = Literal["facile", "moyen", "difficile"]


class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titre: str
    categorie: str
    description: str
    image_url: str
    annee: int
    temps_preparation: int
    difficulte: Difficulte


class PageItems(BaseModel):
    total: int
    page: int
    limit: int
    results: list[ItemRead]


class ItemPopulaire(BaseModel):
    item: ItemRead
    likes: int


class LikesInfo(BaseModel):
    item_id: int
    total: int
