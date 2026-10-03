from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from api.db.database import get_session
from api.dependencies.auth import get_current_user
from api.models.models import Item, Like, User
from api.schemas.erreur import reponses
from api.schemas.item import LikesInfo

router = APIRouter(prefix="/me/likes", tags=["Mes likes"])


@router.get("", response_model=list[int], summary="Ids des recettes que j'ai likées", responses=reponses(401))
async def mes_likes(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[int]:
    resultat = await session.exec(select(Like.item_id).where(Like.user_id == user.id))
    return list(resultat.all())


@router.post(
    "/{item_id}",
    response_model=LikesInfo,
    status_code=status.HTTP_201_CREATED,
    summary="Liker une recette",
    responses=reponses(401, 404, 409),
)
async def liker(
    item_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> LikesInfo:
    if await session.get(Item, item_id) is None:
        raise HTTPException(status_code=404, detail="Item introuvable")

    requete = select(Like).where(Like.user_id == user.id, Like.item_id == item_id)
    if (await session.exec(requete)).first() is not None:
        raise HTTPException(status_code=409, detail="Tu as déjà liké cette recette")

    session.add(Like(user_id=user.id, item_id=item_id))
    await session.commit()

    total = (await session.exec(select(func.count()).select_from(Like).where(Like.item_id == item_id))).one()
    return LikesInfo(item_id=item_id, total=total)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Retirer mon like",
    responses=reponses(401, 404),
)
async def retirer_like(
    item_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    requete = select(Like).where(Like.user_id == user.id, Like.item_id == item_id)
    like = (await session.exec(requete)).first()
    if like is None:
        raise HTTPException(status_code=404, detail="Tu n'as pas liké cette recette")

    await session.delete(like)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
