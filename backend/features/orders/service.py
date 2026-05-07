from typing import List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException
from sqlmodel import select
from shared.uow.unit_of_work import UnitOfWork
from features.orders.models import (
    Pedido, DetallePedido, HistorialEstadoPedido, EstadoPedido
)
from features.catalog.models import Producto
from features.orders.schemas import CrearPedidoRequest, AvanzarEstadoRequest

# Mapa de transiciones válidas
TRANSICIONES_VALIDAS = {
    "PENDIENTE":  ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["EN_PREP", "CANCELADO"],
    "EN_PREP":    ["EN_CAMINO", "CANCELADO"],
    "EN_CAMINO":  ["ENTREGADO"],
    "ENTREGADO":  [],
    "CANCELADO":  [],
}


class PedidoService:
    def get_all(self, uow: UnitOfWork, usuario_id: int = None, is_admin: bool = False,
                skip: int = 0, limit: int = 20):
        stmt = select(Pedido)
        if not is_admin and usuario_id:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        from sqlmodel import func
        total = uow.session.exec(select(func.count()).select_from(stmt.subquery())).one()
        items = uow.session.exec(stmt.offset(skip).limit(limit)).all()
        return {"items": items, "total": total, "skip": skip, "limit": limit}

    def get_by_id(self, uow: UnitOfWork, id: int, usuario_id: int = None, is_admin: bool = False):
        pedido = uow.session.get(Pedido, id)
        if not pedido:
            raise HTTPException(404, "Pedido no encontrado")
        if not is_admin and usuario_id and pedido.usuario_id != usuario_id:
            raise HTTPException(403, "Acceso denegado")
        return pedido

    def crear(self, uow: UnitOfWork, data: CrearPedidoRequest, usuario_id: int) -> Pedido:
        if not data.items:
            raise HTTPException(400, "El pedido debe tener al menos un ítem")

        subtotal = 0.0
        items_validos = []
        for item in data.items:
            prod = uow.session.exec(
                select(Producto).where(Producto.id == item.producto_id, Producto.deleted_at == None)
            ).first()
            if not prod:
                raise HTTPException(404, f"Producto {item.producto_id} no encontrado")
            if not prod.disponible:
                raise HTTPException(400, f"Producto '{prod.nombre}' no está disponible")
            items_validos.append((prod, item))
            subtotal += float(prod.precio_base) * item.cantidad

        costo_envio = 50.0
        total = subtotal + costo_envio

        pedido = Pedido(
            usuario_id=usuario_id,
            estado_codigo="PENDIENTE",
            forma_pago_codigo=data.forma_pago_codigo,
            direccion_id=data.direccion_id,
            notas=data.notas,
            subtotal=subtotal,
            costo_envio=costo_envio,
            total=total,
        )
        uow.session.add(pedido)
        uow.session.flush()
        uow.session.refresh(pedido)

        for prod, item in items_validos:
            detalle = DetallePedido(
                pedido_id=pedido.id,
                producto_id=prod.id,
                nombre_snapshot=prod.nombre,
                precio_snapshot=float(prod.precio_base),
                cantidad=item.cantidad,
            )
            uow.session.add(detalle)

        # Historial inicial (RN-02: estado_desde=None)
        historial = HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_desde=None,
            estado_hacia="PENDIENTE",
            usuario_id=usuario_id,
        )
        uow.session.add(historial)
        uow.session.flush()
        return pedido

    def avanzar_estado(self, uow: UnitOfWork, id: int, data: AvanzarEstadoRequest,
                       usuario_id: int) -> Pedido:
        pedido = uow.session.get(Pedido, id)
        if not pedido:
            raise HTTPException(404, "Pedido no encontrado")

        estado_actual = pedido.estado_codigo
        nuevo_estado = data.nuevo_estado

        # RN-01: Validar estado terminal
        estado_obj = uow.session.exec(
            select(EstadoPedido).where(EstadoPedido.codigo == estado_actual)
        ).first()
        if estado_obj and estado_obj.es_terminal:
            raise HTTPException(400, f"El estado '{estado_actual}' es terminal, no permite transiciones")

        # Validar transición permitida
        permitidos = TRANSICIONES_VALIDAS.get(estado_actual, [])
        if nuevo_estado not in permitidos:
            raise HTTPException(400, f"Transición de '{estado_actual}' a '{nuevo_estado}' no permitida")

        if nuevo_estado == "CANCELADO" and not data.motivo:
            raise HTTPException(400, "El motivo es obligatorio al cancelar un pedido")

        # Actualizar pedido
        estado_anterior = pedido.estado_codigo
        pedido.estado_codigo = nuevo_estado
        pedido.updated_at = datetime.now(timezone.utc)
        uow.session.add(pedido)

        # Historial append-only (RN-03)
        historial = HistorialEstadoPedido(
            pedido_id=pedido.id,
            estado_desde=estado_anterior,
            estado_hacia=nuevo_estado,
            usuario_id=usuario_id,
            motivo=data.motivo,
        )
        uow.session.add(historial)
        uow.session.flush()
        uow.session.refresh(pedido)
        return pedido

    def get_historial(self, uow: UnitOfWork, pedido_id: int):
        return uow.session.exec(
            select(HistorialEstadoPedido)
            .where(HistorialEstadoPedido.pedido_id == pedido_id)
            .order_by(HistorialEstadoPedido.created_at.asc())
        ).all()

    def cancelar(self, uow: UnitOfWork, id: int, usuario_id: int) -> Pedido:
        pedido = uow.session.get(Pedido, id)
        if not pedido:
            raise HTTPException(404, "Pedido no encontrado")
        if pedido.usuario_id != usuario_id:
            raise HTTPException(403, "No es tu pedido")
        if pedido.estado_codigo not in ["PENDIENTE", "CONFIRMADO"]:
            raise HTTPException(400, "Solo se pueden cancelar pedidos en estado PENDIENTE o CONFIRMADO")

        return self.avanzar_estado(uow, id, AvanzarEstadoRequest(
            nuevo_estado="CANCELADO", motivo="Cancelado por el cliente"
        ), usuario_id)
