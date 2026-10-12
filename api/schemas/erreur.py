from pydantic import BaseModel


class ErreurDetail(BaseModel):
    code: int
    message: str


class ErreurResponse(BaseModel):
    erreur: ErreurDetail


def reponses(*codes: int) -> dict[int | str, dict[str, object]]:
    """Petit raccourci pour déclarer les codes d'erreur d'une route dans /docs."""
    descriptions = {
        400: "Requête invalide",
        401: "Non authentifié (token absent, invalide ou expiré)",
        404: "Ressource introuvable",
        409: "Conflit (élément déjà présent)",
        422: "Paramètres invalides",
    }
    return {code: {"model": ErreurResponse, "description": descriptions[code]} for code in codes}
