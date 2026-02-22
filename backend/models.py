import enum
from datetime import date

from sqlalchemy import Boolean, Column, Date, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from .database import Base


class Role(str, enum.Enum):
    ADMIN = "admin"
    MENTOR = "mentor"
    MENTEE = "mentee"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password = Column(String, nullable=False)
    role = Column(Enum(Role), nullable=False)
    meet_link = Column(String, nullable=True)

    mentor_mappings = relationship(
        "MentorMenteeMap",
        back_populates="mentor",
        foreign_keys="MentorMenteeMap.mentor_id",
        cascade="all, delete-orphan",
    )
    mentee_mapping = relationship(
        "MentorMenteeMap",
        back_populates="mentee",
        foreign_keys="MentorMenteeMap.mentee_id",
        uselist=False,
        cascade="all, delete-orphan",
    )
    mentor_sessions = relationship(
        "SessionRecord",
        foreign_keys="SessionRecord.mentor_id",
        back_populates="mentor",
        cascade="all, delete-orphan",
    )
    mentee_sessions = relationship(
        "SessionRecord",
        foreign_keys="SessionRecord.mentee_id",
        back_populates="mentee",
        cascade="all, delete-orphan",
    )
    mentor_todos = relationship(
        "Todo",
        foreign_keys="Todo.mentor_id",
        back_populates="mentor",
        cascade="all, delete-orphan",
    )
    mentee_todos = relationship(
        "Todo",
        foreign_keys="Todo.mentee_id",
        back_populates="mentee",
        cascade="all, delete-orphan",
    )


class MentorMenteeMap(Base):
    __tablename__ = "mentor_mentee_map"
    __table_args__ = (
        UniqueConstraint("mentee_id", name="uq_mentee_single_mentor"),
    )

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentor_mappings")
    mentee = relationship("User", foreign_keys=[mentee_id], back_populates="mentee_mapping")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False, default="")
    uploaded_at = Column(Date, nullable=False, default=date.today)


class SessionRecord(Base):
    __tablename__ = "session_records"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    fluency_score = Column(Integer, nullable=False)
    confidence_score = Column(Integer, nullable=False)
    notes = Column(String, nullable=False)
    next_steps = Column(String, nullable=False)

    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentor_sessions")
    mentee = relationship("User", foreign_keys=[mentee_id], back_populates="mentee_sessions")


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mentee_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    due_date = Column(Date, nullable=False)
    completed = Column(Boolean, nullable=False, default=False)

    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="mentor_todos")
    mentee = relationship("User", foreign_keys=[mentee_id], back_populates="mentee_todos")
