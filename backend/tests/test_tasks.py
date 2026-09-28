import uuid
import pytest
from httpx import AsyncClient

from tests.conftest import TestAsyncSessionLocal as AsyncSessionLocal


async def get_authenticated_token(client: AsyncClient, email: str = "tasks_user@example.com") -> str:
    """Helper to register, verify, and log in a test user."""
    from app.models.user import User
    from sqlalchemy import select

    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "Password123!", "confirm_password": "Password123!"},
    )

    async with AsyncSessionLocal() as session:
        user_stmt = select(User).where(User.email == email)
        user = (await session.execute(user_stmt)).scalar_one()
        user.is_email_verified = True
        await session.commit()

    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    return login_resp.json()["access_token"]


@pytest.mark.asyncio
async def test_01_catalogue_contains_at_least_20_tasks_and_4_categories(async_client: AsyncClient):
    """
    Assignment PDF Part A Requirement:
    'Task catalogue: seed at least 20 tasks across at least 4 categories, modelled on app.padosipro.com.
    Each has a name, category and short description.'
    """
    resp = await async_client.get("/api/v1/tasks/categories")
    assert resp.status_code == 200
    categories = resp.json()

    # Must have at least 4 categories
    assert len(categories) >= 4, f"Expected at least 4 categories, got {len(categories)}"

    total_tasks = 0
    for cat in categories:
        assert cat["name"], "Category name cannot be empty"
        assert cat["slug"], "Category slug cannot be empty"
        assert cat["icon_name"], "Category icon cannot be empty"
        assert len(cat["tasks"]) > 0, f"Category '{cat['name']}' has no tasks"

        for task in cat["tasks"]:
            total_tasks += 1
            assert task["id"], "Task ID required"
            assert task["name"], "Task name required"
            assert task["short_description"], "Task short description required"
            assert task["category_id"] == cat["id"]

    # Must have at least 20 tasks in total
    assert total_tasks >= 20, f"Expected at least 20 tasks across categories, got {total_tasks}"


@pytest.mark.asyncio
async def test_02_search_tasks_query_filter(async_client: AsyncClient):
    """Verify live search filters tasks by title, category, or description."""
    # Search for "Plumbing"
    resp_plumb = await async_client.get("/api/v1/tasks?search=plumbing")
    assert resp_plumb.status_code == 200
    plumb_tasks = resp_plumb.json()
    assert len(plumb_tasks) > 0
    assert any("plumbing" in t["name"].lower() or "plumbing" in (t.get("category_name") or "").lower() for t in plumb_tasks)

    # Search for specific term "Chimney"
    resp_chimney = await async_client.get("/api/v1/tasks?search=chimney")
    assert resp_chimney.status_code == 200
    chimney_tasks = resp_chimney.json()
    assert len(chimney_tasks) == 1
    assert "Chimney" in chimney_tasks[0]["name"]

    # Search with no match
    resp_empty = await async_client.get("/api/v1/tasks?search=nonexistentterm123xyz")
    assert resp_empty.status_code == 200
    assert len(resp_empty.json()) == 0


@pytest.mark.asyncio
async def test_03_select_tasks_requires_authentication(async_client: AsyncClient):
    """POST /api/v1/tasks/select must reject unauthenticated requests with 401."""
    resp = await async_client.post(
        "/api/v1/tasks/select",
        json={"task_ids": [str(uuid.uuid4())]},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_04_select_tasks_success(async_client: AsyncClient):
    """Authenticated user selects tasks and receives confirmed selection."""
    token = await get_authenticated_token(async_client, "pro1@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch 3 valid tasks from catalogue
    cat_resp = await async_client.get("/api/v1/tasks/categories")
    cat_data = cat_resp.json()
    selected_ids = [
        cat_data[0]["tasks"][0]["id"],
        cat_data[0]["tasks"][1]["id"],
        cat_data[1]["tasks"][0]["id"],
    ]

    select_resp = await async_client.post(
        "/api/v1/tasks/select",
        json={"task_ids": selected_ids},
        headers=headers,
    )
    assert select_resp.status_code == 200
    data = select_resp.json()
    assert data["total_count"] == 3
    assert len(data["tasks"]) == 3
    returned_ids = {t["id"] for t in data["tasks"]}
    assert returned_ids == set(selected_ids)


@pytest.mark.asyncio
async def test_05_select_tasks_invalid_id_rejected(async_client: AsyncClient):
    """Submitting non-existent task IDs returns 404 with descriptive error."""
    token = await get_authenticated_token(async_client, "pro2@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    fake_id = str(uuid.uuid4())
    select_resp = await async_client.post(
        "/api/v1/tasks/select",
        json={"task_ids": [fake_id]},
        headers=headers,
    )
    assert select_resp.status_code == 404
    assert "not exist" in select_resp.json()["detail"]


@pytest.mark.asyncio
async def test_06_my_selection_returns_saved_tasks(async_client: AsyncClient):
    """GET /api/v1/tasks/my-selection returns the user's currently selected tasks."""
    token = await get_authenticated_token(async_client, "pro3@example.com")
    headers = {"Authorization": f"Bearer {token}"}

    # Initially 0
    initial_resp = await async_client.get("/api/v1/tasks/my-selection", headers=headers)
    assert initial_resp.status_code == 200
    assert initial_resp.json()["total_count"] == 0

    # Pick 2 tasks
    cat_resp = await async_client.get("/api/v1/tasks/categories")
    cat_data = cat_resp.json()
    selected_ids = [cat_data[2]["tasks"][0]["id"], cat_data[3]["tasks"][0]["id"]]

    await async_client.post(
        "/api/v1/tasks/select",
        json={"task_ids": selected_ids},
        headers=headers,
    )

    # Now returns 2 tasks
    resp = await async_client.get("/api/v1/tasks/my-selection", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_count"] == 2
    assert {t["id"] for t in data["tasks"]} == set(selected_ids)


@pytest.mark.asyncio
async def test_07_user_selections_are_isolated(async_client: AsyncClient):
    """Task selections are strictly isolated between different users."""
    token_a = await get_authenticated_token(async_client, "user_a@example.com")
    token_b = await get_authenticated_token(async_client, "user_b@example.com")

    cat_resp = await async_client.get("/api/v1/tasks/categories")
    cat_data = cat_resp.json()
    task_id = cat_data[0]["tasks"][0]["id"]

    # User A selects task
    await async_client.post(
        "/api/v1/tasks/select",
        json={"task_ids": [task_id]},
        headers={"Authorization": f"Bearer {token_a}"},
    )

    # User B checks selection -> should be 0
    resp_b = await async_client.get(
        "/api/v1/tasks/my-selection",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert resp_b.status_code == 200
    assert resp_b.json()["total_count"] == 0
