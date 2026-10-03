from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from api.db.database import get_session
from api.dependencies.auth import get_current_user
from api.models.models import Favori, Item, User
from api.schemas.erreur import reponses
from api.schemas.item import ItemRead

router = APIRouter(prefix="/me/favoris", tags=["Mes favoris"])


@router.get("", response_model=list[ItemRead], summary="Mes recettes favorites", responses=reponses(401))
async def lister_favoris(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[ItemRead]:
    requete = (
        select(Item)
        .join(Favori, col(Favori.item_id) == col(Item.id))
        .where(Favori.user_id == user.id)
        .order_by(col(Favori.id).desc())
    )
    items = (await session.exec(requete)).all()
    return [ItemRead.model_validate(item) for item in items]


@router.post(
    "/{item_id}",
    response_model=ItemRead,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une recette à mes favoris",
    responses=reponses(401, 404, 409),
)
async def ajouter_favori(
    item_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> ItemRead:
    item = await session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item introuvable")

    requete = select(Favori).where(Favori.user_id == user.id, Favori.item_id == item_id)
    if (await session.exec(requete)).first() is not None:
        raise HTTPException(status_code=409, detail="Recette déjà dans tes favoris")

    session.add(Favori(user_id=user.id, item_id=item_id))
    await session.commit()
    return ItemRead.model_validate(item)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Retirer une recette de mes favoris",
    responses=reponses(401, 404),
)
async def retirer_favori(
    item_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    requete = select(Favori).where(Favori.user_id == user.id, Favori.item_id == item_id)
    favori = (await session.exec(requete)).first()
    if favori is None:
        raise HTTPException(status_code=404, detail="Cette recette n'est pas dans tes favoris")

    await session.delete(favori)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
