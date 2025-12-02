import re
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from app.database.init import get_connection

class SessionManager:
    def __init__(self):
        self.conn = get_connection()
    
    def extract_period(self, df, filename: str) -> str:
        """
        从 Excel 表头内容或文件名提取 Period (年份)
        
        策略：
        1. 扫描 DataFrame 前3行所有单元格
        2. 如果未找到，尝试从文件名提取
        3. 默认使用当前年份
        """
        # 策略1: 从表头内容提取
        for row in df.head(3).values:
            for cell in row:
                match = re.search(r'(20\d{2})', str(cell))
                if match:
                    return match.group(1)
        
        # 策略2: 从文件名提取
        match = re.search(r'(20\d{2})', filename)
        if match:
            return match.group(1)
        
        # 策略3: 默认当前年份
        return str(datetime.now().year)
    
    def check_duplicate(self, file_hash: str) -> Optional[str]:
        """检查文件是否已上传（基于 Hash）"""
        result = self.conn.execute(
            "SELECT session_id FROM sessions WHERE file_hash = ?",
            [file_hash]
        ).fetchone()
        return result[0] if result else None
    
    def create_session(self, file_hash: str, file_name: str, period: str, total_rows: int) -> str:
        """创建新的 Session"""
        session_id = str(uuid.uuid4())
        self.conn.execute(
            """
            INSERT INTO sessions (session_id, file_hash, file_name, period, total_rows, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
            """,
            [session_id, file_hash, file_name, period, total_rows]
        )
        return session_id
    
    def update_status(self, session_id: str, status: str):
        """更新 Session 状态"""
        self.conn.execute(
            "UPDATE sessions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
            [status, session_id]
        )
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """获取 Session 信息"""
        result = self.conn.execute(
            "SELECT * FROM sessions WHERE session_id = ?",
            [session_id]
        ).fetchone()
        
        if result:
            return {
                "session_id": result[0],
                "period": result[1],
                "upload_time": result[2],
                "file_name": result[3],
                "file_hash": result[4],
                "total_rows": result[5],
                "status": result[6]
            }
        return None
