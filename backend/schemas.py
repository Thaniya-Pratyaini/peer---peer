from datetime import date
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

from .models import Role

Score = Annotated[int, Field(ge=1, le=10)]


class LoginRequest(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    role: Role
    password: Annotated[str, Field(min_length=1, max_length=200)]


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    role: Role


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class CreateUserRequest(BaseModel):
    name: Annotated[str, Field(min_length=1, max_length=100)]
    role: Role
    password: Annotated[str, Field(min_length=6, max_length=200)]


class MapMentorRequest(BaseModel):
    mentor_id: int
    mentee_id: int


class MapMentorResponse(BaseModel):
    message: str
    mentor_id: int
    mentee_id: int


class MentorMenteeMappingResponse(BaseModel):
    mentor_id: int
    mentor_name: str
    mentee_id: int
    mentee_name: str


class ResourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    url: str
    uploaded_at: date


class SessionRecordCreateRequest(BaseModel):
    mentee_id: int
    date: date
    fluency_score: Score
    confidence_score: Score
    notes: Annotated[str, Field(min_length=1, max_length=2000)]
    next_steps: Annotated[str, Field(min_length=1, max_length=2000)]


class SessionRecordResponse(BaseModel):
    id: int
    mentor_name: str
    mentee_name: str
    date: date
    fluency_score: int
    confidence_score: int
    notes: str
    next_steps: str


class TodoCreateRequest(BaseModel):
    mentee_id: int
    title: Annotated[str, Field(min_length=1, max_length=200)]
    description: Annotated[str, Field(min_length=1, max_length=2000)]
    due_date: date


class TodoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    due_date: date
    completed: bool
    mentee_id: int


class MeetLinkUpdateRequest(BaseModel):
    meet_link: Annotated[str, Field(max_length=500)]

    @field_validator("meet_link")
    @classmethod
    def validate_meet_link(cls, value: str) -> str:
        clean = value.strip()
        if clean and not (clean.startswith("http://") or clean.startswith("https://")):
            raise ValueError("Meet link must be a valid http(s) URL")
        return clean


class MeetLinkResponse(BaseModel):
    meet_link: str


class MentorForMenteeResponse(BaseModel):
    mentor_name: str
    meet_link: str
