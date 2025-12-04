import React, { useState } from 'react';
import type { CostTreeNode } from '../types/costVariance';

interface Props {
    treeData: CostTreeNode;
    onNodeClick?: (node: CostTreeNode) => void;
}

export const CostTree: React.FC<Props> = ({ treeData, onNodeClick }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ROOT']));

    const toggleNode = (nodeId: string) => {
        const newExpanded = new Set(expandedNodes);
        if (newExpanded.has(nodeId)) {
            newExpanded.delete(nodeId);
        } else {
            newExpanded.add(nodeId);
        }
        setExpandedNodes(newExpanded);
    };

    const renderNode = (node: CostTreeNode): React.ReactNode => {
        const isExpanded = expandedNodes.has(node.item_id);
        const hasChildren = node.children && node.children.length > 0;

        // 差异颜色
        const varianceColor = node.variance > 0 ? '#E31837' : node.variance < 0 ? '#52C41A' : '#8C8C8C';

        // 差异占比 > 5% 加粗
        const isBold = Math.abs(node.variance_pct) > 5;

        return (
            <div key={node.item_id} style={{ marginBottom: 4 }}>
                <div
                    onClick={() => {
                        if (hasChildren) toggleNode(node.item_id);
                        if (onNodeClick) onNodeClick(node);
                    }}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        paddingLeft: `${(node.level - 1) * 24 + 12}px`,
                        cursor: hasChildren ? 'pointer' : 'default',
                        backgroundColor: expandedNodes.has(node.item_id) && hasChildren ? '#F5F5F5' : '#FFF',
                        borderLeft: node.level === 2 ? '3px solid #E31837' : 'none',
                        transition: 'background-color 0.2s',
                        fontWeight: isBold ? 600 : 400,
                        fontSize: node.level === 1 ? '16px' : node.level === 2 ? '15px' : '14px'
                    }}
                    onMouseEnter={(e) => {
                        if (hasChildren) e.currentTarget.style.backgroundColor = '#FAFAFA';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = expandedNodes.has(node.item_id) && hasChildren ? '#F5F5F5' : '#FFF';
                    }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {hasChildren && (
                            <span style={{
                                fontSize: '12px',
                                color: '#666',
                                transition: 'transform 0.2s',
                                display: 'inline-block',
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                            }}>
                                ▶
                            </span>
                        )}
                        {!hasChildren && <span style={{ width: 12 }} />}
                        <span style={{ color: '#333' }}>{node.item_name}</span>
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <span style={{
                            fontSize: '13px',
                            color: '#666',
                            minWidth: 100,
                            textAlign: 'right'
                        }}>
                            Target: ${node.target_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{
                            fontSize: '13px',
                            color: '#666',
                            minWidth: 100,
                            textAlign: 'right'
                        }}>
                            Actual: ${node.actual_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{
                            color: varianceColor,
                            fontSize: '14px',
                            fontWeight: 600,
                            minWidth: 120,
                            textAlign: 'right'
                        }}>
                            {node.variance > 0 ? '+' : ''}${node.variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            <span style={{ fontSize: '12px', marginLeft: 4 }}>
                                ({node.variance_pct > 0 ? '+' : ''}{node.variance_pct.toFixed(2)}%)
                            </span>
                        </span>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div>
                        {node.children
                            .sort((a, b) => a.sort_order - b.sort_order)
                            .map(child => renderNode(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            border: '1px solid #E0E0E0',
            borderRadius: 4,
            backgroundColor: '#FFF'
        }}>
            {/* 表头 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                backgroundColor: '#FAFAFA',
                borderBottom: '1px solid #E0E0E0',
                fontWeight: 600,
                fontSize: '13px',
                color: '#666'
            }}>
                <span>Cost Item</span>
                <div style={{ display: 'flex', gap: 24 }}>
                    <span style={{ minWidth: 100, textAlign: 'right' }}>Target Cost</span>
                    <span style={{ minWidth: 100, textAlign: 'right' }}>Actual Cost</span>
                    <span style={{ minWidth: 120, textAlign: 'right' }}>Variance</span>
                </div>
            </div>

            {/* 树内容 */}
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
                {renderNode(treeData)}
            </div>
        </div>
    );
};
