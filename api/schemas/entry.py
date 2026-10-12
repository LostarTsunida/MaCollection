from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from api.schemas.item import ItemRead

Statut = Literal["a_decouvrir", "en_cours", "termine"]
Tri = Literal["date", "note"]


class EntryCreate(BaseModel):
    item_id: int
    statut: Statut
    note: int | None = Field(default=None, ge=1, le=5)
    commentaire: str | None = Field(default=None, max_length=500)


class EntryUpdate(BaseModel):
    statut: Statut | None = None
    note: int | None = Field(default=None, ge=1, le=5)
    commentaire: str | None = Field(default=None, max_length=500)


class EntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    statut: Statut
    note: int | None
    commentaire: str | None
    date_ajout: datetime
    item: ItemRead

    @field_validator("date_ajout")
    @classmethod
    def forcer_utc(cls, valeur: datetime) -> datetime:
        # SQLite ne garde pas le fuseau horaire : on sait que la date a été enregistrée en UTC
        if valeur.tzinfo is None:
            return valeur.replace(tzinfo=timezone.utc)
        return valeur


class Stats(BaseModel):
    total: int
    par_statut: dict[Statut, int]
    note_moyenne: float
