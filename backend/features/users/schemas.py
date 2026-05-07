from sqlmodel import SQLModel

class UsuarioRead(SQLModel):
    id: int
    nombre: str
    apellido: str
    email: str
    celular: str | None = None

class UsuarioCreate(SQLModel):
    nombre: str
    apellido: str
    email: str
    password: str
    celular: str | None = None
