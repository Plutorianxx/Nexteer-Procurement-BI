import pandas as pd
import hashlib
import io
from Levenshtein import ratio
from typing import List, Dict, Any
from app.schemas.upload import ColumnMapping, UploadResponse

# 标准字段定义 (参考 PRD)
STANDARD_FIELDS = [
    "PNs", "Commodity", "Supplier", "Quantity", 
    "APV", "TargetSpend", "Opportunity"
]

class ExcelParser:
    def __init__(self):
        self.standard_fields = STANDARD_FIELDS
        # 预定义同义词库 (小写 -> 标准字段)
        self.synonyms = {
            "qty": "Quantity",
            "amount": "Quantity",
            "vol": "Quantity",
            "volume": "Quantity",
            "supp": "Supplier",
            "vendor": "Supplier",
            "mfr": "Supplier",
            "manufacturer": "Supplier",
            "annual spend": "APV",
            "spend": "APV",
            "cost": "APV",
            "part number": "PNs",
            "pn": "PNs",
            "part": "PNs",
            "material": "PNs",
            "diff": "Opportunity",
            "gap": "Opportunity",
            "saving": "Opportunity"
        }

    def calculate_hash(self, file_content: bytes) -> str:
        return hashlib.sha256(file_content).hexdigest()

    def parse_file(self, file_content: bytes, filename: str) -> UploadResponse:
        # 1. 读取文件
        if filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(file_content))
        else:
            # 读取 Excel，先不指定 header
            df_raw = pd.read_excel(io.BytesIO(file_content), header=None)
            
            # 检测实际表头位置：查找包含 "PNs" 或其他关键字段的行
            header_row_idx = 0
            for idx, row in df_raw.iterrows():
                # 如果该行包含多个标准字段名（或同义词），则为表头
                row_str = ' '.join(row.astype(str).tolist()).lower()
                if any(field in row_str for field in ['pns', 'qty', 'supplier', 'commodity']):
                    header_row_idx = idx
                    break
            
            # 使用检测到的表头重新读取
            df = pd.read_excel(io.BytesIO(file_content), header=header_row_idx)
        
        # 2. 基础清洗
        df = df.fillna("")  # 填充空值
        
        # 3. 智能映射
        headers = df.columns.tolist()
        mappings = self._generate_mappings(headers)
        
        # 4. 生成预览数据 (前5行)
        preview = df.head(5).to_dict(orient='records')
        
        return UploadResponse(
            filename=filename,
            file_hash=self.calculate_hash(file_content),
            total_rows=len(df),
            columns=headers,
            mapping_suggestions=mappings,
            preview_data=preview
        )

    def _generate_mappings(self, headers: List[str]) -> List[ColumnMapping]:
        mappings = []
        for header in headers:
            header_lower = header.lower().strip()
            best_match = None
            max_score = 0.0
            
            # 策略1: 精确匹配同义词
            if header_lower in self.synonyms:
                best_match = self.synonyms[header_lower]
                max_score = 1.0
            else:
                # 策略2: Levenshtein 模糊匹配
                for field in self.standard_fields:
                    score = ratio(header_lower, field.lower())
                    if score > max_score:
                        max_score = score
                        best_match = field
            
            # 阈值判定 (0.8)
            is_mapped = max_score >= 0.8
            mappings.append(ColumnMapping(
                original_header=header,
                mapped_field=best_match if is_mapped else None,
                confidence=round(max_score, 2),
                is_mapped=is_mapped
            ))
        return mappings
