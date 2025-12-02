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
        standard_fields = [
            "pns", "partdescription", "commodity", "supplier", "currency",
            "quantity", "price", "apv", "coveredapv",
            "targetcost", "targetspend", "gaptotarget", "opportunity", "gappercent"
        ]
        # 转换为小写以便匹配
        standard_fields_lower = [f.lower() for f in standard_fields]
        
        existing_fields = [f for f in standard_fields_lower if f in df_cleaned.columns]
        df_cleaned = df_cleaned[existing_fields]
        
        # 数据类型转换（数值字段）
        numeric_fields = [
            "quantity", "price", "apv", "coveredapv", 
            "targetcost", "targetspend", "gaptotarget", "opportunity", "gappercent"
        ]
        for field in numeric_fields:
            if field in df_cleaned.columns:
                # 去除货币符号和百分号
                if df_cleaned[field].dtype == object:
                    df_cleaned[field] = df_cleaned[field].astype(str).str.replace(r'[$,%]', '', regex=True)
                df_cleaned[field] = pd.to_numeric(df_cleaned[field], errors='coerce').fillna(0)
        
        # 字符串字段去除空格
        string_fields = ["pns", "partdescription", "commodity", "supplier", "currency"]
        for field in string_fields:
            if field in df_cleaned.columns:
                df_cleaned[field] = df_cleaned[field].astype(str).str.strip()
        
        # 按 PNs 和 Supplier 聚合 (解决主键冲突，同时保留双源采购)
        if "pns" in df_cleaned.columns and "supplier" in df_cleaned.columns:
            # 1. 定义基础聚合规则
            agg_dict = {}
            for col in df_cleaned.columns:
                if col in ["pns", "supplier"]: continue
                if col in ["price", "gap_percent", "gappercent", "gap_to_target", "gaptotarget"]:
                    continue # 这些字段需要特殊计算
                
                if col in numeric_fields:
                    agg_dict[col] = "sum"
                else:
                    agg_dict[col] = "first"
            
            # 2. 执行基础聚合
            # 按 pns 和 supplier 联合分组，保留双源采购记录
            df_grouped = df_cleaned.groupby(["pns", "supplier"], as_index=False).agg(agg_dict)
            
            # 3. 计算加权平均字段 (Price, Gap%)
            # 为了计算加权，我们需要原始数据的分组对象
            grouped = df_cleaned.groupby(["pns", "supplier"])
            
            def calculate_weighted_metrics(group):
                total_qty = group["quantity"].sum() if "quantity" in group else 0
                total_apv = group["apv"].sum() if "apv" in group else 0
                
                metrics = {}
                
                # 计算加权单价 (Total APV / Total Qty)
                if "price" in group.columns:
                    if total_qty > 0:
                        metrics["price"] = total_apv / total_qty
                    else:
                        metrics["price"] = group["price"].mean()
                
                # 计算加权 Gap % (Total Opportunity / Total APV)
                # 注意：这里假设 gap_percent 是小数 (0.1) 还是百分比 (10) 需要统一。目前代码里是去除 % 后转数字。
                if "gappercent" in group.columns:
                    total_opp = group["opportunity"].sum() if "opportunity" in group else 0
                    if total_apv > 0:
                        metrics["gappercent"] = (total_opp / total_apv) * 100
                    else:
                        metrics["gappercent"] = group["gappercent"].mean()
                
                return pd.Series(metrics)

            # 只有当存在需要加权的字段时才计算
            if any(col in df_cleaned.columns for col in ["price", "gappercent"]):
                weighted_metrics = grouped.apply(calculate_weighted_metrics).reset_index()
                # 合并回主表
                df_grouped = pd.merge(df_grouped, weighted_metrics, on=["pns", "supplier"], how="left")
            
            df_cleaned = df_grouped
        
        print(f"ETL Summary: Input rows={len(df)}, Output rows={len(df_cleaned)}")
        return df_cleaned
    
    def insert_records(self, session_id: str, df: pd.DataFrame) -> int:
        """
        批量插入采购记录
        """
        # 添加 session_id 列
        df["session_id"] = session_id
        
        # 数据库字段名 (snake_case)
        db_columns = [
            "session_id", "pns", "part_desc", "commodity", "supplier", "currency",
            "quantity", "price", "apv", "covered_apv",
            "target_cost", "target_spend", "gap_to_target", "opportunity", "gap_percent"
        ]
        
        # DataFrame 列名 (lower case standard fields)
        df_columns = [
            "session_id", "pns", "partdescription", "commodity", "supplier", "currency",
            "quantity", "price", "apv", "coveredapv",
            "targetcost", "targetspend", "gaptotarget", "opportunity", "gappercent"
        ]
        
        # 映射 DF 列到 DB 列
        df_final = pd.DataFrame()
        for db_col, df_col in zip(db_columns, df_columns):
            if df_col in df.columns:
                df_final[db_col] = df[df_col]
            else:
                # 填充默认值
                if db_col in ["pns", "part_desc", "commodity", "supplier", "currency"]:
                    df_final[db_col] = ""
                else:
                    df_final[db_col] = 0
        
        # 批量插入
        records = df_final.values.tolist()
        placeholders = ",".join(["?"] * len(db_columns))
        columns_str = ",".join(db_columns)
        
        self.conn.executemany(
            f"INSERT INTO procurement_records ({columns_str}) VALUES ({placeholders})",
            records
        )
        
        return len(records)
    
    def get_records_by_session(self, session_id: str) -> List[Dict[str, Any]]:
        """查询指定 Session 的所有记录"""
        result = self.conn.execute(
            "SELECT * FROM procurement_records WHERE session_id = ?",
            [session_id]
        ).fetchall()
        
        # 获取列名
        columns = [
            "session_id", "pns", "part_desc", "commodity", "supplier", "currency",
            "quantity", "price", "apv", "covered_apv",
            "target_cost", "target_spend", "gap_to_target", "opportunity", "gap_percent",
            "created_at"
        ]
        
        return [dict(zip(columns, row)) for row in result]
