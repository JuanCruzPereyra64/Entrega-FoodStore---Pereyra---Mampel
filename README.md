# 🍔 Food Store v5.0

Sistema de Gestión de Pedidos de Comida — Trabajo Práctico Integrador (Programación 4, TUP)

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | CSS Glassmorphism personalizado |
| Estado | Zustand + TanStack Query |
| Backend | FastAPI + SQLModel |
| Base de Datos | PostgreSQL 15 |
| ORM / Migraciones | SQLModel + Alembic |
| Contenedores | Docker + Docker Compose |

## Cómo levantar el proyecto

### Opción 1 (Recomendada) — Docker Compose

```bash
# Clonar el repositorio
git clone https://github.com/JuanCruzPereyra64/Analisis-de-Datos-TPs.git
cd "Prog 4 - Pereyra - Mampel"

# Copiar variables de entorno
cp .env.example .env

# Levantar toda la infraestructura
docker-compose up --build
```

Luego abrir:
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/api/v1/docs

### Opción 2 — Manual

**Backend:**
```bash
cd backend
pip install -r requirements.txt
# Configurar .env con DATABASE_URL apuntando a tu Postgres local
alembic upgrade head
python seed/run_seed.py
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Credenciales por defecto

| Campo | Valor |
|---|---|
| Email | admin@foodstore.com |
| Contraseña | admin123 |

> ⚠️ Cambiar la contraseña en producción.

## Variables de entorno

Ver `.env.example` para la lista completa.

## Arquitectura

```
Router → Service → UoW → Repository → Model
```

Patrón **Unit of Work**: garantiza atomicidad transaccional. El Service nunca llama `session.commit()` directamente.

## Módulos implementados

- **Auth**: Login, Registro, JWT, Roles (ADMIN, STOCK, PEDIDOS, CLIENT)
- **Catálogo**: Categorías, Productos, Ingredientes (Insumos) con baja lógica
- **Pedidos**: Creación, Máquina de Estados (6 estados), Historial de trazabilidad
- **Admin**: Dashboard con KPIs + recharts, CRUD Productos, Gestión de Stock
- **Export**: Exportación de Insumos a Excel (openpyxl)

## Patrones aplicados

- Repository Pattern + BaseRepository[T] genérico
- Unit of Work para transacciones atómicas
- Soft Delete (`deleted_at TIMESTAMPTZ`)
- Snapshot Pattern en DetallePedido
- Audit Trail append-only en HistorialEstadoPedido
- State Machine validada en capa de servicio
- Feature-Sliced Design en el frontend
- Zustand (4 stores) + TanStack Query

## Estructura del proyecto

```
/
├── backend/
│   ├── features/
│   │   ├── auth/       # Login, Registro, JWT
│   │   ├── users/      # Usuarios, Roles
│   │   ├── catalog/    # Productos, Categorías, Insumos
│   │   ├── orders/     # Pedidos, Historial, Pagos
│   │   └── admin/      # Dashboard, Stock
│   ├── core/           # Config, Security, Database
│   ├── shared/         # UoW, BaseRepository
│   ├── migrations/     # Alembic
│   └── seed/           # Datos iniciales
├── frontend/
│   └── src/
│       ├── app/        # Router principal
│       ├── pages/      # Vistas por ruta
│       ├── features/   # Componentes de dominio
│       ├── widgets/    # Layout
│       └── shared/     # API, Stores, Utils
├── docker-compose.yml
└── README.md
```
