import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import text

async def main():
    engine = create_async_engine("postgresql+asyncpg://neondb_owner:npg_KWudvYe02wly@ep-patient-waterfall-ah03ylx1.c-3.us-east-1.aws.neon.tech/neondb?ssl=require")
    async with AsyncSession(engine) as db:
        # Get users
        res = await db.execute(text("SELECT id, \"employeeCode\", \"firstName\", \"lastName\", email FROM users"))
        users = res.fetchall()
        print("--- USERS ---")
        for u in users:
            print(f"ID: {u.id} | Code: {u.employeeCode} | Name: {u.firstName} {u.lastName} | Email: {u.email}")
            
        # Get attendance records
        res_att = await db.execute(text("SELECT id, \"employeeId\", \"attendanceDate\", \"checkIn\", \"checkOut\", status FROM attendance"))
        att = res_att.fetchall()
        print("\n--- ATTENDANCE ---")
        for a in att:
            print(f"ID: {a.id} | EmployeeId: {a.employeeId} | Date: {a.attendanceDate} | Checkin: {a.checkIn} | Checkout: {a.checkOut} | Status: {a.status}")

asyncio.run(main())
