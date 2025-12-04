from typing import List, Dict, Any
from app.schemas.cost_variance import (
    CostSheetData, CostTreeNode, MaterialItem, ComponentItem, ProcessItem
)

class CostTreeBuilder:
    """
    成本树构建器
    将平面的成本数据转换为5层树形结构
    """
    
    def __init__(self):
        self.node_counter = 0
    
    def build_tree(self, data: CostSheetData, view: str = 'by_process') -> CostTreeNode:
        """
        构建成本树
        
        Args:
            data: 解析后的成本表数据
            view: 视角 ('by_process' | 'by_type')
        
        Returns:
            CostTreeNode: 根节点
        """
        self.node_counter = 0
        
        # Level 1: 总采购成本 (ROOT)
        total_variance = data.supplier_price - data.target_price
        variance_pct = (total_variance / data.target_price * 100) if data.target_price != 0 else 0
        
        root = CostTreeNode(
            item_id="ROOT",
            item_name="Total Cost",
            level=1,
            category="Root",
            target_cost=data.target_price,
            actual_cost=data.supplier_price,
            variance=total_variance,
            variance_pct=variance_pct,
            sort_order=0,
            children=[]
        )
        
        # Level 2 节点
        manufacturing_node = self._create_manufacturing_node(data, view)
        sga_node = self._create_sga_node(data)
        profit_node = self._create_profit_node(data)
        other_node = self._create_other_costs_node(data)
        
        root.children = [manufacturing_node, sga_node, profit_node, other_node]
        
        return root
    
    def _create_manufacturing_node(self, data: CostSheetData, view: str) -> CostTreeNode:
        """创建生产成本节点 (Level 2)"""
        # 计算生产成本总额
        mat_target = sum(m.target_cost for m in data.materials)
        mat_actual = sum(m.actual_cost for m in data.materials)
        
        comp_target = sum(c.target_cost for c in data.components)
        comp_actual = sum(c.actual_cost for c in data.components)
        
        proc_target = sum(
            p.setup_cost_target + p.labor_cost_target + p.burden_cost_target
            for p in data.processes
        )
        proc_actual = sum(
            p.setup_cost_actual + p.labor_cost_actual + p.burden_cost_actual
            for p in data.processes
        )
        
        mfg_target = mat_target + comp_target + proc_target
        mfg_actual = mat_actual + comp_actual + proc_actual
        mfg_variance = mfg_actual - mfg_target
        mfg_variance_pct = (mfg_variance / data.target_price * 100) if data.target_price != 0 else 0
        
        mfg_node = CostTreeNode(
            item_id="MFG",
            item_name="Manufacturing Cost",
            level=2,
            category="Manufacturing",
            target_cost=mfg_target,
            actual_cost=mfg_actual,
            variance=mfg_variance,
            variance_pct=mfg_variance_pct,
            sort_order=1,
            children=[]
        )
        
        # Level 3: 原材料、外购件、加工成本
        material_node = self._create_material_tree(data.materials, data.target_price)
        component_node = self._create_component_tree(data.components, data.target_price)
        process_node = self._create_processing_tree(data.processes, data.target_price, view)
        
        mfg_node.children = [material_node, component_node, process_node]
        
        return mfg_node
    
    def _create_material_tree(self, materials: List[MaterialItem], total_target: float) -> CostTreeNode:
        """创建原材料成本树 (Level 3 + 4)"""
        mat_target = sum(m.target_cost for m in materials)
        mat_actual = sum(m.actual_cost for m in materials)
        mat_variance = mat_actual - mat_target
        mat_variance_pct = (mat_variance / total_target * 100) if total_target != 0 else 0
        
        mat_node = CostTreeNode(
            item_id="MAT",
            item_name="Material Cost",
            level=3,
            category="Material",
            target_cost=mat_target,
            actual_cost=mat_actual,
            variance=mat_variance,
            variance_pct=mat_variance_pct,
            sort_order=1,
            children=[]
        )
        
        # Level 4: 各项原材料
        for idx, mat in enumerate(materials):
            variance = mat.actual_cost - mat.target_cost
            variance_pct = (variance / total_target * 100) if total_target != 0 else 0
            
            mat_item_node = CostTreeNode(
                item_id=f"MAT_{idx+1:03d}",
                item_name=mat.description,
                level=4,
                category="Material",
                target_cost=mat.target_cost,
                actual_cost=mat.actual_cost,
                variance=variance,
                variance_pct=variance_pct,
                sort_order=idx + 1,
                children=[]
            )
            mat_node.children.append(mat_item_node)
        
        return mat_node
    
    def _create_component_tree(self, components: List[ComponentItem], total_target: float) -> CostTreeNode:
        """创建外购件成本树 (Level 3 + 4)"""
        comp_target = sum(c.target_cost for c in components)
        comp_actual = sum(c.actual_cost for c in components)
        comp_variance = comp_actual - comp_target
        comp_variance_pct = (comp_variance / total_target * 100) if total_target != 0 else 0
        
        comp_node = CostTreeNode(
            item_id="COMP",
            item_name="Purchased Components Cost",
            level=3,
            category="Component",
            target_cost=comp_target,
            actual_cost=comp_actual,
            variance=comp_variance,
            variance_pct=comp_variance_pct,
            sort_order=2,
            children=[]
        )
        
        # Level 4: 各项外购件
        for idx, comp in enumerate(components):
            variance = comp.actual_cost - comp.target_cost
            variance_pct = (variance / total_target * 100) if total_target != 0 else 0
            
            comp_item_node = CostTreeNode(
                item_id=f"COMP_{idx+1:03d}",
                item_name=comp.description,
                level=4,
                category="Component",
                target_cost=comp.target_cost,
                actual_cost=comp.actual_cost,
                variance=variance,
                variance_pct=variance_pct,
                sort_order=idx + 1,
                children=[]
            )
            comp_node.children.append(comp_item_node)
        
        return comp_node
    
    def _create_processing_tree(self, processes: List[ProcessItem], total_target: float, view: str) -> CostTreeNode:
        """
        创建加工成本树 (Level 3 + 4 + 5)
        支持双视角切换
        """
        proc_target = sum(
            p.setup_cost_target + p.labor_cost_target + p.burden_cost_target
            for p in processes
        )
        proc_actual = sum(
            p.setup_cost_actual + p.labor_cost_actual + p.burden_cost_actual
            for p in processes
        )
        proc_variance = proc_actual - proc_target
        proc_variance_pct = (proc_variance / total_target * 100) if total_target != 0 else 0
        
        proc_node = CostTreeNode(
            item_id="PROC",
            item_name="Processing Cost",
            level=3,
            category="Process",
            target_cost=proc_target,
            actual_cost=proc_actual,
            variance=proc_variance,
            variance_pct=proc_variance_pct,
            sort_order=3,
            children=[]
        )
        
        if view == 'by_process':
            proc_node.children = self._create_by_process_view(processes, total_target)
        else:  # by_type
            proc_node.children = self._create_by_type_view(processes, total_target)
        
        return proc_node
    
    def _create_by_process_view(self, processes: List[ProcessItem], total_target: float) -> List[CostTreeNode]:
        """视角1: 按工序分组 (Level 4 → Level 5: 设置/人工/间接)"""
        process_nodes = []
        
        for idx, proc in enumerate(processes):
            proc_target = proc.setup_cost_target + proc.labor_cost_target + proc.burden_cost_target
            proc_actual = proc.setup_cost_actual + proc.labor_cost_actual + proc.burden_cost_actual
            proc_variance = proc_actual - proc_target
            proc_variance_pct = (proc_variance / total_target * 100) if total_target != 0 else 0
            
            proc_node = CostTreeNode(
                item_id=f"PROC_{idx+1:03d}",
                item_name=proc.operation_desc,
                level=4,
                category="Process",
                target_cost=proc_target,
                actual_cost=proc_actual,
                variance=proc_variance,
                variance_pct=proc_variance_pct,
                sort_order=idx + 1,
                metadata={"equipment": proc.equipment_desc},
                children=[]
            )
            
            # Level 5: 设置成本、直接人工、间接成本
            setup_var = proc.setup_cost_actual - proc.setup_cost_target
            labor_var = proc.labor_cost_actual - proc.labor_cost_target
            burden_var = proc.burden_cost_actual - proc.burden_cost_target
            
            proc_node.children = [
                CostTreeNode(
                    item_id=f"PROC_{idx+1:03d}_SETUP",
                    item_name="Setup Cost",
                    level=5,
                    category="ProcessSetup",
                    target_cost=proc.setup_cost_target,
                    actual_cost=proc.setup_cost_actual,
                    variance=setup_var,
                    variance_pct=(setup_var / total_target * 100) if total_target != 0 else 0,
                    sort_order=1,
                    children=[]
                ),
                CostTreeNode(
                    item_id=f"PROC_{idx+1:03d}_LABOR",
                    item_name="Direct Labor Cost",
                    level=5,
                    category="ProcessLabor",
                    target_cost=proc.labor_cost_target,
                    actual_cost=proc.labor_cost_actual,
                    variance=labor_var,
                    variance_pct=(labor_var / total_target * 100) if total_target != 0 else 0,
                    sort_order=2,
                    children=[]
                ),
                CostTreeNode(
                    item_id=f"PROC_{idx+1:03d}_BURDEN",
                    item_name="Burden Cost",
                    level=5,
                    category="ProcessBurden",
                    target_cost=proc.burden_cost_target,
                    actual_cost=proc.burden_cost_actual,
                    variance=burden_var,
                    variance_pct=(burden_var / total_target * 100) if total_target != 0 else 0,
                    sort_order=3,
                    children=[]
                )
            ]
            
            process_nodes.append(proc_node)
        
        return process_nodes
    
    def _create_by_type_view(self, processes: List[ProcessItem], total_target: float) -> List[CostTreeNode]:
        """视角2: 按成本类型分组 (Level 4: 设置总计/人工总计/间接总计 → Level 5: 各工序)"""
        # 计算各类型总计
        setup_target_total = sum(p.setup_cost_target for p in processes)
        setup_actual_total = sum(p.setup_cost_actual for p in processes)
        labor_target_total = sum(p.labor_cost_target for p in processes)
        labor_actual_total = sum(p.labor_cost_actual for p in processes)
        burden_target_total = sum(p.burden_cost_target for p in processes)
        burden_actual_total = sum(p.burden_cost_actual for p in processes)
        
        # Level 4: 设置成本总计
        setup_node = CostTreeNode(
            item_id="PROC_SETUP_TOTAL",
            item_name="Setup Cost Total",
            level=4,
            category="ProcessSetup",
            target_cost=setup_target_total,
            actual_cost=setup_actual_total,
            variance=setup_actual_total - setup_target_total,
            variance_pct=((setup_actual_total - setup_target_total) / total_target * 100) if total_target != 0 else 0,
            sort_order=1,
            children=[
                CostTreeNode(
                    item_id=f"SETUP_{idx+1:03d}",
                    item_name=proc.operation_desc,
                    level=5,
                    category="ProcessSetup",
                    target_cost=proc.setup_cost_target,
                    actual_cost=proc.setup_cost_actual,
                    variance=proc.setup_cost_actual - proc.setup_cost_target,
                    variance_pct=((proc.setup_cost_actual - proc.setup_cost_target) / total_target * 100) if total_target != 0 else 0,
                    sort_order=idx + 1,
                    children=[]
                )
                for idx, proc in enumerate(processes)
            ]
        )
        
        # Level 4: 直接人工总计
        labor_node = CostTreeNode(
            item_id="PROC_LABOR_TOTAL",
            item_name="Direct Labor Cost Total",
            level=4,
            category="ProcessLabor",
            target_cost=labor_target_total,
            actual_cost=labor_actual_total,
            variance=labor_actual_total - labor_target_total,
            variance_pct=((labor_actual_total - labor_target_total) / total_target * 100) if total_target != 0 else 0,
            sort_order=2,
            children=[
                CostTreeNode(
                    item_id=f"LABOR_{idx+1:03d}",
                    item_name=proc.operation_desc,
                    level=5,
                    category="ProcessLabor",
                    target_cost=proc.labor_cost_target,
                    actual_cost=proc.labor_cost_actual,
                    variance=proc.labor_cost_actual - proc.labor_cost_target,
                    variance_pct=((proc.labor_cost_actual - proc.labor_cost_target) / total_target * 100) if total_target != 0 else 0,
                    sort_order=idx + 1,
                    children=[]
                )
                for idx, proc in enumerate(processes)
            ]
        )
        
        # Level 4: 间接成本总计
        burden_node = CostTreeNode(
            item_id="PROC_BURDEN_TOTAL",
            item_name="Burden Cost Total",
            level=4,
            category="ProcessBurden",
            target_cost=burden_target_total,
            actual_cost=burden_actual_total,
            variance=burden_actual_total - burden_target_total,
            variance_pct=((burden_actual_total - burden_target_total) / total_target * 100) if total_target != 0 else 0,
            sort_order=3,
            children=[
                CostTreeNode(
                    item_id=f"BURDEN_{idx+1:03d}",
                    item_name=proc.operation_desc,
                    level=5,
                    category="ProcessBurden",
                    target_cost=proc.burden_cost_target,
                    actual_cost=proc.burden_cost_actual,
                    variance=proc.burden_cost_actual - proc.burden_cost_target,
                    variance_pct=((proc.burden_cost_actual - proc.burden_cost_target) / total_target * 100) if total_target != 0 else 0,
                    sort_order=idx + 1,
                    children=[]
                )
                for idx, proc in enumerate(processes)
            ]
        )
        
        return [setup_node, labor_node, burden_node]
    
    def _create_sga_node(self, data: CostSheetData) -> CostTreeNode:
        """创建管理费用节点 (Level 2)"""
        variance = data.sga.total_sga_actual - data.sga.total_sga_target
        variance_pct = (variance / data.target_price * 100) if data.target_price != 0 else 0
        
        return CostTreeNode(
            item_id="SGA",
            item_name="SG&A Allocation",
            level=2,
            category="SGA",
            target_cost=data.sga.total_sga_target,
            actual_cost=data.sga.total_sga_actual,
            variance=variance,
            variance_pct=variance_pct,
            sort_order=2,
            metadata={
                "material_rate": data.sga.material_sga_rate,
                "component_rate": data.sga.component_sga_rate,
                "manufacturing_rate": data.sga.manufacturing_sga_rate
            },
            children=[]
        )
    
    def _create_profit_node(self, data: CostSheetData) -> CostTreeNode:
        """创建供应商利润节点 (Level 2)"""
        variance = data.profit.total_profit_actual - data.profit.total_profit_target
        variance_pct = (variance / data.target_price * 100) if data.target_price != 0 else 0
        
        return CostTreeNode(
            item_id="PROFIT",
            item_name="Supplier Profit",
            level=2,
            category="Profit",
            target_cost=data.profit.total_profit_target,
            actual_cost=data.profit.total_profit_actual,
            variance=variance,
            variance_pct=variance_pct,
            sort_order=3,
            metadata={
                "material_rate": data.profit.material_profit_rate,
                "component_rate": data.profit.component_profit_rate,
                "manufacturing_rate": data.profit.manufacturing_profit_rate
            },
            children=[]
        )
    
    def _create_other_costs_node(self, data: CostSheetData) -> CostTreeNode:
        """创建其他成本节点 (Level 2 + 3)"""
        other_target = sum(c.target_cost for c in data.other_costs)
        other_actual = sum(c.actual_cost for c in data.other_costs)
        other_variance = other_actual - other_target
        other_variance_pct = (other_variance / data.target_price * 100) if data.target_price != 0 else 0
        
        other_node = CostTreeNode(
            item_id="OTHER",
            item_name="Other Costs",
            level=2,
            category="Other",
            target_cost=other_target,
            actual_cost=other_actual,
            variance=other_variance,
            variance_pct=other_variance_pct,
            sort_order=4,
            children=[]
        )
        
        # Level 3: 各项其他成本
        for idx, cost in enumerate(data.other_costs):
            variance = cost.actual_cost - cost.target_cost
            variance_pct = (variance / data.target_price * 100) if data.target_price != 0 else 0
            
            cost_node = CostTreeNode(
                item_id=f"OTHER_{idx+1:03d}",
                item_name=cost.cost_name,
                level=3,
                category="Other",
                target_cost=cost.target_cost,
                actual_cost=cost.actual_cost,
                variance=variance,
                variance_pct=variance_pct,
                sort_order=idx + 1,
                children=[]
            )
            other_node.children.append(cost_node)
        
        return other_node
