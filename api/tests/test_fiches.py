from fastapi.testclient import TestClient

from api.db.fiches import FICHES_PAR_TITRE
from api.db.recettes import RECETTES


def test_fiche_complete(client: TestClient) -> None:
    reponse = client.get("/items/1/fiche")
    assert reponse.status_code == 200
    fiche = reponse.json()
    assert fiche["titre"] == "Pizza Margherita"
    assert fiche["temps_total"] == fiche["temps_preparation"] + fiche["temps_cuisson"] + fiche["temps_repos"]
    assert len(fiche["ingredients"]) > 0
    assert set(fiche["ingredients"][0]) == {"quantite", "nom"}
    assert len(fiche["etapes"]) >= 5


def test_fiche_item_inexistant(client: TestClient) -> None:
    assert client.get("/items/999/fiche").status_code == 404


def test_chaque_recette_a_une_fiche() -> None:
    for recette in RECETTES:
        assert recette["titre"] in FICHES_PAR_TITRE
        assert recette["image_url"].startswith("/images/recettes/")
