from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from shared.uow.unit_of_work import UnitOfWork
from features.auth.schemas import Token, Login, Register, UserResponse
from features.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_uow():
    return UnitOfWork()

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), uow: UnitOfWork = Depends(get_uow)):
    service = AuthService()
    try:
        with uow:
            login_data = Login(email=form_data.username, password=form_data.password)
            token = service.authenticate(uow, login_data)
        return token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/register", response_model=UserResponse, status_code=201)
def register(data: Register, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return AuthService().register(uow, data)

from core.dependencies import get_current_user
from features.users.models import Usuario

@router.get("/me", response_model=UserResponse)
def me(uow: UnitOfWork = Depends(get_uow), current_user: Usuario = Depends(get_current_user)):
    with uow:
        return AuthService().get_me(uow, current_user.id)

