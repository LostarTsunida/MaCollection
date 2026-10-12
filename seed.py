import asyncio

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from api.db.database import creer_tables, engine
from api.db.recettes import RECETTES
from api.models import Item

async def seed_catalog() -> None:
    await creer_tables()

    ajoutees = 0
    mises_a_jour = 0

    async with AsyncSession(engine) as session:
        for recette in RECETTES:
            # on cherche la recette par son titre pour ne jamais créer de doublon
            statement = select(Item).where(Item.titre == recette["titre"])
            item = (await session.exec(statement)).first()

            if item is None:
                session.add(Item(**recette))
                ajoutees += 1
            else:
                # la recette existe déjà : on met à jour ses infos (image, temps...)
                for champ, valeur in recette.items():
                    setattr(item, champ, valeur)
                session.add(item)
                mises_a_jour += 1

        await session.commit()
        print(f"C'est OK ! {ajoutees} recette(s) ajoutée(s), {mises_a_jour} mise(s) à jour.")

if __name__ == "__main__":
    asyncio.run(seed_catalog())
