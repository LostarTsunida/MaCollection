from fastapi.testclient import TestClient

from outils import creer_compte


def test_inscription(client: TestClient) -> None:
    reponse = client.post("/auth/register", json={"email": "bob@test.fr", "password": "secret123"})
    assert reponse.status_code == 201
    donnees = reponse.json()
    assert donnees["email"] == "bob@test.fr"
    # le mot de passe et le hash ne doivent jamais sortir
    assert "password" not in donnees
    assert "hashed_password" not in donnees


def test_inscription_email_deja_pris(client: TestClient) -> None:
    client.post("/auth/register", json={"email": "bob@test.fr", "password": "secret123"})
    reponse = client.post("/auth/register", json={"email": "bob@test.fr", "password": "autre123"})
    assert reponse.status_code == 409
    assert reponse.json()["erreur"]["code"] == 409


def test_connexion_mauvais_mot_de_passe(client: TestClient) -> None:
    client.post("/auth/register", json={"email": "bob@test.fr", "password": "secret123"})
    reponse = client.post("/auth/login", json={"email": "bob@test.fr", "password": "faux"})
    assert reponse.status_code == 401


def test_me_avec_et_sans_token(client: TestClient) -> None:
    assert client.get("/auth/me").status_code == 401
    assert client.get("/auth/me", headers={"Authorization": "Bearer nimportequoi"}).status_code == 401

    entete = creer_compte(client)
    reponse = client.get("/auth/me", headers=entete)
    assert reponse.status_code == 200
    assert reponse.json()["email"] == "alice@test.fr"
