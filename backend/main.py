from fastapi import FastAPI

from .database import Base, engine
from .routes import admin, auth, mentee, mentor

app = FastAPI(title="Mentor Connect API")


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(mentor.router)
app.include_router(mentee.router)
