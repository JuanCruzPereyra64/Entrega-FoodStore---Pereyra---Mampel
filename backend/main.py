from fastapi import FastAPI, Request
from core.config import settings
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to Food Store v5.0 API"}

from features.auth.router import router as auth_router
from features.users.router import router as users_router
from features.catalog.router import cat_router, prod_router, insumos_router, formas_pago_router
from features.orders.router import router as orders_router
from features.admin.router import router as admin_router

PREFIX = settings.API_V1_STR

app.include_router(auth_router, prefix=PREFIX)
app.include_router(users_router, prefix=PREFIX)
app.include_router(cat_router, prefix=PREFIX)
app.include_router(prod_router, prefix=PREFIX)
app.include_router(insumos_router, prefix=PREFIX)
app.include_router(formas_pago_router, prefix=PREFIX)
app.include_router(orders_router, prefix=PREFIX)
app.include_router(admin_router, prefix=PREFIX)

