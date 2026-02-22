import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..models import Role
from ..schemas import (
    CreateUserRequest,
    MapMentorRequest,
    MapMentorResponse,
    MentorMenteeMappingResponse,
    ResourceResponse,
    SessionRecordResponse,
    UserResponse,
)
from ..security import require_roles

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles(Role.ADMIN))],
)


def _upload_dir() -> Path:
    default_dir = Path(__file__).resolve().parent.parent / "uploads"
    path = Path(os.getenv("UPLOAD_DIR", str(default_dir)))
    path.mkdir(parents=True, exist_ok=True)
    return path


def _mapping_response(db: Session, mapping) -> MentorMenteeMappingResponse:
    mentor = crud.get_user_by_id(db, mapping.mentor_id)
    mentee = crud.get_user_by_id(db, mapping.mentee_id)
    return MentorMenteeMappingResponse(
        mentor_id=mapping.mentor_id,
        mentee_id=mapping.mentee_id,
        mentor_name=mentor.name if mentor else "Unknown",
        mentee_name=mentee.name if mentee else "Unknown",
    )


def _session_response(db: Session, session) -> SessionRecordResponse:
    mentor = crud.get_user_by_id(db, session.mentor_id)
    mentee = crud.get_user_by_id(db, session.mentee_id)
    return SessionRecordResponse(
        id=session.id,
        mentor_name=mentor.name if mentor else "Unknown",
        mentee_name=mentee.name if mentee else "Unknown",
        date=session.date,
        fluency_score=session.fluency_score,
        confidence_score=session.confidence_score,
        notes=session.notes,
        next_steps=session.next_steps,
    )


@router.post("/users", response_model=UserResponse)
def create_user(payload: CreateUserRequest, db: Session = Depends(get_db)):
    if payload.role not in (Role.MENTOR, Role.MENTEE):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only mentor or mentee can be created from admin panel",
        )
    user = crud.create_user(db, payload.name, payload.role, payload.password)
    return UserResponse(id=user.id, name=user.name, role=user.role)


@router.get("/mentors", response_model=list[UserResponse])
def list_mentors(db: Session = Depends(get_db)):
    users = crud.get_users_by_role(db, Role.MENTOR)
    return [UserResponse(id=u.id, name=u.name, role=u.role) for u in users]


@router.get("/mentees", response_model=list[UserResponse])
def list_mentees(db: Session = Depends(get_db)):
    users = crud.get_users_by_role(db, Role.MENTEE)
    return [UserResponse(id=u.id, name=u.name, role=u.role) for u in users]


@router.post("/map-mentor", response_model=MapMentorResponse)
def map_mentor(payload: MapMentorRequest, db: Session = Depends(get_db)):
    mapping = crud.map_mentor_to_mentee(db, payload.mentor_id, payload.mentee_id)
    return MapMentorResponse(
        message="Mentor mapped to mentee successfully",
        mentor_id=mapping.mentor_id,
        mentee_id=mapping.mentee_id,
    )


@router.get("/mappings", response_model=list[MentorMenteeMappingResponse])
def get_mappings(db: Session = Depends(get_db)):
    mappings = crud.list_mappings(db)
    return [_mapping_response(db, mapping) for mapping in mappings]


@router.post("/resources", response_model=ResourceResponse)
async def create_resource(
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are allowed")
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file content type")

    unique_name = f"{uuid4().hex}.pdf"
    dest_path = _upload_dir() / unique_name
    content = await file.read()
    dest_path.write_bytes(content)

    resource = crud.create_resource(db, title=title, url=f"/uploads/{unique_name}")
    return resource


@router.get("/resources", response_model=list[ResourceResponse])
def get_resources(db: Session = Depends(get_db)):
    return crud.list_resources(db)


@router.get("/sessions", response_model=list[SessionRecordResponse])
def get_sessions(db: Session = Depends(get_db)):
    sessions = crud.list_session_records(db)
    return [_session_response(db, session) for session in sessions]
