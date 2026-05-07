import mercadopago
from fastapi import HTTPException
from sqlmodel import select
from core.config import settings
from shared.uow.unit_of_work import UnitOfWork
from features.orders.models import Pedido, Pago, HistorialEstadoPedido
from features.orders.schemas import PagoCreateRequest, PagoResponse
from datetime import datetime, timezone
import uuid

class PagoService:
    def __init__(self):
        self.sdk = mercadopago.SDK(settings.MP_ACCESS_TOKEN)

    def procesar_pago(self, uow: UnitOfWork, data: PagoCreateRequest, usuario_id: int) -> PagoResponse:
        pedido = uow.session.get(Pedido, data.pedido_id)
        if not pedido:
            raise HTTPException(404, "Pedido no encontrado")
        
        if pedido.usuario_id != usuario_id:
            raise HTTPException(403, "Acceso denegado")
            
        if pedido.estado_codigo != "PENDIENTE":
            raise HTTPException(400, "El pedido ya fue procesado o cancelado")

        idempotency_key = str(uuid.uuid4())
        
        payment_data = {
            "transaction_amount": float(pedido.total),
            "token": data.card_token,
            "description": f"Pedido #{pedido.id} - Food Store",
            "installments": data.installments,
            "payment_method_id": data.payment_method_id,
            "payer": {
                "email": "test_user_123@testuser.com", # En producción usar email real
            },
            "external_reference": str(pedido.id)
        }

        payment_response = self.sdk.payment().create(payment_data, {"X-Idempotency-Key": idempotency_key})
        payment = payment_response["response"]

        if payment_response["status"] >= 400:
            raise HTTPException(400, f"Error en MercadoPago: {payment.get('message', 'Desconocido')}")

        # Guardar registro de pago
        pago_db = Pago(
            pedido_id=pedido.id,
            mp_payment_id=payment.get("id"),
            mp_status=payment.get("status"),
            mp_status_detail=payment.get("status_detail"),
            external_reference=str(pedido.id),
            idempotency_key=idempotency_key,
            transaction_amount=pedido.total,
            payment_method_id=data.payment_method_id
        )
        uow.session.add(pago_db)

        # Si el pago es aprobado, avanzar el pedido
        if payment.get("status") == "approved":
            pedido.estado_codigo = "CONFIRMADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            
            historial = HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde="PENDIENTE",
                estado_hacia="CONFIRMADO",
                usuario_id=usuario_id,
                motivo="Pago aprobado por MercadoPago"
            )
            uow.session.add(historial)

        uow.session.flush()
        uow.session.refresh(pago_db)

        return PagoResponse(
            id=pago_db.id,
            status=pago_db.mp_status,
            status_detail=pago_db.mp_status_detail,
            transaction_amount=float(pago_db.transaction_amount),
            payment_method_id=pago_db.payment_method_id
        )

    def webhook(self, uow: UnitOfWork, data: dict):
        # Implementar lógica de IPN/Webhook si es necesario para el 10/10
        # Por ahora lo dejamos simplificado para que funcione el flujo directo
        pass
