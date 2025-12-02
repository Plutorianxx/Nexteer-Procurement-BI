import pandas as pd
from typing import List, Dict, Any
from app.database.init import get_connection

class ETLService:
    def __init__(self):
        self.conn = get_connection()
    
    def clean_and_transform(self, df: pd.DataFrame, mapping: List[Dict]) -> pd.DataFrame:
        """
        根据映射关系清洗并转换数据
        
        Args:
            df: 原始 DataFrame
            mapping: 映射关系列表 [{"original_header": "Qty", "mapped_field": "Quantity"}, ...]
        
        Returns:
            清洗后的 DataFrame（列名为标准字段）
        """
        # 构建重命名字典（只包含成功映射的字段）
        rename_map = {
            m["original_header"]: m["mapped_field"].lower()
            for m in mapping
            if m["is_mapped"] and m["mapped_field"]
        }
        
        # 重命名列
        df_cleaned = df.rename(columns=rename_map)
        
        # 只保留标准字段
        standard_fields = ["pns", "commodity", "supplier", "quantity", "apv", "target_spend", "opportunity"]
        existing_fields = [f for f in standard_fields if f in df_cleaned.columns]
        df_cleaned = df_cleaned[existing_fields]
        
        # 数据类型转换（数值字段）
        numeric_fields = ["quantity", "apv", "target_spend", "opportunity"]
        for field in numeric_fields:
            if field in df_cleaned.columns:
                df_cleaned[field] = pd.to_numeric(df_cleaned[field], errors='coerce').fillna(0)
        
        # 字符串字段去除空格
        string_fields = ["pns", "commodity", "supplier"]
        for field in string_fields:
            if field in df_cleaned.columns:
                df_cleaned[field] = df_cleaned[field].astype(str).str.strip()
        
        return df_cleaned
    
    def insert_records(self, session_id: str, df: pd.DataFrame) -> int:
        """
        批量插入采购记录
        
        Returns:
            插入的行数
        """
        # 添加 session_id 列
        df["session_id"] = session_id
        
        # 重新排列列顺序以匹配表结构
        columns = ["session_id", "pns", "commodity", "supplier", "quantity", "apv", "target_spend", "opportunity"]
        
        # 确保所有列都存在（如果缺少则填充默认值）
        for col in columns:
            if col not in df.columns:
                df[col] = "" if col in ["pns", "commodity", "supplier"] else 0
        
        df_final = df[columns]
        
        # 批量插入
        records = df_final.values.tolist()
        self.conn.executemany(
            """
            INSERT INTO procurement_records 
            (session_id, pns, commodity, supplier, quantity, apv, target_spend, opportunity)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            records
        )
        
        return len(records)
    
    def get_records_by_session(self, session_id: str) -> List[Dict[str, Any]]:
        """查询指定 Session 的所有记录"""
        result = self.conn.execute(
            "SELECT * FROM procurement_records WHERE session_id = ?",
            [session_id]
        ).fetchall()
        
        return [
            {
                "session_id": row[0],
                "pns": row[1],
                "commodity": row[2],
                "supplier": row[3],
                "quantity": float(row[4]),
                "apv": float(row[5]),
                "target_spend": float(row[6]),
                "opportunity": float(row[7])
            }
            for row in result
        ]
