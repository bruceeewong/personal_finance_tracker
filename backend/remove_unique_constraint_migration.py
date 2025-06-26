#!/usr/bin/env python3
"""
Migration script to remove UNIQUE constraint on (budget_id, category_id) 
from budget_categories table to allow multiple allocations for the same category
"""

import os
import sys
import sqlite3
import shutil
from datetime import datetime

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def run_migration():
    """Remove the unique constraint from budget_categories table"""
    
    # Database path
    db_path = os.path.join(os.path.dirname(__file__), 'src', 'database', 'app.db')
    
    if not os.path.exists(db_path):
        print("Database file not found. Please make sure the application has been initialized.")
        return False
    
    # Create backup
    backup_path = db_path + f".backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(db_path, backup_path)
    print(f"Created backup at: {backup_path}")
    
    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check current schema
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='budget_categories'")
        current_schema = cursor.fetchone()[0]
        print(f"Current schema: {current_schema}")
        
        # Check if unique constraint exists
        if "UNIQUE(budget_id, category_id)" not in current_schema:
            print("Unique constraint not found. No migration needed.")
            conn.close()
            return True
        
        # SQLite doesn't support dropping constraints directly, so we need to:
        # 1. Create new table without the constraint
        # 2. Copy data from old table to new table
        # 3. Drop old table
        # 4. Rename new table
        
        print("Creating new table without unique constraint...")
        
        # Create new table without the unique constraint
        create_new_table_sql = """
        CREATE TABLE budget_categories_new (
            id INTEGER PRIMARY KEY,
            budget_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            allocated_amount DECIMAL(10, 2) NOT NULL,
            alert_threshold_50 BOOLEAN DEFAULT TRUE,
            alert_threshold_75 BOOLEAN DEFAULT TRUE,
            alert_threshold_90 BOOLEAN DEFAULT TRUE,
            alert_threshold_100 BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            remarks TEXT,
            FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
        """
        
        cursor.execute(create_new_table_sql)
        
        # Copy data from old table to new table
        print("Copying data to new table...")
        cursor.execute("""
            INSERT INTO budget_categories_new 
            (id, budget_id, category_id, allocated_amount, alert_threshold_50, 
             alert_threshold_75, alert_threshold_90, alert_threshold_100, created_at, remarks)
            SELECT id, budget_id, category_id, allocated_amount, alert_threshold_50, 
                   alert_threshold_75, alert_threshold_90, alert_threshold_100, created_at, remarks
            FROM budget_categories
        """)
        
        # Drop the old table
        print("Dropping old table...")
        cursor.execute("DROP TABLE budget_categories")
        
        # Rename new table
        print("Renaming new table...")
        cursor.execute("ALTER TABLE budget_categories_new RENAME TO budget_categories")
        
        # Recreate index
        print("Recreating index...")
        cursor.execute("CREATE INDEX idx_budget_categories_budget_id ON budget_categories(budget_id)")
        
        # Commit the changes
        conn.commit()
        conn.close()
        
        print("Successfully removed unique constraint from budget_categories table.")
        print("Multiple allocations for the same category are now allowed.")
        return True
        
    except sqlite3.Error as e:
        print(f"Database error occurred: {e}")
        # Restore backup if something went wrong
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, db_path)
            print(f"Restored database from backup: {backup_path}")
        return False
    except Exception as e:
        print(f"Unexpected error occurred: {e}")
        # Restore backup if something went wrong
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, db_path)
            print(f"Restored database from backup: {backup_path}")
        return False

if __name__ == "__main__":
    print("Running migration to remove unique constraint on budget_categories...")
    success = run_migration()
    
    if success:
        print("Migration completed successfully!")
        print("You can now create multiple allocations for the same category in your budgets.")
        sys.exit(0)
    else:
        print("Migration failed!")
        sys.exit(1)