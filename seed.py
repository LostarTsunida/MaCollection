from sqlmodel import Session, select
from api.database import engine 
from api.models import Item      

def seed_catalog():
    categories = ["Entrées", "Plats", "Desserts", "Boissons"]

    items_to_create = []
    for i in range(1, 41):
        category = categories[(i - 1) % len(categories)]
        
        item = Item(
            name=f"Recette n°{i}",
            category=category,
            description=f"Description de la recette numéro {i}."
        )
        items_to_create.append(item)

    with Session(engine) as session:
        statement = select(Item)
        existing_items = session.exec(statement).all()
        
        if len(existing_items) > 0:
            print("Le catalogue contient déjà des éléments.")
            return

        for item in items_to_create:
            session.add(item)
        
        session.commit()
        print("C'est OK ! 40 éléments répartis sur 4 catégories ont été injectés dans la base de données.")

if __name__ == "__main__":
    seed_catalog()