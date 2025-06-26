#!/usr/bin/env python3
"""
Migration script to add remarks column to budget_categories table
This script safely adds the remarks column to existing budget_categories table
"""

import os
import sys
import sqlite3

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def run_migration():
    """Run the migration to add remarks column to budget_categories table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print("Database file not found. Please make sure the application has been initialized.")
        return False
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if remarks column already exists
        cursor.execute("PRAGMA table_info(budget_categories)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'remarks' in columns:
            print("Remarks column already exists in budget_categories table. No migration needed.")
            conn.close()
            return True
        
        # Add the remarks column
        cursor.execute("ALTER TABLE budget_categories ADD COLUMN remarks TEXT")
        
        # Commit the changes
        conn.commit()
        conn.close()
        
        print("Successfully added remarks column to budget_categories table.")
        return True
        
    except sqlite3.Error as e:
        print(f"Database error occurred: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        return False

if __name__ == "__main__":
    print("Running migration to add remarks column to budget_categories table...")
    success = run_migration()
    
    if success:
        print("Migration completed successfully!")
        sys.exit(0)
    else:
        print("Migration failed!")
        sys.exit(1)