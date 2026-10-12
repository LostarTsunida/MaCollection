from fastapi import Query
from pydantic import BaseModel


class Pagination(BaseModel):
    page: int
    limit: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


def get_pagination(
    page: int = Query(1, ge=1, description="Numéro de page (commence à 1)"),
    limit: int = Query(12, ge=1, le=50, description="Nombre de recettes par page"),
) -> Pagination:
    return Pagination(page=page, limit=limit)
