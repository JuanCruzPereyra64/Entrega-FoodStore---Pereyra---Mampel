from fastapi import HTTPException
from core.security import verify_password, create_access_token, get_password_hash
from features.auth.schemas import Login, Token, Register, UserResponse
from features.users.repository import UsuarioRepository
from features.users.models import Usuario, Rol, UsuarioRol
from shared.uow.unit_of_work import UnitOfWork
from sqlmodel import select


class AuthService:
    def authenticate(self, uow: UnitOfWork, login_data: Login) -> Token:
        repo = UsuarioRepository(Usuario, uow.session)
        user = repo.get_by_email(login_data.email)

        if not user or not verify_password(login_data.password, user.password_hash):
            raise ValueError("Email o contraseña incorrectos")

        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token)

    def register(self, uow: UnitOfWork, data: Register) -> UserResponse:
        repo = UsuarioRepository(Usuario, uow.session)
        if repo.get_by_email(data.email):
            raise HTTPException(409, "El email ya está registrado")

        user = Usuario(
            nombre=data.nombre,
            apellido=data.apellido,
            email=data.email,
            celular=data.celular,
            password_hash=get_password_hash(data.password),
        )
        uow.session.add(user)
        uow.session.flush()
        uow.session.refresh(user)

        # Asignar rol CLIENT
        client_rol = uow.session.exec(select(Rol).where(Rol.nombre == "CLIENT")).first()
        if client_rol:
            uow.session.add(UsuarioRol(usuario_id=user.id, rol_id=client_rol.id))
            uow.session.flush()

        return self._to_response(uow, user)

    def get_me(self, uow: UnitOfWork, user_id: int) -> UserResponse:
        user = uow.session.get(Usuario, user_id)
        if not user or user.deleted_at:
            raise HTTPException(404, "Usuario no encontrado")
        return self._to_response(uow, user)

    def _to_response(self, uow: UnitOfWork, user: Usuario) -> UserResponse:
        roles = uow.session.exec(
            select(Rol).join(UsuarioRol, Rol.id == UsuarioRol.rol_id)
            .where(UsuarioRol.usuario_id == user.id)
        ).all()
        return UserResponse(
            id=user.id,
            nombre=user.nombre,
            apellido=user.apellido,
            email=user.email,
            celular=user.celular,
            roles=[r.nombre for r in roles],
            created_at=user.created_at,
        )
