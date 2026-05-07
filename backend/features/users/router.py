from fastapi import APIRouter, Depends, HTTPException, status
from shared.uow.unit_of_work import UnitOfWork
from features.users.schemas import UsuarioCreate, UsuarioRead
from features.users.service import UsuarioService

router = APIRouter(prefix="/users", tags=["Users"])

def get_uow():
    return UnitOfWork()

@router.post("/", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UsuarioCreate, uow: UnitOfWork = Depends(get_uow)):
    service = UsuarioService()
    try:
        with uow:
            user = service.create_user(uow, user_in)
            # uow.__exit__ will commit here automatically if no exception
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
