#!/usr/bin/env python3
"""
Migration script to update AIRecommendations table to support longer text
"""

import psycopg2
from database import get_db, engine
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_ai_recommendations_table():
    """Migrate the AIRecommendations table to use TEXT columns instead of VARCHAR(1000)"""
    
    try:
        # Connect directly to PostgreSQL
        connection = engine.raw_connection()
        cursor = connection.cursor()
        
        logger.info("Starting migration of AIRecommendations table...")
        
        # Check current column types
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'AIRecommendations' 
            AND column_name IN ('input', 'output');
        """)
        
        current_schema = cursor.fetchall()
        logger.info(f"Current schema: {current_schema}")
        
        # Alter the columns to TEXT type
        logger.info("Altering 'input' column to TEXT...")
        cursor.execute('ALTER TABLE "AIRecommendations" ALTER COLUMN input TYPE TEXT;')
        
        logger.info("Altering 'output' column to TEXT...")
        cursor.execute('ALTER TABLE "AIRecommendations" ALTER COLUMN output TYPE TEXT;')
        
        # Commit the changes
        connection.commit()
        logger.info("Migration completed successfully!")
        
        # Verify the changes
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'AIRecommendations' 
            AND column_name IN ('input', 'output');
        """)
        
        new_schema = cursor.fetchall()
        logger.info(f"New schema: {new_schema}")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        if 'connection' in locals():
            connection.rollback()
        raise
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    migrate_ai_recommendations_table()
    print("Migration completed!")
