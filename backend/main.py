import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from . import crud
from .database import Base, SessionLocal, engine
from .models import Role, User
from .routes import admin, auth, mentee, mentor

app = FastAPI(title="Mentor Connect API")
default_upload_dir = Path(__file__).resolve().parent / "uploads"
upload_dir = Path(os.getenv("UPLOAD_DIR", str(default_upload_dir)))
upload_dir.mkdir(parents=True, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_default_users()


def seed_default_users():
    db: Session = SessionLocal()
    try:
        defaults = [
            ("Admin", Role.ADMIN, "admin123"),
            ("Mentor", Role.MENTOR, "mentor123"),
            ("Mentee", Role.MENTEE, "mentee123"),
        ]
        for name, role, password in defaults:
            existing = db.query(User).filter(User.name == name, User.role == role).first()
            if not existing:
                crud.create_user(db, name=name, role=role, password=password)
    finally:
        db.close()


app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(mentor.router)
app.include_router(mentee.router)
