from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import select
from datetime import datetime, timezone
from shared.uow.unit_of_work import UnitOfWork
from features.catalog.models import (
    Categoria, Producto, ProductoCategoria, ProductoIngrediente, FormaPago, Ingrediente
)
from features.catalog.schemas import (
    CategoriaCreate, CategoriaUpdate,
    ProductoCreate, ProductoUpdate, ProductoDetail, IngredienteSimple
)


# ── Categoria Service ─────────────────────────────────────────────────────────

class CategoriaService:
    def get_all(self, uow: UnitOfWork, skip: int = 0, limit: int = 100):
        stmt = select(Categoria).where(Categoria.deleted_at == None).offset(skip).limit(limit)
        return uow.session.exec(stmt).all()

    def get_by_id(self, uow: UnitOfWork, id: int):
        cat = uow.session.exec(
            select(Categoria).where(Categoria.id == id, Categoria.deleted_at == None)
        ).first()
        if not cat:
            raise HTTPException(404, "Categoría no encontrada")
        return cat

    def create(self, uow: UnitOfWork, data: CategoriaCreate) -> Categoria:
        cat = Categoria(**data.model_dump())
        uow.session.add(cat)
        uow.session.flush()
        uow.session.refresh(cat)
        return cat

    def update(self, uow: UnitOfWork, id: int, data: CategoriaUpdate) -> Categoria:
        cat = self.get_by_id(uow, id)
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(cat, k, v)
        cat.updated_at = datetime.now(timezone.utc)
        uow.session.add(cat)
        uow.session.flush()
        uow.session.refresh(cat)
        return cat

    def delete(self, uow: UnitOfWork, id: int):
        cat = self.get_by_id(uow, id)
        cat.deleted_at = datetime.now(timezone.utc)
        uow.session.add(cat)


# ── Producto Service ──────────────────────────────────────────────────────────

class ProductoService:
    def get_all(self, uow: UnitOfWork, skip: int = 0, limit: int = 20,
                search: str = None, disponible: bool = None):
        stmt = select(Producto).where(Producto.deleted_at == None)
        if search:
            stmt = stmt.where(Producto.nombre.ilike(f"%{search}%"))
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)

        total_stmt = stmt
        from sqlmodel import func
        count = uow.session.exec(select(func.count()).select_from(total_stmt.subquery())).one()
        items = uow.session.exec(stmt.offset(skip).limit(limit)).all()
        return {"items": items, "total": count, "skip": skip, "limit": limit}

    def get_by_id(self, uow: UnitOfWork, id: int) -> ProductoDetail:
        prod = uow.session.exec(
            select(Producto).where(Producto.id == id, Producto.deleted_at == None)
        ).first()
        if not prod:
            raise HTTPException(404, "Producto no encontrado")

        # Armar ingredientes
        pi_rows = uow.session.exec(
            select(ProductoIngrediente).where(ProductoIngrediente.producto_id == id)
        ).all()
        ingredientes = []
        for pi in pi_rows:
            ing = uow.session.get(Ingrediente, pi.ingrediente_id)
            if ing:
                ingredientes.append(IngredienteSimple(
                    id=ing.id, nombre=ing.nombre,
                    es_alergeno=ing.es_alergeno, es_removible=pi.es_removible
                ))

        cat_ids = [pc.categoria_id for pc in uow.session.exec(
            select(ProductoCategoria).where(ProductoCategoria.producto_id == id)
        ).all()]

        detail = ProductoDetail.model_validate(prod)
        detail.ingredientes = ingredientes
        detail.categoria_ids = cat_ids
        return detail

    def create(self, uow: UnitOfWork, data: ProductoCreate) -> Producto:
        prod_data = data.model_dump(exclude={"categoria_ids", "ingrediente_ids"})
        prod = Producto(**prod_data)
        uow.session.add(prod)
        uow.session.flush()
        uow.session.refresh(prod)

        for cat_id in (data.categoria_ids or []):
            uow.session.add(ProductoCategoria(producto_id=prod.id, categoria_id=cat_id))
        for ing_id in (data.ingrediente_ids or []):
            uow.session.add(ProductoIngrediente(producto_id=prod.id, ingrediente_id=ing_id))
        uow.session.flush()
        return prod

    def update(self, uow: UnitOfWork, id: int, data: ProductoUpdate) -> Producto:
        prod = uow.session.exec(
            select(Producto).where(Producto.id == id, Producto.deleted_at == None)
        ).first()
        if not prod:
            raise HTTPException(404, "Producto no encontrado")

        update_data = data.model_dump(exclude_unset=True, exclude={"categoria_ids"})
        for k, v in update_data.items():
            setattr(prod, k, v)
        prod.updated_at = datetime.now(timezone.utc)

        if data.categoria_ids is not None:
            # Limpiar y reasignar categorías
            for pc in uow.session.exec(
                select(ProductoCategoria).where(ProductoCategoria.producto_id == id)
            ).all():
                uow.session.delete(pc)
            for cat_id in data.categoria_ids:
                uow.session.add(ProductoCategoria(producto_id=id, categoria_id=cat_id))

        uow.session.add(prod)
        uow.session.flush()
        uow.session.refresh(prod)
        return prod

    def toggle_disponible(self, uow: UnitOfWork, id: int, disponible: bool) -> Producto:
        prod = uow.session.exec(
            select(Producto).where(Producto.id == id, Producto.deleted_at == None)
        ).first()
        if not prod:
            raise HTTPException(404, "Producto no encontrado")
        prod.disponible = disponible
        prod.updated_at = datetime.now(timezone.utc)
        uow.session.add(prod)
        uow.session.flush()
        uow.session.refresh(prod)
        return prod

    def update_stock(self, uow: UnitOfWork, id: int, stock: int) -> Producto:
        prod = uow.session.exec(
            select(Producto).where(Producto.id == id, Producto.deleted_at == None)
        ).first()
        if not prod:
            raise HTTPException(404, "Producto no encontrado")
        prod.stock_cantidad = stock
        prod.updated_at = datetime.now(timezone.utc)
        uow.session.add(prod)
        uow.session.flush()
        uow.session.refresh(prod)
        return prod

    def delete(self, uow: UnitOfWork, id: int):
        prod = uow.session.exec(
            select(Producto).where(Producto.id == id, Producto.deleted_at == None)
        ).first()
        if not prod:
            raise HTTPException(404, "Producto no encontrado")
        prod.deleted_at = datetime.now(timezone.utc)
        uow.session.add(prod)
