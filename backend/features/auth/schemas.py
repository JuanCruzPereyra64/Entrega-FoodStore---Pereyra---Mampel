from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str | None = None

class Login(BaseModel):
    email: str
    password: str

class Register(BaseModel):
    nombre: str
    apellido: str
    email: str
    password: str
    celular: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str
    celular: Optional[str] = None
    roles: List[str] = []
    created_at: Optional[datetime] = None
