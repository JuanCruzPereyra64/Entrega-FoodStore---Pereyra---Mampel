from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column, String, DateTime, text
from datetime import datetime, timezone
from decimal import Decimal

# Using TYPE_CHECKING is important if we have circular references across different files, 
# but here all identity models are in the same file.

class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuario_rol"
    
    usuario_id: int = Field(foreign_key="usuario.id", primary_key=True)
    rol_id: int = Field(foreign_key="rol.id", primary_key=True)
    expires_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

class Rol(SQLModel, table=True):
    __tablename__ = "rol"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(sa_column=Column(String(50), unique=True, nullable=False))
    descripcion: Optional[str] = Field(default=None)
    
    # Relationships
    usuarios: List["Usuario"] = Relationship(
        back_populates="roles",
        link_model=UsuarioRol
    )

class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direccion_entrega"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False)
    etiqueta: Optional[str] = Field(default=None, sa_column=Column(String(80)))
    linea1: str = Field(nullable=False)
    linea2: Optional[str] = Field(default=None)
    ciudad: str = Field(sa_column=Column(String(100), nullable=False))
    latitud: Optional[Decimal] = Field(default=None, max_digits=9, decimal_places=6)
    longitud: Optional[Decimal] = Field(default=None, max_digits=9, decimal_places=6)
    es_principal: bool = Field(default=False, nullable=False)
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    deleted_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    
    # Relationships
    usuario: Optional["Usuario"] = Relationship(back_populates="direcciones")

class Usuario(SQLModel, table=True):
    __tablename__ = "usuario"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(sa_column=Column(String(80), nullable=False))
    apellido: str = Field(sa_column=Column(String(80), nullable=False))
    email: str = Field(sa_column=Column(String(254), unique=True, nullable=False))
    celular: Optional[str] = Field(default=None, sa_column=Column(String(20)))
    password_hash: str = Field(sa_column=Column(String(60), nullable=False))
    
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    deleted_at: Optional[datetime] = Field(
        default=None,
        sa_column=Column(DateTime(timezone=True))
    )
    
    # Relationships
    roles: List[Rol] = Relationship(
        back_populates="usuarios",
        link_model=UsuarioRol
    )
    direcciones: List[DireccionEntrega] = Relationship(back_populates="usuario")
