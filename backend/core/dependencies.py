from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from core.config import settings
from shared.uow.unit_of_work import UnitOfWork
from features.users.models import Usuario, Rol, UsuarioRol
from sqlmodel import select

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_uow():
    return UnitOfWork()

def get_current_user(token: str = Depends(oauth2_scheme), uow: UnitOfWork = Depends(get_uow)) -> Usuario:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except JWTError:
        raise credentials_exception
        
    with uow:
        user = uow.session.get(Usuario, user_id)
        if user is None or user.deleted_at is not None:
            raise credentials_exception
        return user

def require_role(roles: list[str]):
    def role_checker(current_user: Usuario = Depends(get_current_user), uow: UnitOfWork = Depends(get_uow)):
        with uow:
            user_roles = uow.session.exec(
                select(Rol.nombre)
                .join(UsuarioRol, Rol.id == UsuarioRol.rol_id)
                .where(UsuarioRol.usuario_id == current_user.id)
            ).all()
            
            has_role = any(r in roles for r in user_roles)
            if not has_role:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permisos para esta acción")
        return current_user
    return role_checker
