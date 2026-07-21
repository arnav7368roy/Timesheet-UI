import sqlalchemy
from sqlalchemy import create_engine, text

db_url = "postgresql://neondb_owner:npg_KWudvYe02wly@ep-patient-waterfall-ah03ylx1.c-3.us-east-1.aws.neon.tech/neondb"

def main():
    engine = create_engine(db_url)
    with engine.connect() as conn:
        print("--- USERS ---")
        users = conn.execute(text("SELECT id, \"firstName\", \"lastName\", \"email\", \"roleId\" FROM users")).fetchall()
        user_map = {}
        for u in users:
            print(f"ID: {u[0]} | Name: {u[1]} {u[2]} | Email: {u[3]} | RoleId: {u[4]}")
            user_map[u[0]] = f"{u[1]} {u[2]}"

        print("\n--- ROLES ---")
        roles = conn.execute(text("SELECT id, \"roleName\", \"roleCode\" FROM roles")).fetchall()
        for r in roles:
            print(f"ID: {r[0]} | Name: {r[1]} | Code: {r[2]}")

        print("\n--- PROJECTS ---")
        projects = conn.execute(text("SELECT id, \"projectName\", \"projectCode\", \"managerId\" FROM projects")).fetchall()
        for p in projects:
            m_name = user_map.get(p[3], "Unknown")
            print(f"ID: {p[0]} | Name: {p[1]} | Code: {p[2]} | Manager: {m_name} ({p[3]})")

        print("\n--- TASKS ---")
        tasks = conn.execute(text("SELECT id, \"taskCode\", \"title\", \"projectId\", \"assignedBy\", \"assignedTo\" FROM tasks")).fetchall()
        for t in tasks:
            by_name = user_map.get(t[4], "Unknown")
            to_name = user_map.get(t[5], "Unknown")
            print(f"ID: {t[0]} | Code: {t[1]} | Title: {t[2]} | ProjectId: {t[3]} | AssignedBy: {by_name} ({t[4]}) | AssignedTo: {to_name} ({t[5]})")

if __name__ == "__main__":
    main()
