from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..models import Role
from ..schemas import MapMentorRequest, MapMentorResponse

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(
    x_user_id: int = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    user = crud.get_user_by_id(db, x_user_id)
    if not user or user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user


@router.post("/map-mentor", response_model=MapMentorResponse)
def map_mentor(
    payload: MapMentorRequest,
    _: object = Depends(require_admin),
    db: Session = Depends(get_db),
):
    mapping = crud.map_mentor_to_mentee(db, payload.mentor_id, payload.mentee_id)
    return MapMentorResponse(
        message="Mentor mapped to mentee successfully",
        mentor_id=mapping.mentor_id,
        mentee_id=mapping.mentee_id,
    )
