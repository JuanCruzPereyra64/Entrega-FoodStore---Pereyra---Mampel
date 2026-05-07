from typing import Optional, List
from sqlmodel import SQLModel
from datetime import datetime


# ── Pedidos ───────────────────────────────────────────────────────────────────

class ItemPedidoRequest(SQLModel):
    producto_id: int
    cantidad: int
    personalizacion: Optional[List[int]] = None

class CrearPedidoRequest(SQLModel):
    items: List[ItemPedidoRequest]
    forma_pago_codigo: str
    direccion_id: Optional[int] = None
    notas: Optional[str] = None

class AvanzarEstadoRequest(SQLModel):
    nuevo_estado: str
    motivo: Optional[str] = None

class DetallePedidoRead(SQLModel):
    id: int
    producto_id: int
    nombre_snapshot: str
    precio_snapshot: float
    cantidad: int

class HistorialEstadoRead(SQLModel):
    id: int
    estado_desde: Optional[str]
    estado_hacia: str
    motivo: Optional[str]
    created_at: datetime

class PedidoRead(SQLModel):
    id: int
    estado_codigo: str
    total: float
    subtotal: float
    costo_envio: float
    descuento: float
    forma_pago_codigo: str
    created_at: datetime

class PedidoDetail(PedidoRead):
    notas: Optional[str]
    detalles: List[DetallePedidoRead] = []
    historial: List[HistorialEstadoRead] = []


# ── Pagos ─────────────────────────────────────────────────────────────────────

class PagoCreateRequest(SQLModel):
    pedido_id: int
    card_token: str
    payment_method_id: str
    installments: int = 1

class PagoResponse(SQLModel):
    id: Optional[int] = None
    status: str
    status_detail: Optional[str] = None
    transaction_amount: float
    payment_method_id: Optional[str] = None
