from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..models import Role, User
from ..schemas import (
    MeetLinkResponse,
    MeetLinkUpdateRequest,
    SessionRecordCreateRequest,
    SessionRecordResponse,
    TodoCreateRequest,
    TodoResponse,
    UserResponse,
)
from ..security import require_roles

router = APIRouter(prefix="/mentor", tags=["mentor"])


def _mentor_user(current_user: User = Depends(require_roles(Role.MENTOR))) -> User:
    return current_user


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


@router.get("/{mentor_id}/mentees", response_model=list[UserResponse])
def get_mentees(
    mentor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentor_user),
):
    if current_user.id != mentor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden mentor scope")
    mentees = crud.get_assigned_mentees(db, mentor_id)
    return [UserResponse(id=mentee.id, name=mentee.name, role=mentee.role) for mentee in mentees]


@router.put("/{mentor_id}/meet-link", response_model=MeetLinkResponse)
def set_meet_link(
    mentor_id: int,
    payload: MeetLinkUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentor_user),
):
    if current_user.id != mentor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden mentor scope")
    mentor = crud.set_mentor_meet_link(db, mentor_id, payload.meet_link)
    return MeetLinkResponse(meet_link=mentor.meet_link or "")


@router.get("/{mentor_id}/meet-link", response_model=MeetLinkResponse)
def get_meet_link(
    mentor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentor_user),
):
    if current_user.id != mentor_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden mentor scope")
    return MeetLinkResponse(meet_link=crud.get_mentor_meet_link(db, mentor_id))


@router.post("/sessions", response_model=SessionRecordResponse)
def log_session(
    payload: SessionRecordCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentor_user),
):
    session = crud.create_session_record(
        db,
        mentor_id=current_user.id,
        mentee_id=payload.mentee_id,
        session_date=payload.date,
        fluency_score=payload.fluency_score,
        confidence_score=payload.confidence_score,
        notes=payload.notes,
        next_steps=payload.next_steps,
    )
    return _session_response(db, session)


@router.post("/todos", response_model=TodoResponse)
def assign_todo(
    payload: TodoCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentor_user),
):
    todo = crud.create_todo(
        db,
        mentor_id=current_user.id,
        mentee_id=payload.mentee_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
    )
    return TodoResponse(
        id=todo.id,
        title=todo.title,
        description=todo.description,
        due_date=todo.due_date,
        completed=todo.completed,
        mentee_id=todo.mentee_id,
    )
