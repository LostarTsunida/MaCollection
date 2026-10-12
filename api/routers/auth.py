from datetime import timedelta 
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from api.db.database import get_session
from api.models import User           
from api.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    verify_password,
    get_password_hash,
)
from api.dependencies.auth import get_current_user
from api.schemas.erreur import reponses
from api.schemas.user import Token, UserRead

router = APIRouter(prefix="/auth", tags=["Authentification"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserRead,
    summary="Créer un compte",
    responses=reponses(409, 422),
)
async def register(
    user_data: UserRegister,
    session: AsyncSession = Depends(get_session)
) -> UserRead:
    statement = select(User).where(User.email == user_data.email)
    existing_user = (await session.exec(statement)).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet email est déjà pris."
        )

    hashed_password = get_password_hash(user_data.password)

    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    return UserRead.model_validate(new_user)

@router.post(
    "/login",
    response_model=Token,
    summary="Se connecter et récupérer un token JWT",
    responses=reponses(401, 422),
)
async def login(
    user_data: UserLogin,
    session: AsyncSession = Depends(get_session),
) -> Token:
    statement = select(User).where(User.email == user_data.email)
    user = (await session.exec(statement)).first()

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")

@router.get(
    "/me",
    response_model=UserRead,
    summary="Infos de l'utilisateur connecté",
    responses=reponses(401),
)
async def read_users_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)