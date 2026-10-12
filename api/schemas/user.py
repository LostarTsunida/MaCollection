from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    """Ce qui sort de l'API : jamais le mot de passe ni son hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
