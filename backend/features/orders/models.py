from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, Column, String, DateTime, Text, ARRAY, Integer
from datetime import datetime, timezone
from decimal import Decimal


class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estado_pedido"

    codigo: str = Field(sa_column=Column(String(20), primary_key=True))
    descripcion: str = Field(sa_column=Column(String(100), nullable=False))
    orden: int = Field(nullable=False)
    es_terminal: bool = Field(default=False, nullable=False)


class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False)
    estado_codigo: str = Field(foreign_key="estado_pedido.codigo", nullable=False)
    forma_pago_codigo: str = Field(foreign_key="forma_pago.codigo", nullable=False)
    direccion_id: Optional[int] = Field(default=None, foreign_key="direccion_entrega.id")
    notas: Optional[str] = Field(default=None, sa_column=Column(Text))

    subtotal: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    costo_envio: Decimal = Field(default=50, max_digits=10, decimal_places=2)
    descuento: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    total: Decimal = Field(default=0, max_digits=10, decimal_places=2)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    detalles: List["DetallePedido"] = Relationship(back_populates="pedido")
    historial: List["HistorialEstadoPedido"] = Relationship(back_populates="pedido")
    pago: Optional["Pago"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False)
    producto_id: int = Field(foreign_key="producto.id", nullable=False)
    nombre_snapshot: str = Field(sa_column=Column(String(200), nullable=False))
    precio_snapshot: Decimal = Field(max_digits=10, decimal_places=2, nullable=False)
    cantidad: int = Field(nullable=False)

    pedido: Optional[Pedido] = Relationship(back_populates="detalles")


class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historial_estado_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False)
    estado_desde: Optional[str] = Field(default=None, foreign_key="estado_pedido.codigo")
    estado_hacia: str = Field(foreign_key="estado_pedido.codigo", nullable=False)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id")
    motivo: Optional[str] = Field(default=None, sa_column=Column(Text))

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    pedido: Optional[Pedido] = Relationship(back_populates="historial")


class Pago(SQLModel, table=True):
    __tablename__ = "pago"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", unique=True, nullable=False)
    mp_payment_id: Optional[int] = Field(default=None)
    mp_status: str = Field(sa_column=Column(String(30), nullable=False, default="pending"))
    mp_status_detail: Optional[str] = Field(default=None, sa_column=Column(String(100)))
    external_reference: str = Field(sa_column=Column(String(100), nullable=False))
    idempotency_key: str = Field(sa_column=Column(String(100), nullable=False))
    transaction_amount: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    payment_method_id: Optional[str] = Field(default=None, sa_column=Column(String(50)))

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    pedido: Optional[Pedido] = Relationship(back_populates="pago")
