import pandas as pd
import numpy as np
from typing import List, Dict, Any
from app.schemas.cost_variance import (
    CostSheetData, MaterialItem, ComponentItem, ProcessItem,
    SGAItem, ProfitItem, OtherCostItem
)

class CostSheetParser:
    """
    固定格式成本表解析器
    基于PRD定义的固定行号提取数据
    """
    
    def __init__(self):
        # 固定行号映射 (Excel显示行号，转为0-indexed)
        self.rows = {
            # 基本信息
            'sell_price': 42 - 1,  # 第42行 → index 41
            'supplier_name': 44 - 1,
            'part_desc': 48 - 1,
            'part_number': 49 - 1,
            
            # 原材料 (58-187行，每13行一项)
            'material_start': 58 - 1,
            'material_end': 187 - 1,
            'material_cycle': 13,
            
            # 外购件 (194-693行，每10行一项)
            'component_start': 194 - 1,
            'component_end': 693 - 1,
            'component_cycle': 10,
            
            # 加工成本 (699-1850行，每23行一项)
            'process_start': 699 - 1,
            'process_end': 1850 - 1,
            'process_cycle': 23,
            
            # 管理费用 (1881-1884行)
            'sga_start': 1881 - 1,
            
            # 利润 (1887-1890行)
            'profit_start': 1887 - 1,
            
            # 其他成本 (1894-1897行)
            'other_start': 1894 - 1,
            
            # 总成本 (1898行)
            'total_cost': 1898 - 1
        }
        
        # 列索引 (0-indexed)
        self.cols = {
            'label': 4,  # E列 (行标签)
            'target': 7,  # H列 (目标成本)
            'actual': 8   # I列 (实际成本)
        }
    
    def parse(self, file_path_or_bytes) -> CostSheetData:
        """
        解析成本表
        
        Args:
            file_path_or_bytes: 文件路径或bytes内容
        
        Returns:
            CostSheetData: 解析后的结构化数据
        """
        # 读取Excel (不指定header，使用固定行号)
        if isinstance(file_path_or_bytes, bytes):
            df = pd.read_excel(file_path_or_bytes, header=None)
        else:
            df = pd.read_excel(file_path_or_bytes, header=None)
        
        # 提取基本信息
        basic_info = self._extract_basic_info(df)
        
        # 提取各成本项
        materials = self._extract_materials(df)
        components = self._extract_components(df)
        processes = self._extract_processes(df)
        sga = self._extract_sga(df)
        profit = self._extract_profit(df)
        other_costs = self._extract_other_costs(df)
        
        return CostSheetData(
            part_number=basic_info['part_number'],
            part_description=basic_info['part_description'],
            supplier_name=basic_info['supplier_name'],
            currency=basic_info['currency'],
            target_price=basic_info['target_price'],
            supplier_price=basic_info['supplier_price'],
            materials=materials,
            components=components,
            processes=processes,
            sga=sga,
            profit=profit,
            other_costs=other_costs
        )
    
    def _extract_basic_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """提取基本信息 (42-55行)"""
        return {
            'sell_price_label': self._safe_get(df, self.rows['sell_price'], self.cols['label']),
            'target_price': self._safe_float(df, self.rows['sell_price'], self.cols['target']),
            'supplier_price': self._safe_float(df, self.rows['sell_price'], self.cols['actual']),
            'supplier_name': self._safe_get(df, self.rows['supplier_name'], self.cols['actual']),
            'part_description': self._safe_get(df, self.rows['part_desc'], self.cols['actual']),
            'part_number': self._safe_get(df, self.rows['part_number'], self.cols['actual']),
            'currency': 'USD'  # 可从单元格进一步提取
        }
    
    def _extract_materials(self, df: pd.DataFrame) -> List[MaterialItem]:
        """
        提取原材料成本 (58-187行，每13行一项)
        每项的第1行为描述，第12行为成本
        """
        materials = []
        start = self.rows['material_start']
        end = self.rows['material_end']
        cycle = self.rows['material_cycle']
        
        for i in range(start, end + 1, cycle):
            if i + 12 > df.shape[0]:  # 防止越界
                break
            
            # E列: 基础描述 (用于判断是否为空行)
            base_desc = self._safe_get(df, i, self.cols['label'])
            
            # H列: Regional值
            regional_val = self._safe_get(df, i, self.cols['target'])
            # I列: Supplier值
            supplier_val = self._safe_get(df, i, self.cols['actual'])
            
            # 构造新描述
            if regional_val or supplier_val:
                mat_desc = f'Regional: "{regional_val}" vs Supplier: "{supplier_val}"'
            else:
                mat_desc = base_desc
            
            # 第12行: 材料成本 (相对偏移11)
            target_cost = self._safe_float(df, i + 11, self.cols['target'])
            actual_cost = self._safe_float(df, i + 11, self.cols['actual'])
            
            # 过滤空行 (只要E列有值就认为有效)
            if base_desc and base_desc.strip():
                materials.append(MaterialItem(
                    description=mat_desc,
                    target_cost=target_cost,
                    actual_cost=actual_cost
                ))
        
        return materials
    
    def _extract_components(self, df: pd.DataFrame) -> List[ComponentItem]:
        """
        提取外购零部件成本 (194-693行，每10行一项)
        每项的第1行为描述，第9行为成本
        """
        components = []
        start = self.rows['component_start']
        end = self.rows['component_end']
        cycle = self.rows['component_cycle']
        
        for i in range(start, end + 1, cycle):
            if i + 9 > df.shape[0]:
                break
            
            # E列: 基础描述
            base_desc = self._safe_get(df, i, self.cols['label'])
            
            # H列 & I列
            regional_val = self._safe_get(df, i, self.cols['target'])
            supplier_val = self._safe_get(df, i, self.cols['actual'])
            
            if regional_val or supplier_val:
                comp_desc = f'Regional: "{regional_val}" vs Supplier: "{supplier_val}"'
            else:
                comp_desc = base_desc
            
            # 第9行: 零部件成本
            target_cost = self._safe_float(df, i + 8, self.cols['target'])
            actual_cost = self._safe_float(df, i + 8, self.cols['actual'])
            
            if base_desc and base_desc.strip():
                components.append(ComponentItem(
                    description=comp_desc,
                    target_cost=target_cost,
                    actual_cost=actual_cost
                ))
        
        return components
    
    def _extract_processes(self, df: pd.DataFrame) -> List[ProcessItem]:
        """
        提取加工成本 (699-1850行，每23行一项)
        每项的:
        - 第5行: 设置成本
        - 第6行: 工序描述
        - 第7行: 设备描述
        - 第16行: 直接人工成本
        - 第20行: 间接成本
        """
        processes = []
        start = self.rows['process_start']
        end = self.rows['process_end']
        cycle = self.rows['process_cycle']
        
        for i in range(start, end + 1, cycle):
            if i + 23 > df.shape[0]:
                break
            
            # 第6行: 工序描述 (相对偏移5) - E列
            base_op_desc = self._safe_get(df, i + 5, self.cols['label'])
            
            # H列 & I列 (相对偏移5)
            regional_val = self._safe_get(df, i + 5, self.cols['target'])
            supplier_val = self._safe_get(df, i + 5, self.cols['actual'])
            
            if regional_val or supplier_val:
                operation_desc = f'Regional: "{regional_val}" vs Supplier: "{supplier_val}"'
            else:
                operation_desc = base_op_desc
            
            # 第7行: 设备描述 (相对偏移6)
            equipment_desc = self._safe_get(df, i + 6, self.cols['label'])
            
            # 第5行: 设置成本 (相对偏移4)
            setup_target = self._safe_float(df, i + 4, self.cols['target'])
            setup_actual = self._safe_float(df, i + 4, self.cols['actual'])
            
            # 第16行: 直接人工成本 (相对偏移15)
            labor_target = self._safe_float(df, i + 15, self.cols['target'])
            labor_actual = self._safe_float(df, i + 15, self.cols['actual'])
            
            # 第20行: 间接成本 (相对偏移19)
            burden_target = self._safe_float(df, i + 19, self.cols['target'])
            burden_actual = self._safe_float(df, i + 19, self.cols['actual'])
            
            if base_op_desc and base_op_desc.strip():
                processes.append(ProcessItem(
                    operation_desc=operation_desc,
                    equipment_desc=equipment_desc or "",
                    setup_cost_target=setup_target,
                    setup_cost_actual=setup_actual,
                    labor_cost_target=labor_target,
                    labor_cost_actual=labor_actual,
                    burden_cost_target=burden_target,
                    burden_cost_actual=burden_actual
                ))
        
        return processes
    
    def _extract_sga(self, df: pd.DataFrame) -> SGAItem:
        """提取管理费用分摊 (1881-1884行)"""
        start = self.rows['sga_start']
        
        # 1881-1883行: 各项分摊率
        material_rate = self._safe_float(df, start, self.cols['target'])
        component_rate = self._safe_float(df, start + 1, self.cols['target'])
        manufacturing_rate = self._safe_float(df, start + 2, self.cols['target'])
        
        # 1884行: 总分摊金额
        total_target = self._safe_float(df, start + 3, self.cols['target'])
        total_actual = self._safe_float(df, start + 3, self.cols['actual'])
        
        return SGAItem(
            material_sga_rate=material_rate,
            component_sga_rate=component_rate,
            manufacturing_sga_rate=manufacturing_rate,
            total_sga_target=total_target,
            total_sga_actual=total_actual
        )
    
    def _extract_profit(self, df: pd.DataFrame) -> ProfitItem:
        """提取供应商利润 (1887-1890行)"""
        start = self.rows['profit_start']
        
        # 1887-1889行: 各项利润率
        material_rate = self._safe_float(df, start, self.cols['target'])
        component_rate = self._safe_float(df, start + 1, self.cols['target'])
        manufacturing_rate = self._safe_float(df, start + 2, self.cols['target'])
        
        # 1890行: 总利润
        total_target = self._safe_float(df, start + 3, self.cols['target'])
        total_actual = self._safe_float(df, start + 3, self.cols['actual'])
        
        return ProfitItem(
            material_profit_rate=material_rate,
            component_profit_rate=component_rate,
            manufacturing_profit_rate=manufacturing_rate,
            total_profit_target=total_target,
            total_profit_actual=total_actual
        )
    
    def _extract_other_costs(self, df: pd.DataFrame) -> List[OtherCostItem]:
        """提取其他零星成本 (1894-1897行)"""
        start = self.rows['other_start']
        cost_names = [
            "Process Scrap Cost",
            "Packaging Cost",
            "Freight + Warehouse Cost",
            "Amortization Cost + Customs, Duties, Taxes & Fees"
        ]
        
        other_costs = []
        for i, name in enumerate(cost_names):
            target = self._safe_float(df, start + i, self.cols['target'])
            actual = self._safe_float(df, start + i, self.cols['actual'])
            other_costs.append(OtherCostItem(
                cost_name=name,
                target_cost=target,
                actual_cost=actual
            ))
        
        return other_costs
    
    def _safe_get(self, df: pd.DataFrame, row: int, col: int, default: str = "") -> str:
        """安全获取单元格值（字符串）"""
        try:
            if row >= df.shape[0] or col >= df.shape[1]:
                return default
            val = df.iloc[row, col]
            if pd.isna(val):
                return default
            return str(val).strip()
        except Exception:
            return default
    
    def _safe_float(self, df: pd.DataFrame, row: int, col: int, default: float = 0.0) -> float:
        """安全获取单元格值（数字）"""
        try:
            if row >= df.shape[0] or col >= df.shape[1]:
                return default
            val = df.iloc[row, col]
            if pd.isna(val):
                return default
            return float(val)
        except Exception:
            return default
