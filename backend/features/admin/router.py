from fastapi import APIRouter, Depends
from shared.uow.unit_of_work import UnitOfWork
from sqlmodel import select, func
from features.users.models import Usuario, Rol, UsuarioRol
from features.catalog.models import Producto
from features.orders.models import Pedido, DetallePedido
from datetime import datetime, timezone, timedelta
from core.dependencies import require_role

# Apply require_role to the entire router
router = APIRouter(
    prefix="/admin", 
    tags=["Admin"],
    dependencies=[Depends(require_role(["ADMIN", "STOCK", "PEDIDOS"]))]
)

def get_uow():
    return UnitOfWork()


@router.get("/dashboard")
def get_dashboard(uow: UnitOfWork = Depends(get_uow)):
    with uow:
        hoy = datetime.now(timezone.utc).date()
        inicio_hoy = datetime(hoy.year, hoy.month, hoy.day, tzinfo=timezone.utc)

        # Pedidos de hoy
        pedidos_hoy = uow.session.exec(
            select(func.count(Pedido.id)).where(Pedido.created_at >= inicio_hoy)
        ).one() or 0

        # Ingresos de hoy
        ingresos_hoy = uow.session.exec(
            select(func.sum(Pedido.total)).where(
                Pedido.created_at >= inicio_hoy,
                Pedido.estado_codigo != "CANCELADO"
            )
        ).one() or 0.0

        # Productos activos
        productos_activos = uow.session.exec(
            select(func.count(Producto.id)).where(
                Producto.deleted_at == None, Producto.disponible == True
            )
        ).one() or 0

        # Usuarios activos
        usuarios_activos = uow.session.exec(
            select(func.count(Usuario.id)).where(Usuario.deleted_at == None)
        ).one() or 0

        # Pedidos por estado
        pedidos_por_estado_rows = uow.session.exec(
            select(Pedido.estado_codigo, func.count(Pedido.id))
            .group_by(Pedido.estado_codigo)
        ).all()
        pedidos_por_estado = {row[0]: row[1] for row in pedidos_por_estado_rows}

        # Últimos 10 pedidos
        ultimos = uow.session.exec(
            select(Pedido).order_by(Pedido.created_at.desc()).limit(10)
        ).all()
        ultimos_pedidos = [
            {"id": p.id, "total": float(p.total), "estado": p.estado_codigo,
             "created_at": p.created_at.isoformat()}
            for p in ultimos
        ]

        return {
            "pedidos_hoy": pedidos_hoy,
            "ingresos_hoy": float(ingresos_hoy),
            "productos_activos": productos_activos,
            "usuarios_activos": usuarios_activos,
            "pedidos_por_estado": pedidos_por_estado,
            "ultimos_pedidos": ultimos_pedidos,
        }


@router.get("/usuarios")
def list_usuarios(skip: int = 0, limit: int = 20, uow: UnitOfWork = Depends(get_uow)):
    with uow:
        users = uow.session.exec(
            select(Usuario).where(Usuario.deleted_at == None).offset(skip).limit(limit)
        ).all()
        total = uow.session.exec(
            select(func.count(Usuario.id)).where(Usuario.deleted_at == None)
        ).one()
        result = []
        for u in users:
            roles = uow.session.exec(
                select(Rol).join(UsuarioRol, Rol.id == UsuarioRol.rol_id)
                .where(UsuarioRol.usuario_id == u.id)
            ).all()
            result.append({
                "id": u.id, "nombre": u.nombre, "apellido": u.apellido,
                "email": u.email, "celular": u.celular,
                "roles": [r.nombre for r in roles],
                "created_at": u.created_at.isoformat() if u.created_at else None
            })
        return {"items": result, "total": total, "skip": skip, "limit": limit}


@router.get("/stock")
def get_stock(uow: UnitOfWork = Depends(get_uow)):
    with uow:
        products = uow.session.exec(
            select(Producto).where(Producto.deleted_at == None)
        ).all()
        return [
            {"id": p.id, "nombre": p.nombre, "stock_cantidad": p.stock_cantidad,
             "disponible": p.disponible, "precio_base": float(p.precio_base)}
            for p in products
        ]


@router.patch("/stock/{id}")
def update_stock(id: int, data: dict, uow: UnitOfWork = Depends(get_uow)):
    from features.catalog.service import ProductoService
    with uow:
        svc = ProductoService()
        prod = None
        if "stock_cantidad" in data:
            prod = svc.update_stock(uow, id, data["stock_cantidad"])
        if "disponible" in data:
            prod = svc.toggle_disponible(uow, id, data["disponible"])
        return prod
