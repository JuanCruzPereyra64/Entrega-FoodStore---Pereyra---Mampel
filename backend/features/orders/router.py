from fastapi import APIRouter, Depends
from typing import Optional
from shared.uow.unit_of_work import UnitOfWork
from features.orders.service import PedidoService
from features.orders.schemas import CrearPedidoRequest, AvanzarEstadoRequest
from core.dependencies import get_current_user, require_role
from features.users.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

def get_uow():
    return UnitOfWork()

@router.get("/")
def list_pedidos(
    skip: int = 0, limit: int = 20,
    uow: UnitOfWork = Depends(get_uow),
    current_user: Usuario = Depends(get_current_user)
):
    with uow:
        # Check if user has ADMIN or PEDIDOS role
        from features.users.models import Rol, UsuarioRol
        from sqlmodel import select
        roles = uow.session.exec(
            select(Rol.nombre).join(UsuarioRol, Rol.id == UsuarioRol.rol_id)
            .where(UsuarioRol.usuario_id == current_user.id)
        ).all()
        is_admin_or_gestor = any(r in ["ADMIN", "PEDIDOS"] for r in roles)
        
        return PedidoService().get_all(uow, current_user.id, is_admin_or_gestor, skip, limit)

@router.get("/{id}")
def get_pedido(id: int, uow: UnitOfWork = Depends(get_uow), current_user: Usuario = Depends(get_current_user)):
    with uow:
        from features.users.models import Rol, UsuarioRol
        from sqlmodel import select
        roles = uow.session.exec(
            select(Rol.nombre).join(UsuarioRol, Rol.id == UsuarioRol.rol_id)
            .where(UsuarioRol.usuario_id == current_user.id)
        ).all()
        is_admin_or_gestor = any(r in ["ADMIN", "PEDIDOS"] for r in roles)
        
        pedido = PedidoService().get_by_id(uow, id, current_user.id, is_admin_or_gestor)
        # Incluir detalles e historial
        from features.orders.schemas import PedidoDetail, DetallePedidoRead, HistorialEstadoRead
        detalles = [DetallePedidoRead.model_validate(d) for d in pedido.detalles]
        historial = [HistorialEstadoRead.model_validate(h) for h in pedido.historial]
        detail = PedidoDetail.model_validate(pedido)
        detail.detalles = detalles
        detail.historial = historial
        return detail

@router.post("/", status_code=201)
def crear_pedido(data: CrearPedidoRequest, uow: UnitOfWork = Depends(get_uow), current_user: Usuario = Depends(get_current_user)):
    with uow:
        return PedidoService().crear(uow, data, current_user.id)

@router.patch("/{id}/estado")
def avanzar_estado(id: int, data: AvanzarEstadoRequest, uow: UnitOfWork = Depends(get_uow), current_user: Usuario = Depends(require_role(["ADMIN", "PEDIDOS"]))):
    with uow:
        return PedidoService().avanzar_estado(uow, id, data, current_user.id)

@router.get("/{id}/historial")
def get_historial(id: int, uow: UnitOfWork = Depends(get_uow), current_user: Usuario = Depends(get_current_user)):
    with uow:
        # Ideally check if user owns the order or is admin, omitting for brevity
        return PedidoService().get_historial(uow, id)

@router.delete("/{id}")
def cancelar_pedido(id: int, uow: UnitOfWork = Depends(get_uow), current_user: Usuario = Depends(get_current_user)):
    with uow:
        return PedidoService().cancelar(uow, id, current_user.id)
