from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# ============ 基础成本项模型 ============

class MaterialItem(BaseModel):
    """原材料项"""
    description: str
    target_cost: float
    actual_cost: float

class ComponentItem(BaseModel):
    """外购零部件项"""
    description: str
    quantity_per_assembly: float = 0
    target_cost: float
    actual_cost: float

class ProcessItem(BaseModel):
    """加工工序项"""
    operation_desc: str
    equipment_desc: str = ""
    setup_cost_target: float
    setup_cost_actual: float
    labor_cost_target: float
    labor_cost_actual: float
    burden_cost_target: float
    burden_cost_actual: float

class SGAItem(BaseModel):
    """管理费用分摊"""
    material_sga_rate: float
    component_sga_rate: float
    manufacturing_sga_rate: float
    total_sga_target: float
    total_sga_actual: float

class ProfitItem(BaseModel):
    """供应商利润"""
    material_profit_rate: float
    component_profit_rate: float
    manufacturing_profit_rate: float
    total_profit_target: float
    total_profit_actual: float

class OtherCostItem(BaseModel):
    """其他零星成本"""
    cost_name: str
    target_cost: float
    actual_cost: float

# ============ 完整成本表数据 ============

class CostSheetData(BaseModel):
    """解析后的完整成本表数据"""
    part_number: str
    part_description: str
    supplier_name: str
    currency: str
    target_price: float
    supplier_price: float
    materials: List[MaterialItem]
    components: List[ComponentItem]
    processes: List[ProcessItem]
    sga: SGAItem
    profit: ProfitItem
    other_costs: List[OtherCostItem]

# ============ 成本树节点模型 ============

class CostTreeNode(BaseModel):
    """成本树节点"""
    item_id: str
    item_name: str
    level: int
    category: str  # Material, Component, Process, SGA, Profit, Other, Root
    target_cost: float
    actual_cost: float
    variance: float
    variance_pct: float
    sort_order: int = 0
    metadata: Optional[Dict[str, Any]] = None
    children: List['CostTreeNode'] = []

# 递归更新，支持children
CostTreeNode.model_rebuild()

# ============ API 请求/响应模型 ============

class UploadCostSheetResponse(BaseModel):
    """上传成本表响应"""
    session_id: str
    part_number: str
    part_description: str
    supplier_name: str
    currency: str
    target_price: float
    supplier_price: float
    total_variance: float
    variance_pct: float

class GetCostTreeResponse(BaseModel):
    """获取成本树响应"""
    session_id: str
    view: str  # by_process or by_type
    tree: CostTreeNode

class SessionInfo(BaseModel):
    """会话信息"""
    session_id: str
    part_number: str
    part_description: str
    supplier_name: str
    target_price: float
    supplier_price: float
    total_variance: float
    variance_pct: float
    upload_time: datetime
    file_name: str

class GetSessionsResponse(BaseModel):
    """获取会话列表响应"""
    sessions: List[SessionInfo]
