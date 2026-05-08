import sqlite3
import os

DB_PATH = "ahda_memory.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Session memory table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            user_input TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Hallucination history table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hallucinations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            claim TEXT NOT NULL,
            evidence TEXT,
            confidence REAL,
            explanation TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def log_conversation(session_id: str, user_input: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO conversations (session_id, user_input) VALUES (?, ?)", (session_id, user_input))
    conn.commit()
    conn.close()

def log_hallucination(session_id: str, claim: str, evidence: str, confidence: float, explanation: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO hallucinations (session_id, claim, evidence, confidence, explanation) VALUES (?, ?, ?, ?, ?)",
        (session_id, claim, evidence, confidence, explanation)
    )
    conn.commit()
    conn.close()
