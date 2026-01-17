'use client';

import { useEffect, useRef, useState } from 'react';

const MindmapView = ({ data, loading, onNodeTreeReady, onFocusNode }) => {
    const containerRef = useRef(null);
    const graphRef = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const nodeTreeRef = useRef(null);

    // 将数据格式转换为 G6 需要的树形格式
    // 新格式数据已包含 id、label、side，只需简单转换
    // 保留兼容旧格式（title）的逻辑
    const transformToG6TreeFormat = (data) => {
        if (!data) return null;
        
        // 生成唯一 ID 的计数器（仅用于旧格式兼容）
        let idCounter = 0;
        const generateId = () => `node_${idCounter++}`;
        
        // 转换单个节点
        const transformNode = (node, level = 0) => {
            // 新格式：直接使用 id、label、side
            // 旧格式兼容：支持 title 和自动生成 id
            const nodeId = node.id || generateId();
            const label = node.label || node.title || '';
            const side = node.side; // 新格式中所有节点都有 side
            
            const result = {
                id: nodeId,
                label: label,
                level: level,
                side: side, // 保留 side 字段
                children: [],
            };
            
            if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                result.children = node.children.map(child => transformNode(child, level + 1));
            }
            
            return result;
        };
        
        // 如果数据是数组
        if (Array.isArray(data)) {
            if (data.length === 0) return null;
            
            // 如果只有一个根节点，直接转换
            if (data.length === 1) {
                return transformNode(data[0], 0);
            }
            
            // 如果有多个根节点，创建一个虚拟根节点
            return {
                id: 'root',
                label: 'Root',
                level: -1,
                side: 'center',
                children: data.map(node => transformNode(node, 0)),
            };
        }
        
        // 如果数据是单个对象
        return transformNode(data, 0);
    };

    // 初始化 G6 Graph
    useEffect(() => {
        if (!containerRef.current || !data || loading || typeof window === 'undefined') return;

        // 动态加载 G6
        const loadGraph = async () => {
            try {
                // 使用官方示例的导入方式
                const { Graph, treeToGraphData } = await import('@antv/g6');
                
                // 如果已经存在 graph，先销毁
                if (graphRef.current) {
                    graphRef.current.destroy();
                    graphRef.current = null;
                }

                // 转换数据格式
                const treeData = transformToG6TreeFormat(data);
                if (!treeData) {
                    console.warn('No valid tree data');
                    return;
                }
                
                // 转换为 G6 的图数据格式
                const graphData = treeToGraphData(treeData);
                
                // 获取节点侧边位置的辅助函数（用于 labelPlacement）
                // 新格式数据中所有节点都有 side 字段，直接读取即可
                const getNodeSide = (graph, datum) => {
                    // 优先从数据中读取 side（新格式）
                    const side = datum.data?.side || datum.side;
                    if (side) {
                        return side === 'center' ? 'right' : side; // center 节点标签显示在右侧
                    }
                    // 回退逻辑：兼容旧格式或无 side 的情况
                    const parentData = graph.getParentData(datum.id, 'tree');
                    if (!parentData) return 'center';
                    return datum.style.x > parentData.style.x ? 'right' : 'left';
                };

                // 创建 G6 Graph 实例（使用官方示例的配置）
                const graph = new Graph({
                    container: containerRef.current,
                    autoFit: false, // 禁用自动适配，保持默认 100% 缩放
                    data: graphData,
                    node: {
                        style: {
                            labelText: (d) => d.data?.label || d.label || d.data?.title || d.title || d.id || '',
                            labelBackground: true,
                            labelPlacement: 'center',
                            labelFill: '#2c3e50',
                            labelFontSize: 12,
                            labelFontWeight: '500',
                            labelBackgroundFill: '#ffffff',
                            labelBackgroundStroke: '#4a90e2',
                            labelBackgroundRadius: 6,
                            labelPadding: [6, 10],
                            labelTextAlign: 'center',
                            labelTextBaseline: 'middle',
                            fill: 'transparent',
                            stroke: 'transparent',
                            lineWidth: 0,
                            radius: 0,
                            ports: [{ placement: 'right' }, { placement: 'left' }],
                        },
                        animation: {
                            enter: false,
                        },
                    },
                    edge: {
                        type: 'cubic-horizontal',
                        animation: {
                            enter: false,
                        },
                    },
                    layout: {
                        type: 'mindmap',
                        direction: 'H',
                        preLayout: false,
                        // 节点大小根据文字内容自适应（文字框就是节点）
                        getHeight: (d) => {
                            const text = d.data?.label || d.label || d.data?.title || d.title || '';
                            if (!text) return 32;
                            // 估算高度：单行32，长文本可能需要更多空间
                            // 根据字符数粗略估算（每行约20-25个字符）
                            const estimatedLines = Math.ceil(text.length / 22);
                            return Math.max(32, Math.min(estimatedLines * 20 + 12, 60));
                        },
                        getWidth: (d) => {
                            const text = d.data?.label || d.label || d.data?.title || d.title || '';
                            if (!text) return 80;
                            // 估算宽度：每个字符约6-7px，加上padding（左右各10px）
                            // 限制最大宽度避免过长
                            const estimatedWidth = text.length * 6.5 + 20;
                            return Math.min(Math.max(estimatedWidth, 80), 200);
                        },
                        getVGap: () => 4,
                        getHGap: () => 64,
                        getSide: (d) => {
                            // 新格式：直接从数据中读取 side（数据中所有节点都有 side）
                            const side = d.data?.side || d.side;
                            if (side) {
                                return side;
                            }
                            // 回退逻辑：兼容旧格式或无 side 的情况
                            return d.depth === 0 || d.id === 'root' ? 'center' : 'right';
                        },
                    },
                    behaviors: ['collapse-expand', 'drag-canvas', 'zoom-canvas'],
                });

                graph.render();
                
                graphRef.current = graph;
                nodeTreeRef.current = treeData;
                
                // 将 graph 实例暴露到全局，供 FloatUI 的缩放控制使用
                window.mindmapGraph = graph;
                
                // 用于节流的缩放同步函数
                let zoomSyncTimer = null;
                const syncZoom = () => {
                    if (zoomSyncTimer) return;
                    zoomSyncTimer = setTimeout(() => {
                        // 使用 graphRef.current 确保获取最新的 graph 实例
                        const currentGraph = graphRef.current || graph;
                        if (!currentGraph || typeof currentGraph.getZoom !== 'function') {
                            zoomSyncTimer = null;
                            return;
                        }
                        try {
                            const currentZoom = currentGraph.getZoom();
                            const zoomPercent = Math.round(currentZoom * 100);
                            // 触发自定义事件，通知控制栏更新缩放显示
                            window.dispatchEvent(new CustomEvent('mindmapZoomChange', { 
                                detail: { zoom: zoomPercent } 
                            }));
                        } catch (error) {
                            console.warn('Error getting zoom level:', error);
                        }
                        zoomSyncTimer = null;
                    }, 50); // 50ms 节流，避免过于频繁的更新
                };
                
                // 监听多种可能的缩放事件
                // G6 v5 可能使用不同的事件名称
                const eventsToListen = ['viewportchange', 'afterrender', 'wheel', 'zoom'];
                eventsToListen.forEach(eventName => {
                    try {
                        graph.on(eventName, syncZoom);
                    } catch (e) {
                        // 如果事件不存在，忽略错误
                        console.debug(`Event ${eventName} not available`);
                    }
                });
                
                // 监听容器的滚轮事件（用户通过鼠标滚轮缩放）
                if (containerRef.current) {
                    const container = containerRef.current;
                    const handleWheel = (e) => {
                        // 延迟同步，等待 G6 处理完滚轮事件
                        setTimeout(syncZoom, 100);
                    };
                    container.addEventListener('wheel', handleWheel, { passive: true });
                    
                    // 存储清理函数
                    container._zoomWheelHandler = handleWheel;
                }
                
                // 初始化时同步一次缩放级别
                setTimeout(() => {
                    syncZoom();
                }, 200);
                
                // 等待布局完成后，精确居中显示根节点并通知父组件
                setTimeout(() => {
                    // 使用 graphRef.current 确保获取最新的 graph 实例
                    const currentGraph = graphRef.current || graph;
                    if (!currentGraph) {
                        console.warn('Graph not available for centering');
                        setIsReady(true);
                        if (onNodeTreeReady) {
                            onNodeTreeReady(treeData);
                        }
                        return;
                    }
                    
                    try {
                        // 获取根节点ID：新格式数据保证有 id 字段
                        let rootNodeId = treeData.id;
                        
                        // 如果是虚拟的 'root' 节点，使用第一个实际根节点的 id
                        if (rootNodeId === 'root' && treeData.children && treeData.children.length > 0) {
                            rootNodeId = treeData.children[0].id;
                        }
                        
                        // 精确居中根节点
                        if (rootNodeId) {
                            const rootNodeData = currentGraph.getNodeData(rootNodeId);
                            if (rootNodeData && rootNodeData.style) {
                                const rootX = rootNodeData.style.x;
                                const rootY = rootNodeData.style.y;
                                
                                if (rootX !== undefined && rootY !== undefined) {
                                    // 获取视口中心坐标
                                    const canvasCenter = currentGraph.getCanvasCenter();
                                    const currentZoom = currentGraph.getZoom();
                                    
                                    // 计算使根节点位于视口中心所需的平移量
                                    // 公式：视口中心 = 节点画布坐标 * 当前缩放 + 画布原点视口位置
                                    // 因此：画布原点视口位置 = 视口中心 - 节点画布坐标 * 当前缩放
                                    const targetPositionX = canvasCenter[0] - rootX * currentZoom;
                                    const targetPositionY = canvasCenter[1] - rootY * currentZoom;
                                    
                                    // 立即平移视图（无动画，确保初始位置精确）
                                    currentGraph.translateTo([targetPositionX, targetPositionY], {
                                        duration: 0
                                    });
                                }
                            }
                        } else {
                            // 如果找不到根节点，回退到 fitCenter
                            if (currentGraph.fitCenter && typeof currentGraph.fitCenter === 'function') {
                                currentGraph.fitCenter({
                                    duration: 0
                                });
                            }
                        }
                    } catch (error) {
                        console.warn('Error centering root node, using fitCenter fallback:', error);
                        // 出错时回退到 fitCenter
                        if (currentGraph && currentGraph.fitCenter && typeof currentGraph.fitCenter === 'function') {
                            currentGraph.fitCenter({
                                duration: 0
                            });
                        }
                    }
                    
                    setIsReady(true);
                    
                    // 通知父组件节点树已准备好
                    if (onNodeTreeReady) {
                        onNodeTreeReady(treeData);
                    }
                }, 300); // 增加等待时间，确保布局完全完成
                
                // 暴露聚焦节点的方法到全局，供 FloatUI 调用
                if (onFocusNode) {
                    window.focusMindmapNode = (nodeId) => {
                        // 使用 graphRef.current 确保获取最新的 graph 实例
                        const currentGraph = graphRef.current || graph;
                        if (!currentGraph || !nodeId) {
                            console.warn('Graph not available or nodeId missing');
                            return;
                        }
                        
                        try {
                            // 使用 G6 v5 官方 API：getNodeData 获取节点数据
                            // nodeId 可能是原始数据的ID，需要在图中查找对应的节点
                            const nodeData = currentGraph.getNodeData(nodeId);
                            
                            if (nodeData && nodeData.style) {
                                const nodeX = nodeData.style.x; // 节点在画布上的 x 坐标
                                const nodeY = nodeData.style.y; // 节点在画布上的 y 坐标
                                
                                if (nodeX !== undefined && nodeY !== undefined) {
                                    // 获取当前视口中心坐标
                                    const canvasCenter = currentGraph.getCanvasCenter(); // 视口中心的视口坐标 [x, y]
                                    const targetZoom = 1.5; // 目标缩放比例
                                    
                                    // 计算目标缩放后，使节点位于视口中心所需的画布原点位置
                                    // 公式：视口中心 = 节点画布坐标 * 目标缩放 + 目标画布原点视口位置
                                    // 因此：目标画布原点视口位置 = 视口中心 - 节点画布坐标 * 目标缩放
                                    const targetPositionX = canvasCenter[0] - nodeX * targetZoom;
                                    const targetPositionY = canvasCenter[1] - nodeY * targetZoom;
                                    
                                    // 先平移视图到目标位置（使节点在目标缩放下位于视口中心）
                                    currentGraph.translateTo([targetPositionX, targetPositionY], {
                                        duration: 500,
                                        easing: 'ease-in-out'
                                    }).then(() => {
                                        // 平移完成后，以视口中心为缩放中心点进行缩放
                                        // 这样缩放后节点仍然在视口中心
                                        currentGraph.zoomTo(targetZoom, {
                                            duration: 500,
                                            easing: 'ease-in-out'
                                        }, canvasCenter);
                                    }).catch((error) => {
                                        console.warn('Animation failed, trying fallback:', error);
                                        // 回退方法：直接计算并设置（无动画）
                                        try {
                                            // 先平移
                                            currentGraph.translateTo([targetPositionX, targetPositionY], {
                                                duration: 0
                                            });
                                            
                                            // 使用 setTimeout 确保平移完成后再缩放
                                            setTimeout(() => {
                                                currentGraph.zoomTo(targetZoom, {
                                                    duration: 500,
                                                    easing: 'ease-in-out'
                                                }, canvasCenter);
                                            }, 50);
                                        } catch (fallbackError) {
                                            console.error('Fallback approach also failed:', fallbackError);
                                        }
                                    });
                                    
                                    return;
                                }
                            }
                            
                            console.warn('Node data or position not found for id:', nodeId);
                        } catch (error) {
                            console.error('Error focusing node:', error);
                        }
                    };
                }
            } catch (error) {
                console.error('Error initializing mindmap:', error);
            }
        };

        loadGraph();

        // 清理函数
        return () => {
            // 清理滚轮事件监听
            if (containerRef.current && containerRef.current._zoomWheelHandler) {
                containerRef.current.removeEventListener('wheel', containerRef.current._zoomWheelHandler);
                delete containerRef.current._zoomWheelHandler;
            }
            
            if (graphRef.current) {
                graphRef.current.destroy();
                graphRef.current = null;
            }
            // 清理全局引用
            if (window.mindmapGraph) {
                window.mindmapGraph = null;
            }
        };
    }, [data, loading]);

    // 处理窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            if (graphRef.current && containerRef.current) {
                // 只更新画布大小，不改变缩放级别
                graphRef.current.resize();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <div className="text-gray-500">暂无思维导图数据</div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative">
            <div 
                ref={containerRef} 
                className="w-full h-full border border-gray-200"
                style={{ minHeight: '800px' }}
            />
        </div>
    );
};

export default MindmapView;
