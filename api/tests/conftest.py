import os
import sqlite3
import tempfile
from collections.abc import Iterator

# la config doit être posée AVANT d'importer l'application
DOSSIER_TEST = tempfile.mkdtemp()
FICHIER_DB = os.path.join(DOSSIER_TEST, "test.db")
os.environ["SECRET_KEY"] = "cle-uniquement-pour-les-tests"
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{FICHIER_DB}"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from api.main import app  # noqa: E402

RECETTES_TEST = [
    ("Pizza Margherita", "Italienne", "Tomate, mozzarella, basilic", 90, "moyen"),
    ("Tiramisu", "Italienne", "Dessert au café et mascarpone", 30, "facile"),
    ("Paella valenciana", "Espagnole", "Riz au safran", 70, "difficile"),
]


def ajouter_recettes() -> None:
    connexion = sqlite3.connect(FICHIER_DB)
    for titre, region, description, temps, difficulte in RECETTES_TEST:
        connexion.execute(
            "INSERT INTO item (titre, categorie, description, image_url, annee, temps_preparation, difficulte) "
            "VALUES (?, ?, ?, ?, ?, ?, ?)",
            (titre, region, description, "https://exemple.fr/image.jpg", 2025, temps, difficulte),
        )
    connexion.commit()
    connexion.close()


@pytest.fixture()
def client() -> Iterator[TestClient]:
    if os.path.exists(FICHIER_DB):
        os.remove(FICHIER_DB)
    # le "with" lance le lifespan, donc la création des tables
    with TestClient(app) as test_client:
        ajouter_recettes()
        yield test_client
