from typing import Optional, List
from sqlmodel import SQLModel
from datetime import datetime


class UsuarioRead(SQLModel):
    id: int
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    created_at: datetime
    roles: List[str] = []


class DashboardStats(SQLModel):
    pedidos_hoy: int = 0
    ingresos_hoy: float = 0.0
    productos_activos: int = 0
    usuarios_activos: int = 0
    pedidos_por_estado: dict = {}
    top_productos: List[dict] = []
    ultimos_pedidos: List[dict] = []
