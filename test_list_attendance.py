import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select
from models.userModel import UserModel
from models.roleModel import RoleModel
from models.attendanceRegularizationModel import AttendanceRegularizationModel
from services.attendance.listAttendanceService import listAttendanceService

async def main():
    engine = create_async_engine("postgresql+asyncpg://neondb_owner:npg_KWudvYe02wly@ep-patient-waterfall-ah03ylx1.c-3.us-east-1.aws.neon.tech/neondb?ssl=require")
    async with AsyncSession(engine) as db:
        # Get Rohit Kumar
        res = await db.execute(select(UserModel).where(UserModel.employeeCode == 'EMP0004'))
        rohit = res.scalar_one_or_none()
        if not rohit:
            print("Rohit not found!")
            return
            
        print(f"Testing listAttendanceService for Rohit: {rohit.firstName} {rohit.lastName} (ID: {rohit.id}, Role ID: {rohit.roleId})")
        
        # Call service
        res_list = await listAttendanceService(
            db=db,
            page=1,
            limit=10,
            month=7,
            year=2026,
            currentUser=rohit
        )
        print("Response:", res_list)

asyncio.run(main())
