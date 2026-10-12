from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import col, func, or_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from api.db.database import get_session
from api.db.fiches import FICHES_PAR_TITRE, temps_total
from api.dependencies.pagination import Pagination, get_pagination
from api.models.models import Item, Like
from api.schemas.erreur import reponses
from api.schemas.fiche import FicheRead, Ingredient
from api.schemas.item import ItemPopulaire, ItemRead, LikesInfo, PageItems

router = APIRouter(prefix="/items", tags=["Catalogue"])


@router.get(
    "",
    response_model=PageItems,
    summary="Rechercher des recettes (mot-clé, région, pagination)",
    responses=reponses(422),
)
async def lister_items(
    q: str | None = Query(None, min_length=2, max_length=50, description="Mot-clé cherché dans le titre ou la description"),
    categorie: str | None = Query(None, description="Région de la recette, ex : Italienne"),
    pagination: Pagination = Depends(get_pagination),
    session: AsyncSession = Depends(get_session),
) -> PageItems:
    requete = select(Item)
    compteur = select(func.count()).select_from(Item)

    if q:
        # contains() génère un LIKE avec paramètre, pas de concaténation SQL
        filtre = or_(
            col(Item.titre).contains(q, autoescape=True),
            col(Item.description).contains(q, autoescape=True),
        )
        requete = requete.where(filtre)
        compteur = compteur.where(filtre)
    if categorie:
        requete = requete.where(Item.categorie == categorie)
        compteur = compteur.where(Item.categorie == categorie)

    total = (await session.exec(compteur)).one()
    requete = requete.order_by(col(Item.titre)).offset(pagination.offset).limit(pagination.limit)
    items = (await session.exec(requete)).all()

    return PageItems(
        total=total,
        page=pagination.page,
        limit=pagination.limit,
        results=[ItemRead.model_validate(item) for item in items],
    )


@router.get("/categories", response_model=list[str], summary="Lister les régions disponibles")
async def lister_categories(session: AsyncSession = Depends(get_session)) -> list[str]:
    resultat = await session.exec(select(Item.categorie).distinct().order_by(col(Item.categorie)))
    return list(resultat.all())


@router.get(
    "/populaires",
    response_model=list[ItemPopulaire],
    summary="Les recettes les plus likées",
    responses=reponses(422),
)
async def items_populaires(
    limit: int = Query(6, ge=1, le=20),
    session: AsyncSession = Depends(get_session),
) -> list[ItemPopulaire]:
    nb_likes = func.count(col(Like.id)).label("nb_likes")
    requete = (
        select(Item, nb_likes)
        .join(Like, col(Like.item_id) == col(Item.id))
        .group_by(col(Item.id))
        .order_by(nb_likes.desc(), col(Item.titre))
        .limit(limit)
    )
    resultat = await session.exec(requete)
    return [ItemPopulaire(item=ItemRead.model_validate(item), likes=total) for item, total in resultat.all()]


@router.get(
    "/{item_id}",
    response_model=ItemRead,
    summary="Fiche détaillée d'une recette",
    responses=reponses(404),
)
async def detail_item(item_id: int, session: AsyncSession = Depends(get_session)) -> ItemRead:
    item = await session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item introuvable")
    return ItemRead.model_validate(item)


@router.get(
    "/{item_id}/likes",
    response_model=LikesInfo,
    summary="Nombre de likes d'une recette",
    responses=reponses(404),
)
async def likes_item(item_id: int, session: AsyncSession = Depends(get_session)) -> LikesInfo:
    item = await session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item introuvable")

    requete = select(func.count()).select_from(Like).where(Like.item_id == item_id)
    total = (await session.exec(requete)).one()
    return LikesInfo(item_id=item_id, total=total)


@router.get(
    "/{item_id}/fiche",
    response_model=FicheRead,
    summary="Fiche complète d'une recette (ingrédients, étapes, conseils)",
    responses=reponses(404),
)
async def fiche_item(item_id: int, session: AsyncSession = Depends(get_session)) -> FicheRead:
    item = await session.get(Item, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item introuvable")

    fiche = FICHES_PAR_TITRE.get(item.titre)
    if fiche is None:
        raise HTTPException(status_code=404, detail="Fiche introuvable pour cette recette")

    return FicheRead(
        item_id=item_id,
        titre=item.titre,
        description=item.description,
        portions=fiche["portions"],
        temps_preparation=fiche["temps_preparation"],
        temps_cuisson=fiche["temps_cuisson"],
        temps_repos=fiche["temps_repos"],
        temps_total=temps_total(fiche),
        difficulte=fiche["difficulte"],
        ingredients=[Ingredient(quantite=quantite, nom=nom) for quantite, nom in fiche["ingredients"]],
        ustensiles=fiche["ustensiles"],
        etapes=fiche["etapes"],
        astuces=fiche["astuces"],
        variantes=fiche["variantes"],
        conservation=fiche["conservation"],
    )
