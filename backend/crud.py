from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from .models import MentorMenteeMap, Role, User


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    return db.query(User).filter(User.email == email, User.password == password).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


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
