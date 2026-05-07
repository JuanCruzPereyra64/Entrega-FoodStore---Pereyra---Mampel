import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlmodel import Session, select
from core.database import engine
from features.users.models import Rol, Usuario, UsuarioRol
from features.catalog.models import FormaPago, Ingrediente
from features.orders.models import EstadoPedido
from core.security import get_password_hash
from datetime import datetime, timezone


def run_seed():
    with Session(engine) as session:
        # ── 1. Roles ──────────────────────────────────────────────────
        roles_data = [
            {"nombre": "ADMIN", "descripcion": "Administrador del sistema"},
            {"nombre": "STOCK", "descripcion": "Gestor de Stock"},
            {"nombre": "PEDIDOS", "descripcion": "Gestor de Pedidos"},
            {"nombre": "CLIENT", "descripcion": "Cliente"},
        ]
        for r in roles_data:
            if not session.exec(select(Rol).where(Rol.nombre == r["nombre"])).first():
                session.add(Rol(**r))
        session.commit()

        # ── 2. Estados de Pedido ──────────────────────────────────────
        estados_data = [
            {"codigo": "PENDIENTE",   "descripcion": "Pedido creado, pago pendiente",     "orden": 1, "es_terminal": False},
            {"codigo": "CONFIRMADO",  "descripcion": "Pago procesado y confirmado",        "orden": 2, "es_terminal": False},
            {"codigo": "EN_PREP",     "descripcion": "En preparación en cocina",           "orden": 3, "es_terminal": False},
            {"codigo": "EN_CAMINO",   "descripcion": "Despachado al cliente",              "orden": 4, "es_terminal": False},
            {"codigo": "ENTREGADO",   "descripcion": "Entrega confirmada",                 "orden": 5, "es_terminal": True},
            {"codigo": "CANCELADO",   "descripcion": "Pedido cancelado",                   "orden": 6, "es_terminal": True},
        ]
        for e in estados_data:
            if not session.exec(select(EstadoPedido).where(EstadoPedido.codigo == e["codigo"])).first():
                session.add(EstadoPedido(**e))
        session.commit()

        # ── 3. Formas de Pago ─────────────────────────────────────────
        formas_pago_data = [
            {"codigo": "MERCADOPAGO",   "descripcion": "MercadoPago",   "habilitado": True},
            {"codigo": "EFECTIVO",      "descripcion": "Efectivo",       "habilitado": True},
            {"codigo": "TRANSFERENCIA", "descripcion": "Transferencia",  "habilitado": True},
        ]
        for f in formas_pago_data:
            if not session.exec(select(FormaPago).where(FormaPago.codigo == f["codigo"])).first():
                session.add(FormaPago(**f))
        session.commit()

        # ── 4. Ingredientes de muestra ────────────────────────────────
        ingredientes_data = [
            {"nombre": "Lechuga", "es_alergeno": False},
            {"nombre": "Tomate", "es_alergeno": False},
            {"nombre": "Queso Cheddar", "es_alergeno": True},
            {"nombre": "Cebolla", "es_alergeno": False},
            {"nombre": "Pepino", "es_alergeno": False},
            {"nombre": "Maíz", "es_alergeno": True},
            {"nombre": "Jamón", "es_alergeno": False},
            {"nombre": "Maionesa", "es_alergeno": True},
        ]
        for ing in ingredientes_data:
            if not session.exec(select(Ingrediente).where(Ingrediente.nombre == ing["nombre"])).first():
                session.add(Ingrediente(**ing))
        session.commit()

        # ── 5. Usuario Admin ──────────────────────────────────────────
        admin_email = "admin@foodstore.com"
        admin = session.exec(select(Usuario).where(Usuario.email == admin_email)).first()
        if not admin:
            admin = Usuario(
                nombre="Admin",
                apellido="System",
                email=admin_email,
                celular="1234567890",
                password_hash=get_password_hash("admin123"),
            )
            session.add(admin)
            session.commit()
            session.refresh(admin)

            # Asignar rol ADMIN
            admin_rol = session.exec(select(Rol).where(Rol.nombre == "ADMIN")).first()
            session.add(UsuarioRol(usuario_id=admin.id, rol_id=admin_rol.id))
            session.commit()

        # ── 6. Usuario Cliente (para pruebas) ─────────────────────────
        client_email = "cliente@foodstore.com"
        cliente = session.exec(select(Usuario).where(Usuario.email == client_email)).first()
        if not cliente:
            cliente = Usuario(
                nombre="Juan",
                apellido="Perez",
                email=client_email,
                celular="1122334455",
                password_hash=get_password_hash("cliente123"),
            )
            session.add(cliente)
            session.commit()
            session.refresh(cliente)

            # Asignar rol CLIENT
            client_rol = session.exec(select(Rol).where(Rol.nombre == "CLIENT")).first()
            session.add(UsuarioRol(usuario_id=cliente.id, rol_id=client_rol.id))
            session.commit()

        print("✅ Seed completado exitosamente.")
        print(f"   👑 Admin:   admin@foodstore.com   / admin123")
        print(f"   👤 Cliente: cliente@foodstore.com / cliente123")


run_seed()
