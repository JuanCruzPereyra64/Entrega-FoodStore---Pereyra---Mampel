from sqlmodel import select
from shared.repository.base_repository import BaseRepository
from features.users.models import Usuario

class UsuarioRepository(BaseRepository[Usuario]):
    def get_by_email(self, email: str) -> Usuario | None:
        stmt = select(Usuario).where(Usuario.email == email, Usuario.deleted_at == None)
        return self.session.exec(stmt).first()
