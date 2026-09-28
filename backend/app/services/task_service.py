import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.task import Task, TaskCategory, UserTaskSelection

DEFAULT_CATALOGUE = [
    {
        "name": "Deep Cleaning & Sanitization",
        "slug": "deep-cleaning",
        "icon_name": "sparkles",
        "display_order": 1,
        "tasks": [
            {
                "name": "Kitchen Deep Degreasing & Chimney Scrub",
                "short_description": "Intensive degreasing of stovetops, tiles, exhaust hood, and oil splatter removal.",
                "display_order": 1,
            },
            {
                "name": "Bathroom Tile, Grout & Acid Wash",
                "short_description": "Hard-water scale removal, floor & wall tile scrubbing, sanitary fixture disinfection.",
                "display_order": 2,
            },
            {
                "name": "Complete Home Move-In Sanitization",
                "short_description": "Full dust-proofing, floor buffing, and interior cabinet wipe-down for new homes.",
                "display_order": 3,
            },
            {
                "name": "Sofa & Upholstery Deep Shampoo",
                "short_description": "Wet extraction cleaning of fabric couches, recliners, and dust mite sanitization.",
                "display_order": 4,
            },
            {
                "name": "Balcony & Window Mesh Pressure Wash",
                "short_description": "High-pressure water washing of window panes, grilles, and balcony floor drainage.",
                "display_order": 5,
            },
            {
                "name": "Post-Renovation Paint & Debris Scrub",
                "short_description": "Thorough removal of paint splatters, cement stains, and fine plaster residue.",
                "display_order": 6,
            },
        ],
    },
    {
        "name": "Plumbing & Drainage",
        "slug": "plumbing",
        "icon_name": "water",
        "display_order": 2,
        "tasks": [
            {
                "name": "Drain Blockage Clearing & Jetting",
                "short_description": "Unclogging kitchen sinks, floor gullies, and main sewer inspection chambers.",
                "display_order": 1,
            },
            {
                "name": "Tap, Mixer & Diverter Installation/Repair",
                "short_description": "Cartridge replacement, leak stoppage, and premium bath fitting assembly.",
                "display_order": 2,
            },
            {
                "name": "Overhead Tank Cleaning & Disinfection",
                "short_description": "Sediment pumping, high-pressure wall scrubbing, and potassium permanganate treatment.",
                "display_order": 3,
            },
            {
                "name": "Concealed Pipe Leakage Detection",
                "short_description": "Acoustic and moisture scanning to pinpoint hidden wall or floor pipe seepage.",
                "display_order": 4,
            },
            {
                "name": "Commode & Flush Cistern Overhaul",
                "short_description": "Dual-flush valve repair, syphon replacement, and sanitary bowl resealing.",
                "display_order": 5,
            },
            {
                "name": "Water Purifier Inlet & Filter Line Setup",
                "short_description": "Direct diverter valve installation and high-pressure food-grade inlet line routing.",
                "display_order": 6,
            },
        ],
    },
    {
        "name": "Electrical & Wiring",
        "slug": "electrical",
        "icon_name": "flash",
        "display_order": 3,
        "tasks": [
            {
                "name": "Ceiling Fan & Exhaust Installation",
                "short_description": "Secure mounting, balance blade calibration, and regulator switch connection.",
                "display_order": 1,
            },
            {
                "name": "Distribution Board (DB) & MCB Tripping Fix",
                "short_description": "Load balancing, fault isolation, and circuit breaker unit replacement.",
                "display_order": 2,
            },
            {
                "name": "LED Chandelier & Ambient Light Setup",
                "short_description": "Precision ceiling anchoring, wire dressing, and dimmer/remote configuration.",
                "display_order": 3,
            },
            {
                "name": "Smart Switch & Home Automation Fitting",
                "short_description": "Wi-Fi smart relay module wiring behind standard switchboards.",
                "display_order": 4,
            },
            {
                "name": "Inverter Wiring & Battery Line Setup",
                "short_description": "Backup circuit segregation, battery terminal greasing, and changeover switch install.",
                "display_order": 5,
            },
            {
                "name": "AC Power Socket & Heavy Load Rewiring",
                "short_description": "16A/25A industrial grade socket routing with dedicated fire-retardant wiring.",
                "display_order": 6,
            },
        ],
    },
    {
        "name": "Appliance Maintenance & Repair",
        "slug": "appliances",
        "icon_name": "construct",
        "display_order": 4,
        "tasks": [
            {
                "name": "Split AC Deep Foam Jet Cleaning",
                "short_description": "Indoor cooling coil foam wash, blower fan degreasing, and drain tray flush.",
                "display_order": 1,
            },
            {
                "name": "Microwave & Oven Magnetron Inspection",
                "short_description": "High-voltage diode testing, door safety interlock repair, and heating check.",
                "display_order": 2,
            },
            {
                "name": "Semi/Front-Load Washing Machine Spin Fix",
                "short_description": "Drive belt replacement, shock absorber inspection, and drum balance tuning.",
                "display_order": 3,
            },
            {
                "name": "Refrigerator Gas Top-Up & Coil De-icing",
                "short_description": "Eco-friendly refrigerant charging, compressor relay check, and capillary clean.",
                "display_order": 4,
            },
            {
                "name": "RO Water Purifier Membrane & Sediment Change",
                "short_description": "Filter cartridge replacement, TDS level tuning, and UV lamp verification.",
                "display_order": 5,
            },
            {
                "name": "Geyser Coil Descaling & Thermostat Replacement",
                "short_description": "Hard-water scale chipping, anode rod swap, and overheat cut-off testing.",
                "display_order": 6,
            },
        ],
    },
]


class TaskService:
    async def seed_catalogue_if_empty(self, session: AsyncSession) -> None:
        """Seeds the 24 default tasks across 4 categories if catalogue is empty."""
        stmt = select(TaskCategory).limit(1)
        result = await session.execute(stmt)
        if result.scalar_one_or_none() is not None:
            return  # Already seeded

        for cat_data in DEFAULT_CATALOGUE:
            category = TaskCategory(
                name=cat_data["name"],
                slug=cat_data["slug"],
                icon_name=cat_data["icon_name"],
                display_order=cat_data["display_order"],
            )
            session.add(category)
            await session.flush()  # populate category.id

            for task_data in cat_data["tasks"]:
                task = Task(
                    category_id=category.id,
                    name=task_data["name"],
                    short_description=task_data["short_description"],
                    display_order=task_data["display_order"],
                )
                session.add(task)

        await session.commit()

    async def get_categories_with_tasks(self, session: AsyncSession) -> List[TaskCategory]:
        """Returns all categories with their associated tasks."""
        await self.seed_catalogue_if_empty(session)
        stmt = (
            select(TaskCategory)
            .options(selectinload(TaskCategory.tasks))
            .order_by(TaskCategory.display_order.asc())
        )
        result = await session.execute(stmt)
        categories = list(result.scalars().all())

        # Populate category_name on each task for convenience
        for cat in categories:
            for t in cat.tasks:
                t.category_name = cat.name

        return categories

    async def search_tasks(
        self,
        session: AsyncSession,
        query: Optional[str] = None,
    ) -> List[Task]:
        """Searches tasks across title and short description."""
        await self.seed_catalogue_if_empty(session)
        stmt = (
            select(Task)
            .join(TaskCategory)
            .options(selectinload(Task.category))
            .order_by(TaskCategory.display_order.asc(), Task.display_order.asc())
        )

        if query and query.strip():
            clean_q = f"%{query.strip()}%"
            stmt = stmt.where(
                or_(
                    Task.name.ilike(clean_q),
                    Task.short_description.ilike(clean_q),
                    TaskCategory.name.ilike(clean_q),
                )
            )

        result = await session.execute(stmt)
        tasks = list(result.scalars().all())
        for t in tasks:
            if t.category:
                t.category_name = t.category.name
        return tasks

    async def select_tasks(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        task_ids: List[uuid.UUID],
    ) -> List[Task]:
        """
        Saves user selected tasks.
        Validates task existence, clears prior selections, and inserts new selections.
        """
        # Validate that all requested task IDs exist
        stmt = (
            select(Task)
            .join(TaskCategory)
            .options(selectinload(Task.category))
            .where(Task.id.in_(task_ids))
        )
        result = await session.execute(stmt)
        found_tasks = list(result.scalars().all())

        found_ids = {t.id for t in found_tasks}
        missing_ids = set(task_ids) - found_ids
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"One or more requested tasks do not exist: {', '.join(str(i) for i in missing_ids)}",
            )

        # Remove existing selections for this user
        del_stmt = delete(UserTaskSelection).where(UserTaskSelection.user_id == user_id)
        await session.execute(del_stmt)

        # Insert new selections
        for tid in task_ids:
            session.add(UserTaskSelection(user_id=user_id, task_id=tid))

        await session.commit()

        for t in found_tasks:
            if t.category:
                t.category_name = t.category.name

        return found_tasks

    async def get_user_selected_tasks(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
    ) -> List[Task]:
        """Returns the tasks currently selected by the authenticated user."""
        stmt = (
            select(Task)
            .join(UserTaskSelection, UserTaskSelection.task_id == Task.id)
            .join(TaskCategory, TaskCategory.id == Task.category_id)
            .options(selectinload(Task.category))
            .where(UserTaskSelection.user_id == user_id)
            .order_by(TaskCategory.display_order.asc(), Task.display_order.asc())
        )
        result = await session.execute(stmt)
        tasks = list(result.scalars().all())
        for t in tasks:
            if t.category:
                t.category_name = t.category.name
        return tasks


task_service = TaskService()
