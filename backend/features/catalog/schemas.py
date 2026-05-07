from typing import Optional, List
from sqlmodel import SQLModel
from datetime import datetime


# ── Categoria ─────────────────────────────────────────────────────────────────

class CategoriaBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None

class CategoriaCreate(CategoriaBase): pass
class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None

class CategoriaRead(CategoriaBase):
    id: int


# ── Producto ──────────────────────────────────────────────────────────────────

class IngredienteSimple(SQLModel):
    id: int
    nombre: str
    es_alergeno: bool
    es_removible: bool = True

class ProductoBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_base: float
    imagen_url: Optional[str] = None
    stock_cantidad: int = 0
    disponible: bool = True

class ProductoCreate(ProductoBase):
    categoria_ids: List[int] = []
    ingrediente_ids: List[int] = []

class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_base: Optional[float] = None
    imagen_url: Optional[str] = None
    stock_cantidad: Optional[int] = None
    disponible: Optional[bool] = None
    categoria_ids: Optional[List[int]] = None

class ProductoRead(ProductoBase):
    id: int
    created_at: datetime

class ProductoDetail(ProductoRead):
    ingredientes: List[IngredienteSimple] = []
    categoria_ids: List[int] = []


# ── Stock ──────────────────────────────────────────────────────────────────────

class StockUpdate(SQLModel):
    stock_cantidad: Optional[int] = None
    disponible: Optional[bool] = None
