from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from typing import Optional
import io
from openpyxl import Workbook
from shared.uow.unit_of_work import UnitOfWork
from features.catalog.service import CategoriaService, ProductoService
from features.catalog.schemas import (
    CategoriaCreate, CategoriaUpdate, CategoriaRead,
    ProductoCreate, ProductoUpdate, ProductoRead, ProductoDetail,
    StockUpdate
)
from features.catalog.models import Ingrediente, FormaPago
from features.catalog.repository import IngredienteRepository
from core.dependencies import require_role

router = APIRouter()

def get_uow():
    return UnitOfWork()

# ── Categorias ────────────────────────────────────────────────────────────────

cat_router = APIRouter(prefix="/categorias", tags=["Categorías"])

@cat_router.get("/")
def list_categorias(skip: int = 0, limit: int = 100, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return CategoriaService().get_all(uow, skip, limit)

@cat_router.get("/{id}", response_model=CategoriaRead)
def get_categoria(id: int, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return CategoriaService().get_by_id(uow, id)

@cat_router.post("/", response_model=CategoriaRead, status_code=201, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def create_categoria(data: CategoriaCreate, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return CategoriaService().create(uow, data)

@cat_router.put("/{id}", response_model=CategoriaRead, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def update_categoria(id: int, data: CategoriaUpdate, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return CategoriaService().update(uow, id, data)

@cat_router.delete("/{id}", status_code=204, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def delete_categoria(id: int, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        CategoriaService().delete(uow, id)


# ── Productos ─────────────────────────────────────────────────────────────────

prod_router = APIRouter(prefix="/productos", tags=["Productos"])

@prod_router.get("/")
def list_productos(
    skip: int = 0, limit: int = 20,
    search: Optional[str] = None, disponible: Optional[bool] = None,
    uow: UnitOfWork = Depends(get_uow)
):
    with uow:
        return ProductoService().get_all(uow, skip, limit, search, disponible)

@prod_router.get("/{id}")
def get_producto(id: int, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return ProductoService().get_by_id(uow, id)

@prod_router.post("/", response_model=ProductoRead, status_code=201, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def create_producto(data: ProductoCreate, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return ProductoService().create(uow, data)

@prod_router.put("/{id}", response_model=ProductoRead, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def update_producto(id: int, data: ProductoUpdate, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return ProductoService().update(uow, id, data)

@prod_router.patch("/{id}/disponibilidad", response_model=ProductoRead, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def toggle_disponibilidad(id: int, disponible: bool, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return ProductoService().toggle_disponible(uow, id, disponible)

@prod_router.delete("/{id}", status_code=204, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def delete_producto(id: int, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        ProductoService().delete(uow, id)


# ── Insumos (Ingredientes) ─────────────────────────────────────────────────────

insumos_router = APIRouter(prefix="/insumos", tags=["Insumos"])

@insumos_router.get("/")
def list_insumos(
    skip: int = Query(0, ge=0), limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None, uow: UnitOfWork = Depends(get_uow)
):
    from features.catalog.service_ingrediente import IngredienteService
    with uow:
        return IngredienteService().get_all(uow, skip, limit, search)

@insumos_router.get("/export")
def export_insumos(search: Optional[str] = None, uow: UnitOfWork = Depends(get_uow)):
    from sqlmodel import select
    with uow:
        stmt = select(Ingrediente).where(Ingrediente.deleted_at == None)
        if search:
            stmt = stmt.where(Ingrediente.nombre.ilike(f"%{search}%"))
        items = uow.session.exec(stmt).all()

    wb = Workbook()
    ws = wb.active
    ws.title = "Insumos"
    ws.append(["ID", "Nombre", "Es Alérgeno", "Fecha Creación"])
    for item in items:
        ws.append([item.id, item.nombre, "Sí" if item.es_alergeno else "No",
                   item.created_at.strftime("%Y-%m-%d %H:%M") if item.created_at else ""])
    stream = io.BytesIO()
    wb.save(stream)
    return Response(
        content=stream.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=insumos.xlsx"}
    )

@insumos_router.post("/", status_code=201, dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def create_insumo(data: dict, uow: UnitOfWork = Depends(get_uow)):
    from features.catalog.service_ingrediente import IngredienteService
    from features.catalog.schemas_ingrediente import IngredienteCreate
    with uow:
        return IngredienteService().create(uow, IngredienteCreate(**data))

@insumos_router.put("/{id}", dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def update_insumo(id: int, data: dict, uow: UnitOfWork = Depends(get_uow)):
    from features.catalog.service_ingrediente import IngredienteService
    from features.catalog.schemas_ingrediente import IngredienteUpdate
    with uow:
        return IngredienteService().update(uow, id, IngredienteUpdate(**data))

@insumos_router.delete("/{id}", dependencies=[Depends(require_role(["ADMIN", "STOCK"]))])
def delete_insumo(id: int, uow: UnitOfWork = Depends(get_uow)):
    from features.catalog.service_ingrediente import IngredienteService
    with uow:
        IngredienteService().soft_delete(uow, id)
    return {"detail": "Insumo dado de baja exitosamente"}


# ── Formas de Pago ────────────────────────────────────────────────────────────

formas_pago_router = APIRouter(prefix="/formas-pago", tags=["Formas de Pago"])

@formas_pago_router.get("/")
def list_formas_pago(uow: UnitOfWork = Depends(get_uow)):
    from sqlmodel import select
    with uow:
        return uow.session.exec(select(FormaPago).where(FormaPago.habilitado == True)).all()
