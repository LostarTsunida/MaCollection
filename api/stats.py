from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from api.database import get_session
from api.models import User, Entry  
from api.security import get_current_user 


router = APIRouter(tags=["Statistiques & Profil"])

@router.get("/me/stats")
def get_user_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    statement = select(Entry).where(Entry.user_id == current_user.id)
    entries = session.exec(statement).all()

    
    total = len(entries)

    
    par_statut = {}
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