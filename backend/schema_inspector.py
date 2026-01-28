import sqlite3
import os

# Caminho do banco de dados SQLite do bot
BOT_PATH = r"C:\Users\carlu\legion-chess-bot"
DB_PATH = os.path.join(BOT_PATH, 'legion_chess.db')

def inspect_schema():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()

        print("--- Database Schema ---")
        for table_name_tuple in tables:
            table_name = table_name_tuple[0]
            print(f"\n[Table: {table_name}]")

            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name});")
            schema = cursor.fetchall()
            for column in schema:
                print(f"  - {column[1]} ({column[2]})")

        print("\n--- End of Schema ---")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    inspect_schema()
