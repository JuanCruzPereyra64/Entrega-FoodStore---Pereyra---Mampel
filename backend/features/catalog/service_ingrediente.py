from datetime import datetime, timezone
from fastapi import HTTPException
from shared.uow.unit_of_work import UnitOfWork
from features.catalog.models import Ingrediente
from features.catalog.repository import IngredienteRepository
from features.catalog.schemas_ingrediente import IngredienteCreate, IngredienteUpdate


class IngredienteService:
    def get_all(self, uow: UnitOfWork, skip: int = 0, limit: int = 10, search: str = None):
        repo = IngredienteRepository(Ingrediente, uow.session)
        items, total = repo.get_paginated(skip=skip, limit=limit, search=search)
        return {"items": items, "total": total, "skip": skip, "limit": limit}

    def create(self, uow: UnitOfWork, data: IngredienteCreate) -> Ingrediente:
        repo = IngredienteRepository(Ingrediente, uow.session)
        ing = Ingrediente(**data.model_dump())
        repo.add(ing)
        return ing

    def update(self, uow: UnitOfWork, id: int, data: IngredienteUpdate) -> Ingrediente:
        repo = IngredienteRepository(Ingrediente, uow.session)
        ing = repo.get(id)
        if not ing:
            raise HTTPException(404, "Ingrediente no encontrado")
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(ing, k, v)
        ing.updated_at = datetime.now(timezone.utc)
        repo.update(ing)
        return ing

    def soft_delete(self, uow: UnitOfWork, id: int):
        repo = IngredienteRepository(Ingrediente, uow.session)
        ing = repo.get(id)
        if not ing:
            raise HTTPException(404, "Ingrediente no encontrado")
        repo.delete(ing)
