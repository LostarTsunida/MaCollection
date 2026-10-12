import os
from collections.abc import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from api.models import models  # noqa: F401  (pour que les tables soient connues de SQLModel)

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./recettes.db")

# NullPool : une connexion par session, ça suffit largement pour SQLite
engine = create_async_engine(DATABASE_URL, poolclass=NullPool)


async def creer_tables() -> None:
    async with engine.begin() as connexion:
        await connexion.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    # setup : ouverture de la session / teardown : fermeture automatique après la requête
    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session
