from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.core.erreurs import ajouter_handlers
from api.db.database import creer_tables
from api.routers import auth, collection, favoris, items, likes, stats


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await creer_tables()
    yield


app = FastAPI(
    title="MaCollection API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ajouter_handlers(app)

app.include_router(auth.router)
app.include_router(stats.router)
app.include_router(items.router)
app.include_router(collection.router)
app.include_router(favoris.router)
app.include_router(likes.router)
