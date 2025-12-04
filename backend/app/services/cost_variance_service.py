import hashlib
import uuid
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from io import BytesIO
from app.database.init import get_connection
from app.services.cost_sheet_parser import CostSheetParser
from app.services.cost_tree_builder import CostTreeBuilder
from app.schemas.cost_variance import (
    CostSheetData, CostTreeNode, UploadCostSheetResponse, 
    GetCostTreeResponse, SessionInfo, GetSessionsResponse
)

class CostVarianceService:
    """
    成本差异分析服务
    负责上传、解析、存储和检索成本差异数据
    """
    
    def __init__(self):
        self.parser = CostSheetParser()
        self.tree_builder = CostTreeBuilder()
        self.conn = get_connection()
    
    def process_upload(self, file_content: bytes, filename: str) -> UploadCostSheetResponse:
        """
        处理成本表上传
        
        Args:
            file_content: Excel文件内容
            filename: 文件名
        
        Returns:
            UploadCostSheetResponse: 上传响应
        """
        # 1. 计算文件哈希
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # 2. 解析Excel
        parsed_data = self.parser.parse(BytesIO(file_content))
        
        # 3. 生成session_id
        session_id = str(uuid.uuid4())
        
        # 4. 保存会话信息
        self._save_session(session_id, parsed_data, filename, file_hash)
        
        # 5. 构建并保存成本树 (两种视角都保存)
        tree_by_process = self.tree_builder.build_tree(parsed_data, view='by_process')
        tree_by_type = self.tree_builder.build_tree(parsed_data, view='by_type')
        
        self._save_cost_tree(session_id, tree_by_process, view='by_process')
        self._save_cost_tree(session_id, tree_by_type, view='by_type')
        
        # 6. 保存加工成本分解
        self._save_processing_breakdown(session_id, parsed_data)
        
        # 7. 返回响应
        total_variance = parsed_data.supplier_price - parsed_data.target_price
        variance_pct = (total_variance / parsed_data.target_price * 100) if parsed_data.target_price != 0 else 0
        
        return UploadCostSheetResponse(
            session_id=session_id,
            part_number=parsed_data.part_number,
            part_description=parsed_data.part_description,
            supplier_name=parsed_data.supplier_name,
            currency=parsed_data.currency,
            target_price=parsed_data.target_price,
            supplier_price=parsed_data.supplier_price,
            total_variance=total_variance,
            variance_pct=variance_pct
        )
    
    def get_cost_tree(self, session_id: str, view: str = 'by_process') -> GetCostTreeResponse:
        """
        获取成本树
        
        Args:
            session_id: 会话ID
            view: 视角 (by_process | by_type)
        
        Returns:
            GetCostTreeResponse: 成本树响应
        """
        tree = self._load_tree_from_db(session_id, view)
        
        return GetCostTreeResponse(
            session_id=session_id,
            view=view,
            tree=tree
        )
    
    def get_sessions(self, limit: int = 10) -> GetSessionsResponse:
        """
        获取历史会话列表
        
        Args:
            limit: 返回数量
        
        Returns:
            GetSessionsResponse: 会话列表
        """
        query = """
        SELECT session_id, part_number, part_description, supplier_name,
               target_price, supplier_price, total_variance, variance_pct,
               upload_time, file_name
        FROM part_cost_sessions
        ORDER BY upload_time DESC
        LIMIT ?
        """
        
        results = self.conn.execute(query, [limit]).fetchall()
        
        sessions = [
            SessionInfo(
                session_id=row[0],
                part_number=row[1],
                part_description=row[2],
                supplier_name=row[3],
                target_price=float(row[4]),
                supplier_price=float(row[5]),
                total_variance=float(row[6]),
                variance_pct=float(row[7]),
                upload_time=row[8],
                file_name=row[9]
            )
            for row in results
        ]
        
        return GetSessionsResponse(sessions=sessions)
    
    def get_session_info(self, session_id: str) -> Optional[SessionInfo]:
        """获取单个会话信息"""
        query = """
        SELECT session_id, part_number, part_description, supplier_name,
               target_price, supplier_price, total_variance, variance_pct,
               upload_time, file_name
        FROM part_cost_sessions
        WHERE session_id = ?
        """
        
        result = self.conn.execute(query, [session_id]).fetchone()
        
        if not result:
            return None
        
        return SessionInfo(
            session_id=result[0],
            part_number=result[1],
            part_description=result[2],
            supplier_name=result[3],
            target_price=float(result[4]),
            supplier_price=float(result[5]),
            total_variance=float(result[6]),
            variance_pct=float(result[7]),
            upload_time=result[8],
            file_name=result[9]
        )
    
    def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        try:
            # 删除成本项
            self.conn.execute("DELETE FROM cost_items WHERE session_id = ?", [session_id])
            # 删除加工成本分解
            self.conn.execute("DELETE FROM processing_breakdown WHERE session_id = ?", [session_id])
            # 删除会话
            self.conn.execute("DELETE FROM part_cost_sessions WHERE session_id = ?", [session_id])
            return True
        except Exception:
            return False
    
    # ============ 私有方法：数据库操作 ============
    
    def _save_session(self, session_id: str, data: CostSheetData, filename: str, file_hash: str):
        """保存会话信息到 part_cost_sessions 表"""
        total_variance = data.supplier_price - data.target_price
        variance_pct = (total_variance / data.target_price * 100) if data.target_price != 0 else 0
        
        query = """
        INSERT INTO part_cost_sessions (
            session_id, part_number, part_description, supplier_name, currency,
            target_price, supplier_price, total_variance, variance_pct,
            upload_time, file_name, file_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
        """
        
        self.conn.execute(query, [
            session_id,
            data.part_number,
            data.part_description,
            data.supplier_name,
            data.currency,
            data.target_price,
            data.supplier_price,
            total_variance,
            variance_pct,
            filename,
            file_hash
        ])
    
    def _save_cost_tree(self, session_id: str, tree: CostTreeNode, view: str):
        """
        将成本树保存到 cost_items 表
        使用递归展平树结构
        """
        items = []
        self._flatten_tree(tree, session_id, view, items)
        
        query = """
        INSERT INTO cost_items (
            id, session_id, item_id, parent_id, level, category, item_name,
            target_cost, actual_cost, variance, variance_pct, sort_order, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        import hashlib
        for idx, item in enumerate(items):
            # 使用session_id+view+item_id生成唯一的数字ID
            unique_str = f"{session_id}_{view}_{item['item_id']}_{idx}"
            unique_id = int(hashlib.md5(unique_str.encode()).hexdigest()[:15], 16)  # 取前15位16进制转为整数
            
            self.conn.execute(query, [
                unique_id,  # 使用唯一ID
                item['session_id'],
                f"{view}_{item['item_id']}",  # 加前缀区分视角
                f"{view}_{item['parent_id']}" if item['parent_id'] else None,
                item['level'],
                item['category'],
                item['item_name'],
                item['target_cost'],
                item['actual_cost'],
                item['variance'],
                item['variance_pct'],
                item['sort_order'],
                json.dumps(item['metadata']) if item['metadata'] else None
            ])
    
    def _flatten_tree(self, node: CostTreeNode, session_id: str, view: str, items: List[Dict], parent_id: Optional[str] = None):
        """递归展平树结构"""
        item = {
            'session_id': session_id,
            'item_id': node.item_id,
            'parent_id': parent_id,
            'level': node.level,
            'category': node.category,
            'item_name': node.item_name,
            'target_cost': node.target_cost,
            'actual_cost': node.actual_cost,
            'variance': node.variance,
            'variance_pct': node.variance_pct,
            'sort_order': node.sort_order,
            'metadata': node.metadata
        }
        items.append(item)
        
        # 递归处理子节点
        for child in node.children:
            self._flatten_tree(child, session_id, view, items, parent_id=node.item_id)
    
    def _save_processing_breakdown(self, session_id: str, data: CostSheetData):
        """保存加工成本分解到 processing_breakdown 表"""
        query = """
        INSERT INTO processing_breakdown (
            id, session_id, process_id, process_desc,
            setup_cost_target, setup_cost_actual,
            labor_cost_target, labor_cost_actual,
            burden_cost_target, burden_cost_actual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        import hashlib
        for idx, proc in enumerate(data.processes):
            # 生成唯一ID
            unique_str = f"{session_id}_PROC_{idx}"
            unique_id = int(hashlib.md5(unique_str.encode()).hexdigest()[:15], 16)
            
            self.conn.execute(query, [
                unique_id,
                session_id,
                f"PROC_{idx+1:03d}",
                proc.operation_desc,
                proc.setup_cost_target,
                proc.setup_cost_actual,
                proc.labor_cost_target,
                proc.labor_cost_actual,
                proc.burden_cost_target,
                proc.burden_cost_actual
            ])
    
    def _load_tree_from_db(self, session_id: str, view: str) -> CostTreeNode:
        """从数据库加载成本树并重建树形结构"""
        query = """
        SELECT item_id, parent_id, level, category, item_name,
               target_cost, actual_cost, variance, variance_pct, sort_order, metadata
        FROM cost_items
        WHERE session_id = ? AND item_id LIKE ?
        ORDER BY level, sort_order
        """
        
        results = self.conn.execute(query, [session_id, f"{view}_%"]).fetchall()
        
        if not results:
            raise ValueError(f"No cost tree found for session {session_id} with view {view}")
        
        # 构建节点字典
        nodes = {}
        for row in results:
            item_id = row[0].replace(f"{view}_", "")  # 移除视角前缀
            parent_id = row[1].replace(f"{view}_", "") if row[1] else None
            
            node = CostTreeNode(
                item_id=item_id,
                item_name=row[4],
                level=row[2],
                category=row[3],
                target_cost=float(row[5]),
                actual_cost=float(row[6]),
                variance=float(row[7]),
                variance_pct=float(row[8]),
                sort_order=row[9],
                metadata=json.loads(row[10]) if row[10] else None,
                children=[]
            )
            nodes[item_id] = (node, parent_id)
        
        # 重建树结构
        root = None
        for node, parent_id in nodes.values():
            if parent_id is None:
                root = node
            else:
                parent_node, _ = nodes[parent_id]
                parent_node.children.append(node)
        
        if root is None:
            raise ValueError("Root node not found")
        
        return root
