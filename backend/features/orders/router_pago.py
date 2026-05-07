from fastapi import APIRouter, Depends
from shared.uow.unit_of_work import UnitOfWork
from features.orders.service_pago import PagoService
from features.orders.schemas import PagoCreateRequest, PagoResponse
from core.dependencies import get_current_user
from features.users.models import Usuario

router = APIRouter(prefix="/pagos", tags=["Pagos"])

def get_uow():
    return UnitOfWork()

@router.post("/procesar", response_model=PagoResponse)
def procesar_pago(
    data: PagoCreateRequest, 
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user)
):
    with uow:
        return PagoService().procesar_pago(uow, data, current_user.id)

@router.post("/webhook")
def mp_webhook(data: dict, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        return PagoService().webhook(uow, data)
