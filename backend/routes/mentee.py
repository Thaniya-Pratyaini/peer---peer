from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..models import Role, User
from ..schemas import MentorForMenteeResponse, ResourceResponse, TodoResponse
from ..security import require_roles

router = APIRouter(prefix="/mentee", tags=["mentee"])


def _mentee_user(current_user: User = Depends(require_roles(Role.MENTEE))) -> User:
    return current_user


@router.get("/{mentee_id}/mentor", response_model=MentorForMenteeResponse | None)
def get_mentor(
    mentee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentee_user),
):
    if current_user.id != mentee_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden mentee scope")
    mentor = crud.get_mentor_for_mentee(db, mentee_id)
    if not mentor:
        return None
    return MentorForMenteeResponse(mentor_name=mentor.name, meet_link=mentor.meet_link or "")


@router.get("/{mentee_id}/todos", response_model=list[TodoResponse])
def get_todos(
    mentee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentee_user),
):
    if current_user.id != mentee_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden mentee scope")
    todos = crud.get_todos_for_mentee(db, mentee_id)
    return [
        TodoResponse(
            id=todo.id,
            title=todo.title,
            description=todo.description,
            due_date=todo.due_date,
            completed=todo.completed,
            mentee_id=todo.mentee_id,
        )
        for todo in todos
    ]


@router.patch("/todos/{todo_id}/toggle", response_model=TodoResponse)
def toggle_todo(
    todo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(_mentee_user),
):
    todo = crud.toggle_todo_for_mentee(db, todo_id=todo_id, mentee_id=current_user.id)
    return TodoResponse(
        id=todo.id,
        title=todo.title,
        description=todo.description,
        due_date=todo.due_date,
        completed=todo.completed,
        mentee_id=todo.mentee_id,
    )


@router.get("/resources", response_model=list[ResourceResponse])
def get_resources(_: User = Depends(_mentee_user), db: Session = Depends(get_db)):
    return crud.list_resources(db)
