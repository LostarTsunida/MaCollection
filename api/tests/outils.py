from fastapi.testclient import TestClient


def creer_compte(client: TestClient, email: str = "alice@test.fr") -> dict[str, str]:
    """Crée un compte, se connecte et renvoie l'en-tête Authorization."""
    client.post("/auth/register", json={"email": email, "password": "motdepasse"})
    reponse = client.post("/auth/login", json={"email": email, "password": "motdepasse"})
    token = reponse.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
