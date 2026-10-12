from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from api.db.database import get_session
from api.models import User, Entry  
from api.dependencies.auth import get_current_user
from api.schemas.entry import Stats
from api.schemas.erreur import reponses


router = APIRouter(tags=["Statistiques & Profil"])

@router.get(
    "/me/stats",
    response_model=Stats,
    summary="Statistiques de ma collection",
    responses=reponses(401),
)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
) -> dict:
    
    statement = select(Entry).where(Entry.user_id == current_user.id)
    entries = (await session.exec(statement)).all()

    
    total = len(entries)

    
    # les 3 statuts sont toujours présents, même à 0
    par_statut = {"a_decouvrir": 0, "en_cours": 0, "termine": 0}
    for entry in entries:
        statut = entry.statut
        if statut in par_statut:
            par_statut[statut] += 1
        else:
            par_statut[statut] = 1

    
    notes_valides = [entry.note for entry in entries if entry.note is not None]
    
    if len(notes_valides) > 0:
        note_moyenne = sum(notes_valides) / len(notes_valides)
        note_moyenne = round(note_moyenne, 2) 
    else:
        note_moyenne = 0.0 
   
    return {
        "total": total,
        "par_statut": par_statut,
        "note_moyenne": note_moyenne
    }