from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from .models import MentorMenteeMap, Resource, Role, SessionRecord, Todo, User
from .security import hash_password, is_hashed_password, verify_password


def authenticate_user(db: Session, name: str, role: Role, password: str) -> User | None:
    user = (
        db.query(User)
        .filter(User.name == name, User.role == role)
        .first()
    )
    if not user:
        return None

    stored_password = user.password
    if is_hashed_password(stored_password):
        if verify_password(password, stored_password):
            return user
        return None

    if stored_password == password:
        user.password = hash_password(password)
        db.commit()
        db.refresh(user)
        return user

    return None


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_users_by_role(db: Session, role: Role) -> list[User]:
    return db.query(User).filter(User.role == role).order_by(User.name.asc()).all()


def create_user(db: Session, name: str, role: Role, password: str) -> User:
    clean_name = name.strip()
    clean_password = password.strip()
    if not clean_name or not clean_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Name and password are required",
        )

    existing = (
        db.query(User)
        .filter(User.name == clean_name, User.role == role)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{role.value} with this name already exists",
        )

    user = User(name=clean_name, role=role, password=hash_password(clean_password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def map_mentor_to_mentee(db: Session, mentor_id: int, mentee_id: int) -> MentorMenteeMap:
    mentor = get_user_by_id(db, mentor_id)
    mentee = get_user_by_id(db, mentee_id)

    if not mentor or mentor.role != Role.MENTOR:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")
    if not mentee or mentee.role != Role.MENTEE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentee not found")

    existing = db.query(MentorMenteeMap).filter(MentorMenteeMap.mentee_id == mentee_id).first()
    if existing:
        existing.mentor_id = mentor_id
        db.commit()
        db.refresh(existing)
        return existing

    mapping = MentorMenteeMap(mentor_id=mentor_id, mentee_id=mentee_id)
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping


def list_mappings(db: Session) -> list[MentorMenteeMap]:
    return db.query(MentorMenteeMap).all()


def create_resource(db: Session, title: str, url: str) -> Resource:
    clean_title = title.strip()
    if not clean_title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource title is required",
        )

    resource = Resource(title=clean_title, url=url.strip())
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


def list_resources(db: Session) -> list[Resource]:
    return db.query(Resource).order_by(Resource.uploaded_at.desc(), Resource.id.desc()).all()


def set_mentor_meet_link(db: Session, mentor_id: int, meet_link: str) -> User:
    mentor = get_user_by_id(db, mentor_id)
    if not mentor or mentor.role != Role.MENTOR:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")

    mentor.meet_link = meet_link.strip()
    db.commit()
    db.refresh(mentor)
    return mentor


def get_mentor_meet_link(db: Session, mentor_id: int) -> str:
    mentor = get_user_by_id(db, mentor_id)
    if not mentor or mentor.role != Role.MENTOR:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")
    return mentor.meet_link or ""


def get_assigned_mentees(db: Session, mentor_id: int) -> list[User]:
    mentor = get_user_by_id(db, mentor_id)
    if not mentor or mentor.role != Role.MENTOR:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")

    mappings = (
        db.query(MentorMenteeMap)
        .filter(MentorMenteeMap.mentor_id == mentor_id)
        .all()
    )
    mentee_ids = [mapping.mentee_id for mapping in mappings]
    if not mentee_ids:
        return []
    return db.query(User).filter(User.id.in_(mentee_ids)).order_by(User.name.asc()).all()


def create_session_record(
    db: Session,
    mentor_id: int,
    mentee_id: int,
    session_date: date,
    fluency_score: int,
    confidence_score: int,
    notes: str,
    next_steps: str,
) -> SessionRecord:
    mentor = get_user_by_id(db, mentor_id)
    mentee = get_user_by_id(db, mentee_id)
    if not mentor or mentor.role != Role.MENTOR:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")
    if not mentee or mentee.role != Role.MENTEE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentee not found")

    mapping = db.query(MentorMenteeMap).filter(MentorMenteeMap.mentee_id == mentee_id).first()
    if not mapping or mapping.mentor_id != mentor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentee is not assigned to this mentor",
        )

    record = SessionRecord(
        mentor_id=mentor_id,
        mentee_id=mentee_id,
        date=session_date,
        fluency_score=fluency_score,
        confidence_score=confidence_score,
        notes=notes.strip(),
        next_steps=next_steps.strip(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_session_records(db: Session) -> list[SessionRecord]:
    return db.query(SessionRecord).order_by(SessionRecord.date.desc(), SessionRecord.id.desc()).all()


def create_todo(
    db: Session,
    mentor_id: int,
    mentee_id: int,
    title: str,
    description: str,
    due_date: date,
) -> Todo:
    mentor = get_user_by_id(db, mentor_id)
    mentee = get_user_by_id(db, mentee_id)
    if not mentor or mentor.role != Role.MENTOR:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")
    if not mentee or mentee.role != Role.MENTEE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentee not found")

    mapping = db.query(MentorMenteeMap).filter(MentorMenteeMap.mentee_id == mentee_id).first()
    if not mapping or mapping.mentor_id != mentor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mentee is not assigned to this mentor",
        )

    todo = Todo(
        mentor_id=mentor_id,
        mentee_id=mentee_id,
        title=title.strip(),
        description=description.strip(),
        due_date=due_date,
        completed=False,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


def get_todos_for_mentee(db: Session, mentee_id: int) -> list[Todo]:
    mentee = get_user_by_id(db, mentee_id)
    if not mentee or mentee.role != Role.MENTEE:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentee not found")
    return db.query(Todo).filter(Todo.mentee_id == mentee_id).order_by(Todo.due_date.asc()).all()


def get_todo_by_id(db: Session, todo_id: int) -> Todo | None:
    return db.query(Todo).filter(Todo.id == todo_id).first()


def toggle_todo_for_mentee(db: Session, todo_id: int, mentee_id: int) -> Todo:
    todo = get_todo_by_id(db, todo_id)
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    if todo.mentee_id != mentee_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Todo does not belong to this mentee")

    todo.completed = not todo.completed
    db.commit()
    db.refresh(todo)
    return todo


def get_mentor_for_mentee(db: Session, mentee_id: int) -> User | None:
    mapping = db.query(MentorMenteeMap).filter(MentorMenteeMap.mentee_id == mentee_id).first()
    if not mapping:
        return None
    return get_user_by_id(db, mapping.mentor_id)
