from fastapi.testclient import TestClient


def test_liste_et_pagination(client: TestClient) -> None:
    reponse = client.get("/items", params={"limit": 2})
    assert reponse.status_code == 200
    donnees = reponse.json()
    assert donnees["total"] == 3
    assert donnees["page"] == 1
    assert len(donnees["results"]) == 2


def test_recherche_et_filtre(client: TestClient) -> None:
    assert client.get("/items", params={"q": "pizza"}).json()["total"] == 1
    assert client.get("/items", params={"categorie": "Italienne"}).json()["total"] == 2
    assert client.get("/items", params={"q": "riz", "categorie": "Italienne"}).json()["total"] == 0


def test_validation_des_parametres(client: TestClient) -> None:
    assert client.get("/items", params={"limit": 51}).status_code == 422
    assert client.get("/items", params={"page": 0}).status_code == 422
    assert client.get("/items", params={"q": "a"}).status_code == 422


def test_detail_et_404(client: TestClient) -> None:
    assert client.get("/items/1").json()["titre"] == "Pizza Margherita"

    reponse = client.get("/items/999")
    assert reponse.status_code == 404
    assert reponse.json() == {"erreur": {"code": 404, "message": "Item introuvable"}}


def test_categories(client: TestClient) -> None:
    assert client.get("/items/categories").json() == ["Espagnole", "Italienne"]
