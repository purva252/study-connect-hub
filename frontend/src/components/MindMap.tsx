import React, { useState, useEffect, useRef } from 'react';
import { Palette, X } from 'lucide-react';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  parentId: string | null;
  color: string;
}

const COLOR_PALETTE = [
  { name: 'Blue', bg: 'bg-blue-500', border: 'border-blue-400', text: '#3B82F6' },
  { name: 'Purple', bg: 'bg-purple-500', border: 'border-purple-400', text: '#A855F7' },
  { name: 'Pink', bg: 'bg-pink-500', border: 'border-pink-400', text: '#EC4899' },
  { name: 'Red', bg: 'bg-red-500', border: 'border-red-400', text: '#EF4444' },
  { name: 'Orange', bg: 'bg-orange-500', border: 'border-orange-400', text: '#F97316' },
  { name: 'Green', bg: 'bg-green-500', border: 'border-green-400', text: '#22C55E' },
  { name: 'Teal', bg: 'bg-teal-500', border: 'border-teal-400', text: '#14B8A6' },
  { name: 'Cyan', bg: 'bg-cyan-500', border: 'border-cyan-400', text: '#06B6D4' },
];

// Canvas bounds
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1400;
const MIN_X = 50;
const MAX_X = CANVAS_WIDTH - 50;
const MIN_Y = 50;
const MAX_Y = CANVAS_HEIGHT - 50;

const clampPosition = (x: number, y: number) => ({
  x: Math.max(MIN_X, Math.min(MAX_X, x)),
  y: Math.max(MIN_Y, Math.min(MAX_Y, y))
});

const MindMap: React.FC = () => {
  const [nodes, setNodes] = useState<MindMapNode[]>([
    { id: '1', text: 'Central Topic', x: 600, y: 350, parentId: null, color: '#4A90E2' }
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>('1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  // Center view on central topic on mount
  useEffect(() => {
    if (!canvasWrapperRef.current) return;
    
    setTimeout(() => {
      if (canvasWrapperRef.current) {
        const centerX = 600 - canvasWrapperRef.current.clientWidth / 2;
        const centerY = 350 - canvasWrapperRef.current.clientHeight / 2;
        canvasWrapperRef.current.scrollLeft = centerX;
        canvasWrapperRef.current.scrollTop = centerY;
      }
    }, 0);
  }, []);

  const addNode = () => {
    if (!selectedNode) return;
    const parent = nodes.find(n => n.id === selectedNode);
    if (!parent) return;

    const angle = Math.random() * Math.PI * 2;
    const dist = 140;
    const rawX = parent.x + Math.cos(angle) * dist;
    const rawY = parent.y + Math.sin(angle) * dist;
    const { x, y } = clampPosition(rawX, rawY);
    
    const newNode: MindMapNode = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'New Concept',
      x,
      y,
      parentId: selectedNode,
      color: COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)].text
    };
    setNodes([...nodes, newNode]);
  };

  const updateText = (id: string, text: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, text } : n));
  };

  const clearCanvas = () => {
    setNodes([{ id: '1', text: 'Central Topic', x: 600, y: 350, parentId: null, color: '#4A90E2' }]);
    setSelectedNode('1');
    setShowColorPicker(false);
  };

  const updateNodeColor = (id: string, color: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, color } : n));
    setShowColorPicker(false);
  };

  const deleteNode = (id: string) => {
    // Prevent deleting the central topic
    if (id === '1') return;

    // Find all child nodes recursively
    const getChildIds = (nodeId: string): string[] => {
      const children = nodes.filter(n => n.parentId === nodeId).map(n => n.id);
      return [nodeId, ...children.flatMap(childId => getChildIds(childId))];
    };

    const nodesToDelete = getChildIds(id);
    setNodes(nodes.filter(n => !nodesToDelete.includes(n.id)));
    setSelectedNode(null);
    setShowColorPicker(false);
  };

  const handleCanvasClick = () => {
    setShowColorPicker(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode && selectedNode !== '1') {
        deleteNode(selectedNode);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode]);

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const scrollLeft = canvasWrapperRef.current?.scrollLeft || 0;
    const scrollTop = canvasWrapperRef.current?.scrollTop || 0;
    
    setDraggingNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - node.x,
      y: e.clientY - rect.top + scrollTop - node.y
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingNode) return;
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    
    // Account for scroll position when calculating position
    const scrollLeft = canvasWrapperRef.current?.scrollLeft || 0;
    const scrollTop = canvasWrapperRef.current?.scrollTop || 0;
    
    const rawX = e.clientX - rect.left + scrollLeft - dragOffset.x;
    const rawY = e.clientY - rect.top + scrollTop - dragOffset.y;
    const { x, y } = clampPosition(rawX, rawY);
    
    setNodes(nodes.map(n => 
      n.id === draggingNode 
        ? { ...n, x, y }
        : n
    ));
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-background/95">
      {/* Single Compact Header */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-border/20">
        <h2 className="text-base font-bold text-white">Mind Map</h2>
        <div className="flex gap-1.5">
          <button 
            onClick={addNode}
            className="gradient-btn text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm hover:shadow-md transition-shadow"
          >
            + Add
          </button>
          <button 
            onClick={clearCanvas}
            className="glass text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Canvas Wrapper - Scrollable Container */}
      <div 
        ref={canvasWrapperRef}
        className="flex-1 relative overflow-auto"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Canvas - Virtual Large Space */}
        <div 
          ref={canvasRef}
          className="relative"
          style={{ 
            width: '2000px', 
            height: '1400px',
            cursor: draggingNode ? 'grabbing' : 'grab'
          }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-slate-950/40 to-slate-900/20 pointer-events-none" />

        {/* Connection Lines - with glow for selected nodes */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full">
          <defs>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {nodes.map(node => {
            if (!node.parentId) return null;
            const parent = nodes.find(n => n.id === node.parentId);
            if (!parent) return null;
            const isSelectedOrParentSelected = selectedNode === node.id || selectedNode === node.parentId;
            return (
              <line 
                key={`line-${node.id}`}
                x1={parent.x} y1={parent.y}
                x2={node.x} y2={node.y}
                stroke={node.color}
                strokeWidth={isSelectedOrParentSelected ? "3" : "2"}
                opacity={isSelectedOrParentSelected ? "0.9" : "0.5"}
                filter={isSelectedOrParentSelected ? "url(#lineGlow)" : ""}
                className="transition-all duration-300"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map(node => (
          <div key={node.id} className="relative">
            {/* Glow effect for selected nodes */}
            {selectedNode === node.id && (
              <div
                style={{ 
                  left: `${node.x}px`, 
                  top: `${node.y}px`, 
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: node.color,
                  boxShadow: `0 0 30px ${node.color}, 0 0 60px ${node.color}80`
                }}
                className="absolute px-6 py-3 rounded-2xl scale-110 pointer-events-none z-10 opacity-60 blur-md transition-all duration-300"
              />
            )}
            
            {/* Central topic emphasis - larger aura */}
            {node.id === '1' && (
              <div
                style={{ 
                  left: `${node.x}px`, 
                  top: `${node.y}px`, 
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute w-[200px] h-[120px] rounded-2xl pointer-events-none z-5 opacity-25 blur-xl border-2 border-blue-400"
              />
            )}
            
            <div
              style={{ 
                left: `${node.x}px`, 
                top: `${node.y}px`, 
                transform: 'translate(-50%, -50%)',
                backgroundColor: node.color,
                borderColor: node.color,
                boxShadow: selectedNode === node.id ? `0 0 20px ${node.color}, 0 8px 16px rgba(0,0,0,0.3)` : '0 4px 12px rgba(0,0,0,0.2)'
              }}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNode(node.id);
                setShowColorPicker(true);
              }}
              className={`absolute px-6 py-3 rounded-2xl transition-all duration-200 border-2 text-sm font-bold flex items-center justify-center text-white group ${
                draggingNode === node.id ? 'cursor-grabbing' : 'cursor-grab'
              } ${
                node.id === '1' ? 'min-w-[150px] font-extrabold text-base' : 'min-w-[120px]'
              } ${
                selectedNode === node.id 
                  ? 'scale-110 z-20 shadow-2xl' 
                  : 'z-10 opacity-75 hover:opacity-100 hover:scale-105 hover:shadow-lg'
              }`}
            >
              {selectedNode === node.id ? (
                <input 
                  autoFocus
                  className="bg-transparent border-none outline-none text-center w-full text-white font-bold drop-shadow"
                  value={node.text}
                  onChange={(e) => updateText(node.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                node.text
              )}
              
              {/* Delete button - shown on selected non-central nodes */}
              {selectedNode === node.id && node.id !== '1' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNode(node.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform hover:scale-110"
                  title="Delete node and children (Delete/Backspace)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Color Picker Popover - shown only when selected node and color picker is active */}
            {selectedNode === node.id && showColorPicker && (
              <div
                style={{ 
                  left: `${node.x}px`, 
                  top: `${node.y + 80}px`,
                  transform: 'translate(-50%, 0)',
                  borderColor: node.color,
                  boxShadow: `0 0 20px ${node.color}40, 0 8px 24px rgba(0,0,0,0.3)`
                }}
                className="absolute z-40 bg-background/98 backdrop-blur-md rounded-2xl p-4 border-2 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div 
                  className="flex items-center gap-2 mb-3 pb-2 border-b"
                  style={{ borderColor: `${node.color}40` }}
                >
                  <Palette className="w-4 h-4" style={{ color: node.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Colors</span>
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => updateNodeColor(node.id, color.text)}
                      className={`w-9 h-9 rounded-lg transition-all transform hover:scale-110 border-2 shadow-md hover:shadow-lg ${
                        node.color === color.text ? 'ring-2 scale-110' : 'border-transparent'
                      }`}
                      style={{ 
                        backgroundColor: color.text,
                        borderColor: node.color === color.text ? 'white' : 'transparent',
                        boxShadow: node.color === color.text ? `0 0 12px ${color.text}, 0 4px 8px rgba(0,0,0,0.2)` : '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="absolute bottom-6 right-6 text-[8px] text-brand-soft/60 uppercase font-bold tracking-widest max-w-xs pointer-events-none">
          Scroll or drag nodes • Click to select • Infinite canvas
        </div>
        </div>
      </div>
    </div>
  );
};

export default MindMap;
