import duckdb
from pathlib import Path
import os

# 数据库文件路径（相对于项目根目录）
PROJECT_ROOT = Path(__file__).parent.parent.parent
DB_PATH = os.getenv("DUCKDB_PATH", str(PROJECT_ROOT / "data" / "procurement.duckdb"))

def get_connection():
    """获取 DuckDB 连接"""
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    return duckdb.connect(DB_PATH)

def init_database():
    """初始化数据库表结构"""
    conn = get_connection()
    
    # 创建 sessions 表
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id VARCHAR PRIMARY KEY,
            period VARCHAR,
            upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            file_name VARCHAR,
            file_hash VARCHAR,
            total_rows INTEGER,
            status VARCHAR DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # 创建 procurement_records 表
    conn.execute("""
        CREATE TABLE IF NOT EXISTS procurement_records (
            session_id VARCHAR,
            pns VARCHAR,
            part_desc VARCHAR,
            commodity VARCHAR,
            supplier VARCHAR,
            currency VARCHAR,
            quantity DECIMAL(15,2),
            price DECIMAL(15,2),
            apv DECIMAL(15,2),
            covered_apv DECIMAL(15,2),
            target_cost DECIMAL(15,2),
            target_spend DECIMAL(15,2),
            gap_to_target DECIMAL(15,2),
            opportunity DECIMAL(15,2),
            gap_percent DECIMAL(5,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (session_id, pns, supplier)
        )
    """)
    
    conn.close()
    print("Database initialized successfully.")

if __name__ == "__main__":
    init_database()
