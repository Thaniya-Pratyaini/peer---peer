from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas import LoginRequest, LoginResponse
from ..security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, payload.name.strip(), payload.role, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user)
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user={"id": user.id, "name": user.name, "role": user.role},
    )
