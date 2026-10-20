import asyncio
from app.core.db import engine, Base
from app import models

async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("All tables recreated cleanly with latest schema!")

if __name__ == "__main__":
    asyncio.run(main())
