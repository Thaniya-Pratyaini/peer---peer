import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend import crud
from backend.database import Base, get_db
from backend.models import Role, User
from backend.routes import admin, auth, mentee, mentor


def _auth_headers(client: TestClient, name: str, role: str, password: str) -> dict[str, str]:
    response = client.post(
        "/auth/login",
        json={"name": name, "role": role, "password": password},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def _build_test_context(tmp_path: Path):
    db_path = tmp_path / "test.db"
    upload_dir = tmp_path / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    os.environ["UPLOAD_DIR"] = str(upload_dir)

    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
    )
    testing_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(auth.router)
    app.include_router(admin.router)
    app.include_router(mentor.router)
    app.include_router(mentee.router)

    def override_get_db():
        db = testing_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    db = testing_session()
    try:
        admin_user = crud.create_user(db, "Admin", Role.ADMIN, "admin123")
        mentor_user = crud.create_user(db, "Mentor", Role.MENTOR, "mentor123")
        mentee_user = crud.create_user(db, "Mentee", Role.MENTEE, "mentee123")
        crud.map_mentor_to_mentee(db, mentor_user.id, mentee_user.id)
    finally:
        db.close()

    return {
        "client": TestClient(app),
        "session": testing_session,
        "upload_dir": upload_dir,
    }


def test_login_success_and_failure(tmp_path: Path):
    ctx = _build_test_context(tmp_path)
    client = ctx["client"]

    ok = client.post("/auth/login", json={"name": "Admin", "role": "admin", "password": "admin123"})
    assert ok.status_code == 200
    payload = ok.json()
    assert payload["token_type"] == "bearer"
    assert payload["user"]["name"] == "Admin"

    bad = client.post("/auth/login", json={"name": "Admin", "role": "admin", "password": "wrong"})
    assert bad.status_code == 401

    db = ctx["session"]()
    try:
        admin_user = db.query(User).filter(User.name == "Admin").first()
        assert admin_user is not None
        assert admin_user.password != "admin123"
    finally:
        db.close()


def test_admin_endpoints_reject_non_admin(tmp_path: Path):
    ctx = _build_test_context(tmp_path)
    client = ctx["client"]

    mentor_headers = _auth_headers(client, "Mentor", "mentor", "mentor123")
    response = client.get("/admin/mentees", headers=mentor_headers)
    assert response.status_code == 403


def test_admin_create_and_map_users(tmp_path: Path):
    ctx = _build_test_context(tmp_path)
    client = ctx["client"]

    admin_headers = _auth_headers(client, "Admin", "admin", "admin123")

    created = client.post(
        "/admin/users",
        json={"name": "Tom", "role": "mentor", "password": "tom12345"},
        headers=admin_headers,
    )
    assert created.status_code == 200

    mentors = client.get("/admin/mentors", headers=admin_headers)
    assert mentors.status_code == 200
    mentor_id = next(item["id"] for item in mentors.json() if item["name"] == "Tom")

    mentees = client.get("/admin/mentees", headers=admin_headers)
    mentee_id = mentees.json()[0]["id"]

    mapped = client.post(
        "/admin/map-mentor",
        json={"mentor_id": mentor_id, "mentee_id": mentee_id},
        headers=admin_headers,
    )
    assert mapped.status_code == 200
    assert mapped.json()["mentee_id"] == mentee_id


def test_assign_and_toggle_todo(tmp_path: Path):
    ctx = _build_test_context(tmp_path)
    client = ctx["client"]

    mentor_headers = _auth_headers(client, "Mentor", "mentor", "mentor123")
    mentee_headers = _auth_headers(client, "Mentee", "mentee", "mentee123")

    assign = client.post(
        "/mentor/todos",
        json={
            "mentee_id": 3,
            "title": "Read chapter",
            "description": "Read chapter 1 and summarize",
            "due_date": "2026-02-28",
        },
        headers=mentor_headers,
    )
    assert assign.status_code == 200
    todo_id = assign.json()["id"]
    assert assign.json()["completed"] is False

    toggled = client.patch(f"/mentee/todos/{todo_id}/toggle", headers=mentee_headers)
    assert toggled.status_code == 200
    assert toggled.json()["completed"] is True


def test_log_and_list_sessions(tmp_path: Path):
    ctx = _build_test_context(tmp_path)
    client = ctx["client"]

    mentor_headers = _auth_headers(client, "Mentor", "mentor", "mentor123")
    admin_headers = _auth_headers(client, "Admin", "admin", "admin123")

    logged = client.post(
        "/mentor/sessions",
        json={
            "mentee_id": 3,
            "date": "2026-02-28",
            "fluency_score": 8,
            "confidence_score": 7,
            "notes": "Good speaking clarity",
            "next_steps": "Practice one presentation",
        },
        headers=mentor_headers,
    )
    assert logged.status_code == 200

    sessions = client.get("/admin/sessions", headers=admin_headers)
    assert sessions.status_code == 200
    assert len(sessions.json()) == 1
    assert sessions.json()[0]["mentor_name"] == "Mentor"


def test_upload_and_list_resources(tmp_path: Path):
    ctx = _build_test_context(tmp_path)
    client = ctx["client"]

    admin_headers = _auth_headers(client, "Admin", "admin", "admin123")
    mentee_headers = _auth_headers(client, "Mentee", "mentee", "mentee123")

    upload = client.post(
        "/admin/resources",
        data={"title": "English Guide"},
        files={"file": ("guide.pdf", b"%PDF-1.4 fake-pdf", "application/pdf")},
        headers=admin_headers,
    )
    assert upload.status_code == 200
    assert upload.json()["url"].startswith("/uploads/")

    assert len(list(ctx["upload_dir"].glob("*.pdf"))) == 1

    resources = client.get("/mentee/resources", headers=mentee_headers)
    assert resources.status_code == 200
    assert resources.json()[0]["title"] == "English Guide"
