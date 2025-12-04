import React, { useState, useMemo } from 'react';
import type { CostTreeNode } from '../types/costVariance';
import { PlusSquareOutlined, MinusSquareOutlined } from '@ant-design/icons';

interface Props {
    treeData: CostTreeNode;
    onNodeClick?: (node: CostTreeNode) => void;
}

export const CostTree: React.FC<Props> = ({ treeData, onNodeClick }) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ROOT']));

    // 计算整个树中差异绝对值的最大值，用于归一化条形图宽度
    const maxAbsVariance = useMemo(() => {
        let max = 0;
        const traverse = (node: CostTreeNode) => {
            if (Math.abs(node.variance) > max) {
                max = Math.abs(node.variance);
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        };
        traverse(treeData);
        // 如果最大值为0，设为1防止除以0
        return max === 0 ? 1 : max;
    }, [treeData]);

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
        // 过滤掉差异为0的节点 (保留根节点)
        if (node.level > 1 && Math.abs(node.variance) < 0.001) {
            return null;
        }

        const isExpanded = expandedNodes.has(node.item_id);

        // 过滤子节点：只保留有差异的子节点
        const visibleChildren = node.children
            ? node.children.filter(child => Math.abs(child.variance) >= 0.001)
            : [];

        const hasChildren = visibleChildren.length > 0;

        // 计算条形图宽度 (相对于最大值的百分比)
        // 我们预留 50% 给正值，50% 给负值。所以最大宽度是 50%。
        const barWidthPct = (Math.abs(node.variance) / maxAbsVariance) * 45; // 留一点padding

        const isPositive = node.variance >= 0;
        const barColor = isPositive ? '#D9363E' : '#52C41A'; // 红色正，绿色负

        return (
            <div key={node.item_id}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: '14px'
                    }}
                >
                    {/* 1. 名称区域 (40%) */}
                    <div style={{
                        width: '40%',
                        paddingLeft: `${(node.level - 1) * 24 + 12}px`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        {hasChildren ? (
                            <span
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.item_id);
                                }}
                                style={{ cursor: 'pointer', color: '#999', fontSize: 16 }}
                            >
                                {isExpanded ? <MinusSquareOutlined /> : <PlusSquareOutlined />}
                            </span>
                        ) : (
                            <span style={{ width: 16 }} />
                        )}
                        <span style={{ fontWeight: node.level === 1 ? 700 : 400 }}>
                            {node.item_name}
                        </span>
                    </div>

                    {/* 2. 条形图区域 (40%) - 中心轴布局 */}
                    <div style={{
                        width: '40%',
                        position: 'relative',
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        borderLeft: '1px dashed #ccc', // 中心轴
                        marginLeft: '20%' // 稍微偏移一点，让负值有空间
                    }}>
                        {/* 负值条 (向左) */}
                        {!isPositive && (
                            <div style={{
                                position: 'absolute',
                                right: '100%', // 从中心轴向左延伸
                                height: 16,
                                width: `${barWidthPct}%`,
                                backgroundColor: barColor,
                                borderRadius: '2px 0 0 2px',
                                transition: 'width 0.3s ease'
                            }} />
                        )}

                        {/* 正值条 (向右) */}
                        {isPositive && (
                            <div style={{
                                position: 'absolute',
                                left: 0, // 从中心轴向右延伸
                                height: 16,
                                width: `${barWidthPct}%`,
                                backgroundColor: barColor,
                                borderRadius: '0 2px 2px 0',
                                transition: 'width 0.3s ease'
                            }} />
                        )}

                        {/* 数值标注 (跟随条形图) */}
                        <span style={{
                            position: 'absolute',
                            left: isPositive ? `${barWidthPct + 2}%` : 'auto',
                            right: !isPositive ? `calc(100% + ${barWidthPct + 2}%)` : 'auto',
                            fontSize: '12px',
                            color: '#666',
                            whiteSpace: 'nowrap'
                        }}>
                            {node.variance > 0 ? '+' : ''}{node.variance.toFixed(3)}
                        </span>
                    </div>

                    {/* 3. 详情数值区域 (20%) */}
                    <div style={{
                        width: '20%',
                        textAlign: 'right',
                        paddingRight: 24,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}>
                        <span style={{ fontWeight: 600, color: barColor }}>
                            {node.variance > 0 ? '+' : ''}{node.variance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span style={{ fontSize: 12, color: '#999' }}>
                            {node.variance_pct > 0 ? '+' : ''}{node.variance_pct.toFixed(2)}%
                        </span>
                    </div>
                </div>

                {/* 子节点递归渲染 */}
                {hasChildren && isExpanded && (
                    <div>
                        {visibleChildren
                            .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance)) // 按差异绝对值降序排列(Pareto风格)
                            .map(child => renderNode(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{
            backgroundColor: '#FFF',
            borderRadius: 8,
            padding: '16px 0'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                padding: '0 0 12px 0',
                borderBottom: '2px solid #f0f0f0',
                fontWeight: 600,
                color: '#333',
                fontSize: 14
            }}>
                <div style={{ width: '40%', paddingLeft: 12 }}>Cost Item</div>
                <div style={{ width: '40%', textAlign: 'center' }}>Gap Impact</div>
                <div style={{ width: '20%', textAlign: 'right', paddingRight: 24 }}>Variance / %</div>
            </div>

            {/* Tree Content */}
            <div style={{ maxHeight: 800, overflowY: 'auto' }}>
                {renderNode(treeData)}
            </div>
        </div>
    );
};
