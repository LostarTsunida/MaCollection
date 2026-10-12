from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException


def reponse_erreur(code: int, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=code,
        content={"erreur": {"code": code, "message": message}},
    )


async def handler_http(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    reponse = reponse_erreur(exc.status_code, str(exc.detail))
    if exc.headers:
        reponse.headers.update(exc.headers)
    return reponse


async def handler_validation(request: Request, exc: RequestValidationError) -> JSONResponse:
    # on renvoie seulement la première erreur pour garder un message lisible
    premiere = exc.errors()[0]
    champ = ".".join(str(morceau) for morceau in premiere["loc"] if morceau not in ("body", "query", "path"))
    message = f"{champ} : {premiere['msg']}" if champ else str(premiere["msg"])
    return reponse_erreur(422, message)


def ajouter_handlers(app: FastAPI) -> None:
    app.add_exception_handler(StarletteHTTPException, handler_http)  # type: ignore[arg-type]
    app.add_exception_handler(RequestValidationError, handler_validation)  # type: ignore[arg-type]
