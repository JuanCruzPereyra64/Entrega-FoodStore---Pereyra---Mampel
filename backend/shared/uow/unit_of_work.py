from sqlmodel import Session
from core.database import engine

class UnitOfWork:
    def __init__(self):
        self.session: Session = None

    def __enter__(self):
        self.session = Session(engine)
        return self

    def __exit__(self, exc_type, exc_val, traceback):
        if exc_type is not None:
            self.session.rollback()
        else:
            self.session.commit()
        self.session.close()

    def commit(self):
        self.session.commit()

    def rollback(self):
        self.session.rollback()

