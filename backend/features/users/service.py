from core.security import get_password_hash
from features.users.models import Usuario
from features.users.schemas import UsuarioCreate
from features.users.repository import UsuarioRepository
from shared.uow.unit_of_work import UnitOfWork

class UsuarioService:
    def create_user(self, uow: UnitOfWork, user_in: UsuarioCreate) -> Usuario:
        # Note: we don't commit here. UoW handles the commit.
        repo = UsuarioRepository(Usuario, uow.session)
        
        # Check if user exists
        if repo.get_by_email(user_in.email):
            raise ValueError("Email already registered")
            
        hashed_password = get_password_hash(user_in.password)
        
        user = Usuario(
            nombre=user_in.nombre,
            apellido=user_in.apellido,
            email=user_in.email,
            password_hash=hashed_password,
            celular=user_in.celular
        )
        
        repo.add(user)
        return user
