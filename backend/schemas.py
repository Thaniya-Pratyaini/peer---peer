from pydantic import BaseModel, EmailStr

from .models import Role


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: Role


class MapMentorRequest(BaseModel):
    mentor_id: int
    mentee_id: int


class MapMentorResponse(BaseModel):
    message: str
    mentor_id: int
    mentee_id: int
