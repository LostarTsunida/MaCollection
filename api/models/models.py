from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


def maintenant() -> datetime:
    return datetime.now(timezone.utc)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str


class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    titre: str = Field(unique=True, index=True)
    categorie: str = Field(index=True)  # la région de la recette
    description: str
    image_url: str
    annee: int
    temps_preparation: int  # en minutes
    difficulte: str  # facile / moyen / difficile


class Entry(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "item_id"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    item_id: int = Field(foreign_key="item.id")
    statut: str
    note: int | None = None
    commentaire: str | None = None
    date_ajout: datetime = Field(default_factory=maintenant)

    # selectin : la recette est chargée en même temps que l'entrée (obligatoire en async)
    item: Optional[Item] = Relationship(sa_relationship_kwargs={"lazy": "selectin"})


class Favori(SQLModel, table=True):
    __tablename__ = "favoris"
    __table_args__ = (UniqueConstraint("user_id", "item_id"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    item_id: int = Field(foreign_key="item.id")


class Like(SQLModel, table=True):
    __tablename__ = "likes"
    __table_args__ = (UniqueConstraint("user_id", "item_id"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    item_id: int = Field(foreign_key="item.id", index=True)
