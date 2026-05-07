from typing import List, Tuple
from sqlmodel import select, func
from shared.repository.base_repository import BaseRepository
from features.catalog.models import Ingrediente

class IngredienteRepository(BaseRepository[Ingrediente]):
    def get_paginated(self, skip: int = 0, limit: int = 10, search: str = None) -> Tuple[List[Ingrediente], int]:
        stmt = select(Ingrediente).where(Ingrediente.deleted_at == None)
        count_stmt = select(func.count(Ingrediente.id)).where(Ingrediente.deleted_at == None)
        if search:
            stmt = stmt.where(Ingrediente.nombre.ilike(f"%{search}%"))
            count_stmt = count_stmt.where(Ingrediente.nombre.ilike(f"%{search}%"))
        items = self.session.exec(stmt.offset(skip).limit(limit)).all()
        total = self.session.exec(count_stmt).one()
        return items, total

    def get_all_active(self, search: str = None) -> List[Ingrediente]:
        stmt = select(Ingrediente).where(Ingrediente.deleted_at == None)
        if search:
            stmt = stmt.where(Ingrediente.nombre.ilike(f"%{search}%"))
        return self.session.exec(stmt).all()
