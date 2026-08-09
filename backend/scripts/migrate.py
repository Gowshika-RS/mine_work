import sqlite3
import os
from app.database import engine
from app.models import Base

def migrate():
    print("Running comprehensive database schema sync for SQLite (mine_safety.db)...")
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mine_safety.db")
    
    if not os.path.exists(db_path):
        print("Database file does not exist yet. Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("Created all tables.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    for table_name, table in Base.metadata.tables.items():
        cursor.execute(f"PRAGMA table_info({table_name})")
        db_cols = {row[1] for row in cursor.fetchall()}
        
        if not db_cols:
            print(f"Table {table_name} does not exist in DB yet. Creating...")
            table.create(bind=engine, checkfirst=True)
            continue

        for col in table.columns:
            if col.name not in db_cols:
                # Map column type to SQLite compatible string
                col_type_str = str(col.type)
                if "VARCHAR" in col_type_str or "String" in col_type_str or "TEXT" in col_type_str or "JSON" in col_type_str:
                    col_type = "TEXT"
                elif "INT" in col_type_str or "Integer" in col_type_str or "Boolean" in col_type_str:
                    col_type = "INTEGER"
                elif "FLOAT" in col_type_str or "Numeric" in col_type_str or "Float" in col_type_str or "Decimal" in col_type_str:
                    col_type = "REAL"
                elif "DATETIME" in col_type_str or "DateTime" in col_type_str or "Date" in col_type_str:
                    col_type = "TIMESTAMP"
                else:
                    col_type = "TEXT"

                # Calculate default value
                default_clause = ""
                if col.default is not None and hasattr(col.default, 'arg') and isinstance(col.default.arg, (str, int, float, bool)):
                    val = col.default.arg
                    if isinstance(val, str):
                        default_clause = f" DEFAULT '{val}'"
                    elif isinstance(val, bool):
                        default_clause = f" DEFAULT {1 if val else 0}"
                    else:
                        default_clause = f" DEFAULT {val}"
                elif not col.nullable:
                    if col_type == "INTEGER":
                        default_clause = " DEFAULT 0"
                    elif col_type == "REAL":
                        default_clause = " DEFAULT 0.0"
                    else:
                        default_clause = " DEFAULT ''"

                alter_sql = f"ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type}{default_clause}"
                print(f"Executing: {alter_sql}")
                try:
                    cursor.execute(alter_sql)
                    conn.commit()
                    print(f"Successfully added column '{col.name}' to table '{table_name}'.")
                except Exception as e:
                    print(f"Error altering table {table_name} for column {col.name}: {e}")

    conn.close()
    Base.metadata.create_all(bind=engine)
    print("Comprehensive database migration check completed.")

if __name__ == "__main__":
    migrate()
