from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from api.db.database import get_session
from api.dependencies.auth import get_current_user
from api.models.models import Entry, Item, User
from api.schemas.entry import EntryCreate, EntryRead, EntryUpdate, Statut, Tri
from api.schemas.erreur import reponses

router = APIRouter(prefix="/me/collection", tags=["Ma collection"])


async def trouver_entree(entry_id: int, user: User, session: AsyncSession) -> Entry:
    # on filtre aussi sur user_id : impossible de toucher à l'entrée d'un autre utilisateur
    requete = select(Entry).where(Entry.id == entry_id, Entry.user_id == user.id)
    entree = (await session.exec(requete)).first()
    if entree is None:
        raise HTTPException(status_code=404, detail="Entrée introuvable")
    return entree


@router.get(
    "",
    response_model=list[EntryRead],
    summary="Ma collection (filtre par statut, tri par date ou note)",
    responses=reponses(401, 422),
)
async def lister_collection(
    statut: Statut | None = Query(None, description="a_decouvrir, en_cours ou termine"),
    tri: Tri = Query("date", description="date (plus récent d'abord) ou note (meilleure d'abord)"),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[EntryRead]:
    requete = select(Entry).where(Entry.user_id == user.id)
    if statut:
        requete = requete.where(Entry.statut == statut)

    if tri == "note":
        requete = requete.order_by(col(Entry.note).desc(), col(Entry.date_ajout).desc())
    else:
        requete = requete.order_by(col(Entry.date_ajout).desc())

    entrees = (await session.exec(requete)).all()
    return [EntryRead.model_validate(entree) for entree in entrees]


@router.post(
    "",
    response_model=EntryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une recette à ma collection",
    responses=reponses(401, 404, 409, 422),
)
async def ajouter_entree(
    donnees: EntryCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> EntryRead:
    item = await session.get(Item, donnees.item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item introuvable")

    requete = select(Entry).where(Entry.user_id == user.id, Entry.item_id == donnees.item_id)
    if (await session.exec(requete)).first() is not None:
        raise HTTPException(status_code=409, detail="Cette recette est déjà dans ta collection")

    entree = Entry(
        user_id=user.id,
        item_id=item.id,
        statut=donnees.statut,
        note=donnees.note,
        commentaire=donnees.commentaire,
        item=item,
    )
    session.add(entree)
    await session.commit()
    return EntryRead.model_validate(entree)


@router.patch(
    "/{entry_id}",
    response_model=EntryRead,
    summary="Modifier le statut, la note ou le commentaire",
    responses=reponses(401, 404, 422),
)
async def modifier_entree(
    entry_id: int,
    donnees: EntryUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> EntryRead:
    entree = await trouver_entree(entry_id, user, session)

    # exclude_unset : on ne modifie que les champs réellement envoyés
    for champ, valeur in donnees.model_dump(exclude_unset=True).items():
        if champ == "statut" and valeur is None:
            continue
        setattr(entree, champ, valeur)

    session.add(entree)
    await session.commit()
    return EntryRead.model_validate(entree)


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Retirer une recette de ma collection",
    responses=reponses(401, 404),
)
async def supprimer_entree(
    entry_id: int,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> Response:
    entree = await trouver_entree(entry_id, user, session)
    await session.delete(entree)
    await session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
