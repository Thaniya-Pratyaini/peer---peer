import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer, String, UniqueConstraint
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
    email = Column(String, unique=True, index=True, nullable=False)
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
