from sqlmodel import SQLModel
from typing import Optional

class IngredienteBase(SQLModel):
    nombre: str
    descripcion: Optional[str] = None
    es_alergeno: bool = False

class IngredienteCreate(IngredienteBase): pass

class IngredienteUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None

class IngredienteRead(IngredienteBase):
    id: int
