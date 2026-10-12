from fastapi.testclient import TestClient

from outils import creer_compte


def test_favoris(client: TestClient) -> None:
    entete = creer_compte(client)

    assert client.post("/me/favoris/1", headers=entete).status_code == 201
    assert client.post("/me/favoris/1", headers=entete).status_code == 409
    assert client.post("/me/favoris/999", headers=entete).status_code == 404

    favoris = client.get("/me/favoris", headers=entete).json()
    assert [item["id"] for item in favoris] == [1]

    assert client.delete("/me/favoris/1", headers=entete).status_code == 204
    assert client.get("/me/favoris", headers=entete).json() == []


def test_likes_et_populaires(client: TestClient) -> None:
    alice = creer_compte(client, "alice@test.fr")
    bob = creer_compte(client, "bob@test.fr")

    client.post("/me/likes/3", headers=alice)
    reponse = client.post("/me/likes/3", headers=bob)
    assert reponse.status_code == 201
    assert reponse.json() == {"item_id": 3, "total": 2}
    client.post("/me/likes/1", headers=bob)

    assert client.post("/me/likes/3", headers=bob).status_code == 409
    assert client.get("/items/3/likes").json()["total"] == 2
    assert client.get("/me/likes", headers=alice).json() == [3]

    populaires = client.get("/items/populaires").json()
    assert populaires[0]["item"]["id"] == 3
    assert populaires[0]["likes"] == 2

    assert client.delete("/me/likes/3", headers=alice).status_code == 204
    assert client.get("/items/3/likes").json()["total"] == 1
