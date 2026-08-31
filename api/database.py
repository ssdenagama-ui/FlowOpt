from sqlalchemy import (
    create_engine, Column, Integer,
    String, Float, DateTime, Boolean
)
from sqlalchemy.ext.declarative import (
    declarative_base)
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__))
DB_PATH = os.path.join(
    BASE_DIR, '..', 'flowopt.db')

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# ── User table ────────────────────────
class User(Base):
    __tablename__ = "users"

    id       = Column(Integer,
                 primary_key=True,
                 index=True)
    username = Column(String,
                 unique=True,
                 index=True,
                 nullable=False)
    password = Column(String,
                 nullable=False)
    name     = Column(String,
                 nullable=False)
    email    = Column(String,
                 default='')
    role     = Column(String,
                 default='viewer')
    is_active= Column(Boolean,
                 default=True)
    created_at = Column(DateTime,
                 default=datetime.utcnow)

# ── Hospital data table ───────────────
class HospitalData(Base):
    __tablename__ = "hospital_data"

    id      = Column(Integer,
                primary_key=True,
                index=True)
    year    = Column(Integer,
                unique=True,
                nullable=False)
    inpat   = Column(Float)
    disc    = Column(Float)
    death_t = Column(Float)
    bor     = Column(Float)
    ados    = Column(Float)
    opd     = Column(Float)
    beds    = Column(Float)
    added_by= Column(String,
                default='system')
    added_at= Column(DateTime,
                default=datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(
        bind=engine)