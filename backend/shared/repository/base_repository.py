from typing import Generic, TypeVar, Type, Optional, List, Any
from sqlmodel import SQLModel, select
from sqlalchemy.orm import Session
from datetime import datetime, timezone

ModelType = TypeVar("ModelType", bound=SQLModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], session: Session):
        self.model = model
        self.session = session

    def get(self, id: Any) -> Optional[ModelType]:
        stmt = select(self.model).where(self.model.id == id)
        # Check if the model has a deleted_at column for soft delete
        if hasattr(self.model, "deleted_at"):
            stmt = stmt.where(self.model.deleted_at == None)
        return self.session.exec(stmt).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        stmt = select(self.model).offset(skip).limit(limit)
        if hasattr(self.model, "deleted_at"):
            stmt = stmt.where(self.model.deleted_at == None)
        return self.session.exec(stmt).all()

    def add(self, obj: ModelType) -> ModelType:
        self.session.add(obj)
        return obj

    def update(self, obj: ModelType) -> ModelType:
        # Note: In UoW pattern, simply modifying the loaded object and committing the UoW is usually enough,
        # but having an explicit update method is good practice.
        if hasattr(obj, "updated_at"):
            obj.updated_at = datetime.now(timezone.utc)
        self.session.add(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        if hasattr(obj, "deleted_at"):
            # Soft delete
            obj.deleted_at = datetime.now(timezone.utc)
            self.session.add(obj)
        else:
            # Hard delete
            self.session.delete(obj)
