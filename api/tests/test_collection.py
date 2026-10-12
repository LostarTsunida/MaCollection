from fastapi.testclient import TestClient

from outils import creer_compte


def test_collection_protegee(client: TestClient) -> None:
    assert client.get("/me/collection").status_code == 401
    assert client.get("/me/stats").status_code == 401


def test_ajout_doublon_et_item_inexistant(client: TestClient) -> None:
    entete = creer_compte(client)

    reponse = client.post("/me/collection", json={"item_id": 1, "statut": "en_cours", "note": 4}, headers=entete)
    assert reponse.status_code == 201
    assert reponse.json()["item"]["titre"] == "Pizza Margherita"

    doublon = client.post("/me/collection", json={"item_id": 1, "statut": "termine"}, headers=entete)
    assert doublon.status_code == 409

    inconnu = client.post("/me/collection", json={"item_id": 999, "statut": "termine"}, headers=entete)
    assert inconnu.status_code == 404


def test_modifier_et_supprimer(client: TestClient) -> None:
    entete = creer_compte(client)
    entree = client.post("/me/collection", json={"item_id": 2, "statut": "a_decouvrir"}, headers=entete).json()

    reponse = client.patch(f"/me/collection/{entree['id']}", json={"statut": "termine", "note": 5}, headers=entete)
    assert reponse.status_code == 200
    assert reponse.json()["statut"] == "termine"
    assert reponse.json()["note"] == 5

    assert client.delete(f"/me/collection/{entree['id']}", headers=entete).status_code == 204
    assert client.delete(f"/me/collection/{entree['id']}", headers=entete).status_code == 404


def test_un_autre_utilisateur_ne_peut_pas_modifier(client: TestClient) -> None:
    alice = creer_compte(client, "alice@test.fr")
    bob = creer_compte(client, "bob@test.fr")
    entree = client.post("/me/collection", json={"item_id": 1, "statut": "en_cours"}, headers=alice).json()

    assert client.patch(f"/me/collection/{entree['id']}", json={"note": 1}, headers=bob).status_code == 404
    assert client.delete(f"/me/collection/{entree['id']}", headers=bob).status_code == 404
    assert client.get("/me/collection", headers=bob).json() == []


def test_filtre_tri_et_stats(client: TestClient) -> None:
    entete = creer_compte(client)
    client.post("/me/collection", json={"item_id": 1, "statut": "termine", "note": 3}, headers=entete)
    client.post("/me/collection", json={"item_id": 2, "statut": "termine", "note": 5}, headers=entete)
    client.post("/me/collection", json={"item_id": 3, "statut": "en_cours"}, headers=entete)

    termines = client.get("/me/collection", params={"statut": "termine"}, headers=entete).json()
    assert len(termines) == 2

    par_note = client.get("/me/collection", params={"tri": "note"}, headers=entete).json()
    assert [e["note"] for e in par_note] == [5, 3, None]

    stats = client.get("/me/stats", headers=entete).json()
    assert stats == {
        "total": 3,
        "par_statut": {"a_decouvrir": 0, "en_cours": 1, "termine": 2},
        "note_moyenne": 4.0,
    }
