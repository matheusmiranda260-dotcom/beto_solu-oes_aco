import React, { useState, useEffect } from 'react';
import { analyzeImageWithGemini } from '../services/imageAnalysisService';
import { ElementType, BarUsage, SteelItem, Client, Quote, MainBarGroup, HookType } from '../types';
import { GAUGES, STEEL_WEIGHTS, DEFAULT_KG_PRICE } from '../constants';

interface QuoteBuilderProps {
  client: Client;
  onSave: (quote: Quote) => void;
  onCancel: () => void;
  isCounter?: boolean;
  counterObs?: string;
}

// Desenho da Barra Longitudinal (Retas e Dobradas)
const BarDrawing: React.FC<{
  length: number;
  hookStart: number;
  hookEnd: number;
  startType: HookType;
  endType: HookType;
  compact?: boolean;
  shape?: string;
  segmentD?: number;
  segmentE?: number;
}> = ({ length, hookStart, hookEnd, startType, endType, compact, shape, segmentD, segmentE }) => {
  const viewW = compact ? 120 : 320;
  const viewH = compact ? 50 : 120;
  const padding = compact ? 20 : 60;
  const centerY = viewH / 2;
  const hookSize = compact ? 10 : 25;
  const inwardSize = compact ? 6 : 15;
  const fontSize = compact ? '7px' : '12px';

  const isCShape = shape?.startsWith('c_');

  let path = "";

  // Start: Inward D -> Leg Start
  let startX = padding;
  let startY = centerY;

  if (startType === 'up') {
    if (isCShape && segmentD) {
      path = `M ${startX + inwardSize},${startY - hookSize} L ${startX},${startY - hookSize} L ${startX},${startY}`;
    } else {
      path = `M ${startX},${startY - hookSize} L ${startX},${startY}`;
    }
  } else if (startType === 'down') {
    if (isCShape && segmentD) {
      path = `M ${startX + inwardSize},${startY + hookSize} L ${startX},${startY + hookSize} L ${startX},${startY}`;
    } else {
      path = `M ${startX},${startY + hookSize} L ${startX},${startY}`;
    }
  } else {
    path = `M ${startX},${startY}`;
  }

  // Horizontal line
  path += ` L ${viewW - padding},${centerY}`;

  // End: Leg End -> Inward E
  if (endType === 'up') {
    path += ` L ${viewW - padding},${centerY - hookSize}`;
    if (isCShape && segmentE) path += ` L ${viewW - padding - inwardSize},${centerY - hookSize}`;
  } else if (endType === 'down') {
    path += ` L ${viewW - padding},${centerY + hookSize}`;
    if (isCShape && segmentE) path += ` L ${viewW - padding - inwardSize},${centerY + hookSize}`;
  }

  return (
    <div className={`flex flex-col items-center justify-center rounded-xl transition-all ${compact ? 'p-0 bg-transparent' : 'p-6 bg-white border border-slate-100 shadow-inner mb-2'}`}>
      <svg width={viewW} height={viewH} viewBox={`0 0 ${viewW} ${viewH}`} className="overflow-visible">
        <path d={path} fill="none" stroke="#0f172a" strokeWidth={compact ? "2" : "5"} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dimension Labels */}
        <text x={viewW / 2} y={centerY - (compact ? 4 : 10)} textAnchor="middle" className="font-black fill-slate-900" style={{ fontSize }}>{(length * 100).toFixed(0)}</text>

        {startType !== 'none' && (
          <>
            <text x={padding - (compact ? 8 : 15)} y={startType === 'up' ? centerY - (compact ? 6 : 15) : centerY + (compact ? 12 : 25)} textAnchor="middle" className="font-black fill-indigo-600" style={{ fontSize }}>{hookStart}</text>
            {isCShape && segmentD && <text x={padding + inwardSize / 2} y={startType === 'up' ? centerY - hookSize - (compact ? 3 : 8) : centerY + hookSize + (compact ? 10 : 18)} textAnchor="middle" className="font-black fill-amber-500" style={{ fontSize: compact ? '6px' : '9px' }}>{segmentD}</text>}
          </>
        )}

        {endType !== 'none' && (
          <>
            <text x={viewW - padding + (compact ? 8 : 15)} y={endType === 'up' ? centerY - (compact ? 6 : 15) : centerY + (compact ? 12 : 25)} textAnchor="middle" className="font-black fill-indigo-600" style={{ fontSize }}>{hookEnd}</text>
            {isCShape && segmentE && <text x={viewW - padding - inwardSize / 2} y={endType === 'up' ? centerY - hookSize - (compact ? 3 : 8) : centerY + hookSize + (compact ? 10 : 18)} textAnchor="middle" className="font-black fill-amber-500" style={{ fontSize: compact ? '6px' : '9px' }}>{segmentE}</text>}
          </>
        )}
      </svg>
    </div>
  );
};

// Desenho Técnico do Estribo (Vigas e Pilares)
const StirrupDrawing: React.FC<{ width: number; height: number; compact?: boolean }> = ({ width, height, compact }) => {
  const size = compact ? 40 : 150;
  const pad = compact ? 5 : 20;
  const drawW = size - (pad * 2);
  const drawH = size - (pad * 2);
  const fontSize = compact ? '6px' : '11px';
  const hook = compact ? 4 : 12;

  return (
    <div className={`flex items-center justify-center rounded-xl transition-all ${compact ? 'bg-transparent' : 'p-6 bg-white border border-slate-100 shadow-inner'}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect x={pad} y={pad} width={drawW} height={drawH} fill="none" stroke="#f59e0b" strokeWidth={compact ? "1.5" : "3"} rx={compact ? "2" : "4"} />
        <path d={`M ${pad},${pad} L ${pad - hook},${pad - hook} M ${pad},${pad} L ${pad + hook},${pad - hook}`} fill="none" stroke="#f59e0b" strokeWidth={compact ? "1.5" : "3"} strokeLinecap="round" />
        <text x={pad + drawW / 2} y={pad - (compact ? 2 : 6)} textAnchor="middle" className="font-black fill-amber-600" style={{ fontSize }}>{width}</text>
        <text x={pad - (compact ? 2 : 6)} y={pad + drawH / 2} textAnchor="middle" className="font-black fill-amber-600" style={{ fontSize, transform: 'rotate(-90deg)', transformOrigin: `${pad - (compact ? 2 : 6)}px ${pad + drawH / 2}px` }}>{height}</text>
      </svg>
    </div>
  );
};

// Desenho da Gaiola de Sapata (Vista de Cima)
const CageDrawing: React.FC<{ lengthCm: number; widthCm: number; spacing: number; compact?: boolean }> = ({ lengthCm, widthCm, spacing, compact }) => {
  const size = compact ? 50 : 150;
  const pad = compact ? 5 : 20;
  const drawW = size - (pad * 2);
  const drawH = size - (pad * 2);

  // Calculamos quantas linhas desenhar para representar o espaçamento
  const linesX = Math.min(6, Math.max(2, Math.ceil(lengthCm / spacing)));
  const linesY = Math.min(6, Math.max(2, Math.ceil(widthCm / spacing)));

  return (
    <div className={`flex items-center justify-center rounded-xl transition-all ${compact ? 'bg-transparent' : 'p-6 bg-white border border-slate-100 shadow-inner'}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect x={pad} y={pad} width={drawW} height={drawH} fill="#eff6ff" stroke="#4f46e5" strokeWidth={compact ? "1.5" : "3"} rx={compact ? "2" : "4"} />
        {/* Linhas Horizontais */}
        {Array.from({ length: linesY }).map((_, i) => (
          <line key={`h${i}`} x1={pad} y1={pad + (drawH / (linesY - 1)) * i} x2={pad + drawW} y2={pad + (drawH / (linesY - 1)) * i} stroke="#4f46e5" strokeWidth={compact ? "0.5" : "1"} strokeOpacity="0.5" />
        ))}
        {/* Linhas Verticais */}
        {Array.from({ length: linesX }).map((_, i) => (
          <line key={`v${i}`} x1={pad + (drawW / (linesX - 1)) * i} y1={pad} x2={pad + (drawW / (linesX - 1)) * i} y2={pad + drawH} stroke="#4f46e5" strokeWidth={compact ? "0.5" : "1"} strokeOpacity="0.5" />
        ))}
        {/* Dimensões */}
        {!compact && (
          <>
            <text x={pad + drawW / 2} y={pad - 5} textAnchor="middle" className="font-black fill-indigo-600 text-[9px] uppercase tracking-tighter">{lengthCm}cm</text>
            <text x={pad - 5} y={pad + drawH / 2} textAnchor="middle" className="font-black fill-indigo-600 text-[9px] uppercase tracking-tighter" style={{ transform: 'rotate(-90deg)', transformOrigin: `${pad - 5}px ${pad + drawH / 2}px` }}>{widthCm}cm</text>
          </>
        )}
      </svg>
    </div>
  );
};

// Visualização da Seção Transversal Composta (Todas as barras)
// Helper Component for Dimension Lines
const TechnicalDimension: React.FC<{ x1: number; y1: number; x2: number; y2: number; text: string; offset?: number; vertical?: boolean }> = ({ x1, y1, x2, y2, text, offset = 0, vertical = false }) => {
  const tickSize = 4;
  const ox = vertical ? offset : 0;
  const oy = vertical ? 0 : offset;
  const tx1 = x1 + ox; const ty1 = y1 + oy;
  const tx2 = x2 + ox; const ty2 = y2 + oy;

  const midX = (tx1 + tx2) / 2;
  const midY = (ty1 + ty2) / 2;

  return (
    <g>
      <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#000" strokeWidth="0.8" />
      <line x1={tx1 - (vertical ? tickSize : 0)} y1={ty1 - (vertical ? 0 : tickSize)} x2={tx1 + (vertical ? tickSize : 0)} y2={ty1 + (vertical ? 0 : tickSize)} stroke="#000" strokeWidth="0.8" />
      <line x1={tx2 - (vertical ? tickSize : 0)} y1={ty2 - (vertical ? 0 : tickSize)} x2={tx2 + (vertical ? tickSize : 0)} y2={ty2 + (vertical ? 0 : tickSize)} stroke="#000" strokeWidth="0.8" />
      <text x={midX} y={midY + (vertical ? 0 : -3)} textAnchor="middle" fontSize="8" fontFamily="Arial" fill="#000" dominantBaseline={vertical ? "middle" : "auto"} transform={vertical ? `rotate(-90 ${midX} ${midY}) translate(0, -3)` : ""}>
        {text}
      </text>
    </g>
  );
};

// Visualização da Seção Transversal Composta (Estilo Projeto Estrutural)
// Visualização da Seção Transversal Composta (Estilo Projeto Estrutural)
const CompositeCrossSection: React.FC<{
  stirrupW: number;
  stirrupH: number;
  bars: MainBarGroup[];
  stirrupPos?: string;
  stirrupGauge?: string;
  stirrupCount?: number;
  onZoneClick?: (zone: 'top' | 'bottom' | 'distributed' | 'center') => void;
  selectedZone?: 'top' | 'bottom' | 'distributed' | 'center' | null;
}> = ({ stirrupW, stirrupH, bars, stirrupPos, stirrupGauge, stirrupCount, onZoneClick, selectedZone }) => {
  const width = stirrupW || 15;
  const height = stirrupH || 20;
  const maxDim = Math.max(width, height, 15);
  const scale = 100 / maxDim;
  const w = width * scale;
  const h = height * scale;
  const padding = 40;
  const r = 3;

  const allPoints: { x: number, y: number, color: string }[] = [];
  const getEffectivePlacement = (g: MainBarGroup) => {
    if (g.placement) return g.placement;
    if (g.usage === BarUsage.COSTELA) return 'distributed';
    return 'bottom';
  };

  bars.forEach(group => {
    const placement = getEffectivePlacement(group);
    const count = group.count;
    // Color logic: Principal = Black, Others (Costela/2nd) = Red
    const color = group.usage === BarUsage.PRINCIPAL ? '#000000' : '#ef4444';

    if (placement === 'top') {
      // Distribute evenly on top face
      if (count === 1) {
        allPoints.push({ x: w / 2, y: 0, color }); // Centered
      } else {
        for (let i = 0; i < count; i++) {
          allPoints.push({ x: (w * i) / (count - 1), y: 0, color });
        }
      }
    } else if (placement === 'bottom') {
      // Distribute evenly on bottom face
      if (count === 1) {
        allPoints.push({ x: w / 2, y: h, color });
      } else {
        for (let i = 0; i < count; i++) {
          allPoints.push({ x: (w * i) / (count - 1), y: h, color });
        }
      }
    } else if (placement === 'distributed') {
      // Side bars (Costela)
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? 0 : w;
        const rows = Math.ceil(count / 2);
        const rowIdx = Math.floor(i / 2);
        const yPos = (h * (rowIdx + 1)) / (rows + 1);
        allPoints.push({ x: side, y: yPos, color });
      }
    } else if (placement === 'center') {
      // Center bars (Inside/Core)
      // Distribute horizontally at h/2, avoiding edges to prevent overlap with Costela
      for (let i = 0; i < count; i++) {
        // (i + 1) / (count + 1) gives e.g. 1/2 for 1 bar, 1/3 & 2/3 for 2 bars -> Distinct from sides
        const xPos = (w * (i + 1)) / (count + 1);
        allPoints.push({ x: xPos, y: h / 2, color });
      }
    }
  });

  // Calculate Zones for Interaction
  const topZoneHeight = h * 0.35;
  const bottomZoneHeight = h * 0.35;
  // Side zone is the middle part
  const sideZoneY = topZoneHeight;
  const sideZoneH = h - topZoneHeight - bottomZoneHeight;

  return (
    <div className="flex flex-col items-center select-none">
      <div className="bg-white p-2 flex items-center justify-center relative transition-all" style={{ minWidth: '200px', height: '200px' }}>
        <svg width={w + padding * 2} height={h + padding * 2} viewBox={`-${padding} -${padding} ${w + padding * 2} ${h + padding * 2}`} className="overflow-visible">

          {/* Interactive Zones (Underlay) */}
          {onZoneClick && (
            <g className="cursor-pointer">
              {/* Top Zone */}
              <rect
                x={-10} y={-10} width={w + 20} height={topZoneHeight + 10}
                fill={selectedZone === 'top' ? '#dbeafe' : 'transparent'}
                className="hover:fill-blue-50 transition-colors"
                onClick={() => onZoneClick('top')}
              />
              {/* Bottom Zone */}
              <rect
                x={-10} y={h - bottomZoneHeight} width={w + 20} height={bottomZoneHeight + 10}
                fill={selectedZone === 'bottom' ? '#dbeafe' : 'transparent'}
                className="hover:fill-blue-50 transition-colors"
                onClick={() => onZoneClick('bottom')}
              />
              {/* Side Zone (Middle) */}
              <rect
                x={-10} y={sideZoneY} width={w + 20} height={sideZoneH}
                fill={selectedZone === 'distributed' ? '#dbeafe' : 'transparent'}
                className="hover:fill-blue-50 transition-colors"
                onClick={() => onZoneClick('distributed')}
              />
              {/* Center Zone (Inner Core) */}
              <rect
                x={w * 0.25} y={h * 0.25} width={w * 0.5} height={h * 0.5}
                fill={selectedZone === 'center' ? '#dbeafe' : 'transparent'}
                className="hover:fill-blue-100 transition-colors"
                stroke={selectedZone === 'center' ? '#3b82f6' : 'none'}
                strokeDasharray="2 2"
                onClick={(e) => { e.stopPropagation(); onZoneClick('center'); }}
              />
            </g>
          )}

          {/* Section Box */}
          <rect x="0" y="0" width={w} height={h} fill="none" stroke="#000" strokeWidth="2" pointerEvents="none" />
          {/* Concrete Hatch */}
          <path d={`M0,${h} L${w},0`} stroke="#000" strokeWidth="0.5" opacity="0.1" pointerEvents="none" />

          {/* Inner Stirrup */}
          <rect x="4" y="4" width={w - 8} height={h - 8} fill="none" stroke="#000" strokeWidth="1.5" rx="1" pointerEvents="none" />

          {/* Bars */}
          {allPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.color} pointerEvents="none" />
          ))}

          {/* External Dimensions */}
          <TechnicalDimension x1={0} y1={h} x2={w} y2={h} text={`${Math.round(width)}`} offset={10} />
          <TechnicalDimension x1={0} y1={0} x2={0} y2={h} text={`${Math.round(height)}`} offset={-10} vertical />

          {/* Zone Labels (Mock) */}
          {onZoneClick && (
            <>
              <text x={w / 2} y={-15} textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="bold" opacity="0.5">SUPERIOR</text>
              <text x={w / 2} y={h + 25} textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="bold" opacity="0.5">INFERIOR</text>
              <text x={w / 2} y={h / 2} textAnchor="middle" fontSize="6" fill="#94a3b8" fontWeight="bold" opacity="0.3" pointerEvents="none">CENTRO</text>
            </>
          )}

        </svg>
      </div>
    </div>
  );
};

// Nova Visualização Longitudinal Interativa (Elevação Detalhada)
const BeamElevationView: React.FC<{
  item: SteelItem;
  onEditBar: (idx: number) => void;
  onRemoveBar: (idx: number) => void;
  onBarUpdate?: (idx: number, newOffset: number) => void;
  newBar?: MainBarGroup; // Current draft bar
  onNewBarUpdate?: (newOffset: number) => void;
  selectedIdx?: number;
  readOnly?: boolean;
}> = ({ item, onEditBar, onRemoveBar, onBarUpdate, newBar, onNewBarUpdate, selectedIdx, readOnly }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const viewW = 1000;
  const viewH = 800;
  const padX = 60;

  const [draggingBarIdx, setDraggingBarIdx] = useState<number | 'new' | null>(null);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Vertical Layout Zones with Stacking
  const topZoneStart = 30; // Start flowing down from here
  const bottomZoneStart = 280; // Start flowing up from here? Or down? Typically bottom bars flow UP or are just listed.
  // Reference image shows Bottom bars (N3) at bottom, then N5 (Skin) in middle, N2/N1 at top.
  // Let's define:
  // - Top Bars: Start at Y=50 and stack DOWNWARDS.
  // - Beam Top Face: Y=150
  // - Beam Bottom Face: Y=200
  // - Bottom Bars: Start at Y=230 and stack DOWNWARDS.
  // - Side/Distributed Bars: Start at Y=300?

  // Revised Stacking Strategy to match typical detailing:
  // Top Bars (Negative): List them ABOVE the beam.
  // Bottom Bars (Positive): List them BELOW the beam.
  // Side Bars (Skin): List them BELOW bottom bars or IN BETWEEN?
  // Let's put Top Bars starting at Y=20, stacking down.
  // Beam Drawing at Y=140 to Y=190 (50px height).
  // Bottom Bars starting at Y=220, stacking down.

  const beamTopY = 375;
  const beamBotY = 425;

  // Calculate effective length from all bars extents (including the one being added)
  const getExtents = () => {
    const bars = [...item.mainBars];
    if (newBar) bars.push(newBar);
    if (bars.length === 0) return Math.max(1, item.length * 100);
    return Math.max(item.length * 100, ...bars.map(b => (b.offset || 0) + (b.segmentA || 0)));
  };

  const effectiveLengthCm = getExtents();

  // Width for scale calculation (available space)
  const availableWidthPx = viewW - 2 * padX;
  const scaleX = Math.min(availableWidthPx / (effectiveLengthCm || 1), 1.5);

  // Pixels used by the actual span
  const totalWidthPx = effectiveLengthCm * scaleX;
  const actualPadX = (viewW - totalWidthPx) / 2;

  const handleMouseDown = (e: React.MouseEvent, idx: number | 'new', currentOffset: number) => {
    if (readOnly) return;

    if (!svgRef.current) return;

    // Explicitly focus the SVG to ensure keyboard events work correctly
    svgRef.current.focus();

    // Blur any active input to allow arrow keys to move the bar
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

    e.stopPropagation();
    e.preventDefault();
    setDraggingBarIdx(idx);
    setDragStartX(svgPoint.x);
    setInitialOffset(currentOffset);
    setIsDragging(false);

    // Also select this bar for keyboard movement (only for existing bars)
    if (typeof idx === 'number') {
      onEditBar(idx);
    }
  };

  useEffect(() => {
    if (draggingBarIdx === null) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      if (draggingBarIdx === null || !svgRef.current) return;

      const pt = svgRef.current.createSVGPoint();
      pt.x = e.clientX;
      const svgPoint = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

      const deltaSVG = svgPoint.x - dragStartX;
      if (Math.abs(deltaSVG) > 2) setIsDragging(true);

      const deltaCm = deltaSVG / scaleX;
      let nextOffset = Math.round(initialOffset + deltaCm);

      const bar = draggingBarIdx === 'new' ? newBar : item.mainBars[draggingBarIdx];
      if (!bar) return;

      // REMOVED: Rigid constraints based on initial length. 
      // This allows the user to "expand" the beam by dragging bars further.
      const maxPossibleOffset = 2000; // 20 meters safety limit

      nextOffset = Math.max(0, Math.min(nextOffset, maxPossibleOffset));

      if (draggingBarIdx === 'new') {
        onNewBarUpdate?.(nextOffset);
      } else {
        onBarUpdate?.(draggingBarIdx, nextOffset);
      }
    };

    const handleWindowMouseUp = () => {
      setDraggingBarIdx(null);
      setTimeout(() => setIsDragging(false), 50);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingBarIdx, dragStartX, initialOffset, scaleX, onBarUpdate, item.mainBars, item.length]);

  const handleMouseUp = () => {
    setDraggingBarIdx(null);
  };

  // Filter bars
  const topBars = item.mainBars.flatMap((b, idx) => ({ ...b, originalIdx: idx })).filter(b => b.placement === 'top');
  const bottomBars = item.mainBars.flatMap((b, idx) => ({ ...b, originalIdx: idx })).filter(b => b.placement === 'bottom' || !b.placement);
  const sideBars = item.mainBars.flatMap((b, idx) => ({ ...b, originalIdx: idx })).filter(b => b.placement === 'distributed');
  const centerBars = item.mainBars.flatMap((b, idx) => ({ ...b, originalIdx: idx })).filter(b => b.placement === 'center');

  // Stirrups
  const spacing = item.stirrupSpacing || 20;
  const numStirrups = Math.floor(effectiveLengthCm / spacing);
  const visualStep = numStirrups > 40 ? Math.ceil(numStirrups / 40) : 1;
  const stirrupData: { x: number; stirrupIdx: number; stirrupCm: number }[] = [];
  for (let i = 0; i <= numStirrups; i += visualStep) {
    stirrupData.push({
      x: actualPadX + (i * spacing * scaleX),
      stirrupIdx: i,
      stirrupCm: i * spacing
    });
  }

  const renderInteractableBar = (group: MainBarGroup & { originalIdx: number }, yBase: number, isTop: boolean) => {
    const baseLenCm = (group.segmentA && group.segmentA > 0) ? group.segmentA : Math.round(group.usage.includes('Largura') ? (item.width || 0) * 100 : item.length * 100);

    // Calculate start X based on offset - using scope scaleX
    const offsetCm = group.offset || 0;
    const startX = actualPadX + (offsetCm * scaleX);
    const pxLen = baseLenCm * scaleX;

    // Total Length Calculation (C)
    const extraCm = (group.segmentB || (group.hookStartType !== 'none' ? group.hookStart : 0)) +
      (group.segmentC || (group.hookEndType !== 'none' ? group.hookEnd : 0)) +
      (group.segmentD || 0) +
      (group.segmentE || 0);
    const C = Math.round(baseLenCm + extraCm);

    const hookStart = group.segmentB || (group.hookStartType !== 'none' ? group.hookStart : 0);
    const hookEnd = group.segmentC || (group.hookEndType !== 'none' ? group.hookEnd : 0);

    const hookH = 15;
    const inwardH = 12;
    const isCShape = group.shape?.startsWith('c_');
    const isBeingDragged = draggingBarIdx === group.originalIdx;
    const isSelected = selectedIdx === group.originalIdx;

    let d = "";
    // Start Hook
    if (group.hookStartType === 'up') {
      if (isCShape && group.segmentD) {
        d = `M ${startX + inwardH},${yBase - hookH} L ${startX},${yBase - hookH} L ${startX},${yBase} `;
      } else {
        d = `M ${startX},${yBase - hookH} L ${startX},${yBase} `;
      }
    } else if (group.hookStartType === 'down') {
      if (isCShape && group.segmentD) {
        d = `M ${startX + inwardH},${yBase + hookH} L ${startX},${yBase + hookH} L ${startX},${yBase} `;
      } else {
        d = `M ${startX},${yBase + hookH} L ${startX},${yBase} `;
      }
    } else {
      d = `M ${startX},${yBase} `;
    }

    // Span
    d += `L ${startX + pxLen},${yBase} `;

    // End Hook
    if (group.hookEndType === 'up') {
      d += `L ${startX + pxLen},${yBase - hookH}`;
      if (isCShape && group.segmentE) d += ` L ${startX + pxLen - inwardH},${yBase - hookH}`;
    } else if (group.hookEndType === 'down') {
      d += `L ${startX + pxLen},${yBase + hookH}`;
      if (isCShape && group.segmentE) d += ` L ${startX + pxLen - inwardH},${yBase + hookH}`;
    }

    const isNew = group.originalIdx === 'new';
    const displayPos = group.position || (isNew ? "Novo" : `N${group.originalIdx + 1}`);
    const label = `${group.count} ${displayPos} ø${group.gauge} C=${C}`;

    return (
      <g
        key={group.originalIdx}
        className={readOnly ? "" : `cursor-grab ${isBeingDragged ? 'cursor-grabbing opacity-100 scale-[1.01]' : 'group hover:opacity-80'}`}
        onMouseDown={(e) => handleMouseDown(e, group.originalIdx, offsetCm)}
        onClick={(e) => {
          e.stopPropagation();
          if (!readOnly && !isDragging && draggingBarIdx === null) onEditBar(group.originalIdx);
        }}
      >
        {/* Invisible Hit Area for easier clicking - Larger when dragging */}
        <rect x={startX - 20} y={yBase - 20} width={pxLen + 40} height={40} fill="transparent" />

        {/* Selected Highlight Aura */}
        {isSelected && (
          <rect
            x={startX - 5} y={yBase - 15}
            width={pxLen + 10} height={30}
            fill="none" stroke="#6366f1" strokeWidth="2"
            rx="5" className="animate-pulse"
            strokeDasharray="4 2"
          />
        )}

        {/* The Bar Line - Highlight if dragged or selected */}
        <path
          d={d}
          fill="none"
          stroke={isBeingDragged || isSelected ? "#3b82f6" : (isTop ? "#ef4444" : "#0f172a")}
          strokeWidth={isBeingDragged || isSelected ? 5 : 3}
          className="transition-all shadow-sm"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Info Box / Label */}
        {/* Info Box / Label (Converted to SVG Text for precision) */}
        <text
          x={startX + pxLen / 2}
          y={yBase + 2}
          textAnchor="middle"
          dominantBaseline="hanging"
          className={`text-[11px] font-black uppercase tracking-tight transition-all select-none ${isSelected ? 'fill-indigo-600 scale-110' : (readOnly ? 'fill-slate-800' : 'fill-indigo-800 group-hover:fill-amber-800 group-hover:scale-110')}`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {label}
        </text>

        {/* Dimension Labels (Hooks) */}
        {hookStart > 0 && <text x={startX - 10} y={yBase} textAnchor="end" fontSize="11" fontWeight="900" fill="#475569" dominantBaseline="middle">{hookStart}</text>}
        {hookEnd > 0 && <text x={startX + pxLen + 10} y={yBase} textAnchor="start" fontSize="11" fontWeight="900" fill="#475569" dominantBaseline="middle">{hookEnd}</text>}

        {/* Length Label (Middle) */}
        <text x={startX + pxLen / 2} y={yBase - 3} textAnchor="middle" fontSize="11" fontWeight="900" fill="#64748b" className="select-none">{Math.round(baseLenCm)}cm</text>

        {!readOnly && (
          <g className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onRemoveBar(group.originalIdx); }}>
            <circle cx={startX + pxLen + 35} cy={yBase} r={10} fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
            <path d={`M${startX + pxLen + 31},${yBase - 4} L${startX + pxLen + 39},${yBase + 4} M${startX + pxLen + 39},${yBase - 4} L${startX + pxLen + 31},${yBase + 4}`} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-200 shadow-xl flex flex-col items-center w-full mx-auto overflow-hidden relative" style={{ width: '100%' }}>
      <div className="flex justify-between w-full mb-6 px-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-6 bg-indigo-500 rounded-full" />
          <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Detalhamento Long. Profissional</span>
        </div>
        <div className="flex gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" /> Superior
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-slate-800" /> Inferior
          </span>
        </div>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height={viewH}
        viewBox={`0 0 ${viewW} ${viewH}`}
        className={`bg-white rounded-[2rem] border-2 border-slate-100 shadow-inner overflow-visible select-none outline-none ${draggingBarIdx !== null ? 'cursor-grabbing' : ''}`}
        tabIndex={0}
      >

        <defs>
          <pattern id="technicalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
          <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: '#475569', strokeWidth: 1 }} opacity="0.1" />
          </pattern>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#technicalGrid)" rx="32" />

        {/* Element Name/Identifier (Top Left) */}
        <g transform="translate(30, 40)">
          <text fontSize="28" fontWeight="900" fill="#0f172a" fontFamily="Arial, sans-serif">
            {item.observation || item.type}
          </text>
          <text y="20" fontSize="12" fill="#64748b" fontWeight="bold">ESC 1:50</text>
        </g>

        {/* Top (Negative) Reinforcement Stack */}
        {topBars.map((b, i) => {
          // Stack upwards from beam top
          const y = beamTopY - 40 - (i * 35);
          return renderInteractableBar(b, y, true);
        })}

        {/* Beam Body / Stirrups */}
        <g>
          <rect x={actualPadX} y={beamTopY} width={totalWidthPx} height={50} fill="url(#diagonalHatch)" stroke="#0f172a" strokeWidth="2" rx="4" />
          {/* Stirrup Lines - Skip support zones */}
          {stirrupData.map((stirrup, idx) => {
            // Check if this stirrup position falls within a gap zone
            const stirrupCm = stirrup.stirrupCm;
            const supports = item.supports || [];
            const startGap = item.startGap || 0;
            const endGap = item.endGap || 0;
            const beamLen = effectiveLengthCm;

            // Skip if in start gap
            if (stirrupCm < startGap) return null;

            // Skip if in end gap
            if (stirrupCm > beamLen - endGap) return null;

            // Skip if in any support gap zone (left or right of support)
            const inSupportGap = supports.some(s => {
              const leftBound = s.position - (s.leftGap || 0);
              const rightBound = s.position + (s.rightGap || 0);
              return stirrupCm >= leftBound && stirrupCm <= rightBound;
            });
            if (inSupportGap) return null;

            return (
              <line key={idx} x1={stirrup.x} y1={beamTopY} x2={stirrup.x} y2={beamTopY + 50} stroke="#0f172a" strokeWidth="1" strokeOpacity="0.3" />
            );
          })}
          {/* Axis Line */}
          <line x1={actualPadX - 10} y1={beamTopY + 25} x2={actualPadX + totalWidthPx + 10} y2={beamTopY + 25} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
        </g>

        {/* Support Markers and Gap Lines */}
        <g>
          {/* === PINK LINES: Beam Extremities === */}
          <line x1={actualPadX} y1={beamTopY - 30} x2={actualPadX} y2={beamBotY + 30} stroke="#db2777" strokeWidth="2" />
          <line x1={actualPadX + totalWidthPx} y1={beamTopY - 30} x2={actualPadX + totalWidthPx} y2={beamBotY + 30} stroke="#db2777" strokeWidth="2" />

          {/* === BLUE LINES: Gap Boundaries (Start/End of stirrup zones) === */}
          {/* Start Gap */}
          {(item.startGap || 0) > 0 && (
            <line
              x1={actualPadX + (item.startGap || 0) * scaleX}
              y1={beamTopY - 20}
              x2={actualPadX + (item.startGap || 0) * scaleX}
              y2={beamBotY + 20}
              stroke="#2563eb"
              strokeWidth="1.5"
            />
          )}
          {/* End Gap */}
          {(item.endGap || 0) > 0 && (
            <line
              x1={actualPadX + totalWidthPx - (item.endGap || 0) * scaleX}
              y1={beamTopY - 20}
              x2={actualPadX + totalWidthPx - (item.endGap || 0) * scaleX}
              y2={beamBotY + 20}
              stroke="#2563eb"
              strokeWidth="1.5"
            />
          )}

          {/* Intermediate Supports with Left/Right Gap Lines */}
          {(item.supports || []).map((support, idx) => {
            const supportX = actualPadX + (support.position * scaleX);
            const leftGapPx = ((support.leftGap || 0)) * scaleX;
            const rightGapPx = ((support.rightGap || 0)) * scaleX;

            return (
              <g key={idx}>
                {/* PINK: Central Support Line */}
                <line x1={supportX} y1={beamTopY - 30} x2={supportX} y2={beamBotY + 30} stroke="#db2777" strokeWidth="2" />

                {/* BLUE: Left Gap Boundary */}
                <line
                  x1={supportX - leftGapPx}
                  y1={beamTopY - 20}
                  x2={supportX - leftGapPx}
                  y2={beamBotY + 20}
                  stroke="#2563eb"
                  strokeWidth="1.5"
                />

                {/* BLUE: Right Gap Boundary */}
                <line
                  x1={supportX + rightGapPx}
                  y1={beamTopY - 20}
                  x2={supportX + rightGapPx}
                  y2={beamBotY + 20}
                  stroke="#2563eb"
                  strokeWidth="1.5"
                />

                {/* Support Label */}
                <text x={supportX} y={beamBotY + 50} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#db2777">
                  {support.label || `P${idx + 1}`}
                </text>
              </g>
            );
          })}

          {/* === DIMENSION ANNOTATIONS === */}
          {(() => {
            const annotations: React.ReactNode[] = [];
            const dimY = beamBotY + 60; // Y position for dimension line (right below beam)
            const supports = item.supports || [];
            const sortedSupports = [...supports].sort((a, b) => a.position - b.position);
            const beamLen = effectiveLengthCm;

            // Build spans from supports
            let currentPos = 0;

            // Start Gap
            const startGap = item.startGap || 0;
            if (startGap > 0) {
              const x1 = actualPadX;
              const x2 = actualPadX + startGap * scaleX;
              annotations.push(
                <g key="start-gap">
                  <line x1={x1} y1={dimY} x2={x2} y2={dimY} stroke="#64748b" strokeWidth="0.5" />
                  <text x={(x1 + x2) / 2} y={dimY + 12} textAnchor="middle" fontSize="10" fill="#64748b">{startGap}</text>
                </g>
              );
              currentPos = startGap;
            }

            // Process each support
            sortedSupports.forEach((support, idx) => {
              const leftGap = support.leftGap || 0;
              const rightGap = support.rightGap || 0;
              const stirrupZoneEnd = support.position - leftGap;
              const stirrupZoneStart = currentPos;
              const stirrupZoneLen = stirrupZoneEnd - stirrupZoneStart;

              if (stirrupZoneLen > 0) {
                // Stirrup zone dimension
                const x1 = actualPadX + stirrupZoneStart * scaleX;
                const x2 = actualPadX + stirrupZoneEnd * scaleX;
                const stirrupCount = Math.floor(stirrupZoneLen / spacing);

                annotations.push(
                  <g key={`zone-${idx}`}>
                    <line x1={x1} y1={dimY} x2={x2} y2={dimY} stroke="#0f172a" strokeWidth="1" />
                    <line x1={x1} y1={dimY - 3} x2={x1} y2={dimY + 3} stroke="#0f172a" strokeWidth="1" />
                    <line x1={x2} y1={dimY - 3} x2={x2} y2={dimY + 3} stroke="#0f172a" strokeWidth="1" />
                    <text x={(x1 + x2) / 2} y={dimY + 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">{Math.round(stirrupZoneLen)}</text>
                    <text x={(x1 + x2) / 2} y={dimY + 24} textAnchor="middle" fontSize="9" fill="#64748b">{stirrupCount} {item.stirrupPosition || 'N2'} c/{spacing}</text>
                  </g>
                );
              }

              // Left gap of support
              if (leftGap > 0) {
                const gx1 = actualPadX + (support.position - leftGap) * scaleX;
                const gx2 = actualPadX + support.position * scaleX;
                annotations.push(
                  <g key={`lgap-${idx}`}>
                    <line x1={gx1} y1={dimY} x2={gx2} y2={dimY} stroke="#2563eb" strokeWidth="0.5" />
                    <text x={(gx1 + gx2) / 2} y={dimY + 12} textAnchor="middle" fontSize="9" fill="#2563eb">{leftGap}</text>
                  </g>
                );
              }

              // Right gap of support
              if (rightGap > 0) {
                const gx1 = actualPadX + support.position * scaleX;
                const gx2 = actualPadX + (support.position + rightGap) * scaleX;
                annotations.push(
                  <g key={`rgap-${idx}`}>
                    <line x1={gx1} y1={dimY} x2={gx2} y2={dimY} stroke="#2563eb" strokeWidth="0.5" />
                    <text x={(gx1 + gx2) / 2} y={dimY + 12} textAnchor="middle" fontSize="9" fill="#2563eb">{rightGap}</text>
                  </g>
                );
              }

              currentPos = support.position + rightGap;
            });

            // Last span (after last support to end of beam)
            const endGap = item.endGap || 0;
            const lastStirrupZoneEnd = beamLen - endGap;
            const lastStirrupZoneLen = lastStirrupZoneEnd - currentPos;

            if (lastStirrupZoneLen > 0) {
              const x1 = actualPadX + currentPos * scaleX;
              const x2 = actualPadX + lastStirrupZoneEnd * scaleX;
              const stirrupCount = Math.floor(lastStirrupZoneLen / spacing);

              annotations.push(
                <g key="last-zone">
                  <line x1={x1} y1={dimY} x2={x2} y2={dimY} stroke="#0f172a" strokeWidth="1" />
                  <line x1={x1} y1={dimY - 3} x2={x1} y2={dimY + 3} stroke="#0f172a" strokeWidth="1" />
                  <line x1={x2} y1={dimY - 3} x2={x2} y2={dimY + 3} stroke="#0f172a" strokeWidth="1" />
                  <text x={(x1 + x2) / 2} y={dimY + 12} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">{Math.round(lastStirrupZoneLen)}</text>
                  <text x={(x1 + x2) / 2} y={dimY + 24} textAnchor="middle" fontSize="9" fill="#64748b">{stirrupCount} {item.stirrupPosition || 'N2'} c/{spacing}</text>
                </g>
              );
            }

            // End Gap
            if (endGap > 0) {
              const x1 = actualPadX + totalWidthPx - endGap * scaleX;
              const x2 = actualPadX + totalWidthPx;
              annotations.push(
                <g key="end-gap">
                  <line x1={x1} y1={dimY} x2={x2} y2={dimY} stroke="#64748b" strokeWidth="0.5" />
                  <text x={(x1 + x2) / 2} y={dimY + 12} textAnchor="middle" fontSize="10" fill="#64748b">{endGap}</text>
                </g>
              );
            }

            return annotations;
          })()}
        </g>

        {/* Bottom (Positive) Reinforcement Stack */}
        {bottomBars.map((b, i) => {
          const y = beamBotY + 110 + (i * 35);
          return renderInteractableBar(b, y, false);
        })}

        {/* Center (Interior) Reinforcement Stack */}
        {centerBars.map((b, i) => {
          const y = beamBotY + 110 + (bottomBars.length * 35) + 20 + (i * 35);
          return renderInteractableBar(b, y, false);
        })}

        {/* Side (Distributed) Reinforcement Stack */}
        {sideBars.map((b, i) => {
          const y = beamBotY + 110 + (bottomBars.length * 35) + 20 + (centerBars.length * 35) + 20 + (i * 35);
          return renderInteractableBar(b, y, false);
        })}

        {/* Ruler (Regua de Medição) */}
        <g transform={`translate(${actualPadX}, ${viewH - 80})`}>
          <line x1={0} y1={0} x2={totalWidthPx} y2={0} stroke="#cbd5e1" strokeWidth="2" />
          {Array.from({ length: Math.floor(effectiveLengthCm / 100) + 1 }).map((_, i) => {
            const x = i * 100 * scaleX;
            return (
              <g key={i} transform={`translate(${x}, 0)`}>
                <line x1={0} y1={0} x2={0} y2={15} stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
                <text y={35} textAnchor="middle" fontSize="14" className="fill-slate-800 font-black tabular-nums">{i}m</text>
              </g>
            );
          })}
          {/* Detailed ticks every 10cm for better precision */}
          {Array.from({ length: Math.floor(effectiveLengthCm / 10) + 1 }).map((_, i) => {
            const x = i * 10 * scaleX;
            if (i % 10 === 0) return null;
            const isMid = i % 5 === 0;
            return <line key={`t-${i}`} x1={x} y1={0} x2={x} y2={isMid ? 8 : 4} stroke="#94a3b8" strokeWidth={isMid ? 1.5 : 1} />;
          })}
        </g>

        {/* Draft Bar (New Bar being added) */}
        {newBar && selectedIdx === undefined && (newBar.segmentA || 0) > 0 && (
          <g opacity="0.6" strokeDasharray="5 2">
            {renderInteractableBar({ ...newBar, originalIdx: 'new' as any } as any, beamBotY + 220, false)}
          </g>
        )}

        {/* Stirrup Callout */}
        <TechnicalDimension
          x1={actualPadX} y1={beamBotY + 15}
          x2={actualPadX + totalWidthPx} y2={beamBotY + 15}
          text={`${Math.floor(numStirrups)} ${item.stirrupPosition || 'EST'} c/${spacing}`}
          offset={0}
        />

        {/* Pattern Definition for Concrete Hatch */}
        <defs>
          <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
            <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#cbd5e1" strokeWidth="1" />
          </pattern>
        </defs>

        {/* SEÇÃO A-A - Dynamic & Positioned after content */}
        <g transform={`translate(${Math.max(actualPadX + totalWidthPx + 60, viewW - 200)}, ${viewH / 2 - 190})`}>


          {/* Title Group */}
          <g transform="translate(80, 25)">
            <text textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0f172a" textDecoration="underline">SEÇÃO A-A</text>
            <text y="16" textAnchor="middle" fontSize="11" fill="#64748b">ESC 1:25</text>
          </g>

          {/* Main Cross Section Drawing (Dynamic Scale) */}
          <g transform="translate(40, 60)">
            {(() => {
              const sW = item.stirrupWidth || 20;
              const sH = item.stirrupHeight || 40;
              const coverCm = 6; // 3cm de cada lado
              const concreteW = sW + coverCm;
              const concreteH = sH + coverCm;
              const scale = Math.min(100 / concreteW, 140 / concreteH);
              const pW = concreteW * scale;
              const pH = concreteH * scale;
              const coverPx = (coverCm / 2) * scale; // 3cm em pixels

              return (
                <g>
                  {/* Dimensions - Left (Height) */}
                  <g transform="translate(-15, 0)">
                    <line x1={8} y1={0} x2={8} y2={pH} stroke="#000" strokeWidth="0.5" />
                    <line x1={5} y1={0} x2={11} y2={0} stroke="#000" strokeWidth="0.5" />
                    <line x1={5} y1={pH} x2={11} y2={pH} stroke="#000" strokeWidth="0.5" />
                    <text x={0} y={pH / 2} textAnchor="end" dominantBaseline="middle" fontSize="12" fontWeight="bold" transform={`rotate(-90, 0, ${pH / 2})`}>{Math.round(concreteH)}</text>
                  </g>



                  {/* Background with Hatch (Concrete) */}
                  <rect x={0} y={0} width={pW} height={pH} fill="url(#diagonalHatch)" stroke="none" />

                  {/* Outer Border (Blue - Formwork/Concrete limit) */}
                  <rect x={0} y={0} width={pW} height={pH} fill="none" stroke="#2563eb" strokeWidth="1.5" />

                  {/* Inner Stirrup (Black) - positioned with cover offset */}
                  <rect x={coverPx} y={coverPx} width={pW - coverPx * 2} height={pH - coverPx * 2} fill="none" stroke="#000" strokeWidth="2" />

                  {/* Hook Cross (Top Left) */}
                  <line x1={coverPx + 2} y1={coverPx + 6} x2={coverPx + 10} y2={coverPx + 6} stroke="#000" strokeWidth="1.5" />
                  <line x1={coverPx + 6} y1={coverPx + 2} x2={coverPx + 6} y2={coverPx + 10} stroke="#000" strokeWidth="1.5" />

                  {/* Dimensions - Bottom (Width) */}
                  <g transform={`translate(0, ${pH + 12})`}>
                    <line x1={0} y1={-4} x2={pW} y2={-4} stroke="#000" strokeWidth="0.5" />
                    <line x1={0} y1={-7} x2={0} y2={-1} stroke="#000" strokeWidth="0.5" />
                    <line x1={pW} y1={-7} x2={pW} y2={-1} stroke="#000" strokeWidth="0.5" />
                    <text x={pW / 2} y={10} textAnchor="middle" fontSize="12" fontWeight="bold">{Math.round(concreteW)}</text>
                  </g>

                  {/* Bars Punctuation - Reflects actual bars */}
                  {(() => {
                    const barMargin = coverPx + 4;
                    const barAreaW = pW - barMargin * 2;
                    const barAreaH = pH - barMargin * 2;
                    const circles: React.ReactNode[] = [];

                    // Top bars
                    const topBars = item.mainBars.filter(b => b.placement === 'top');
                    const topCount = topBars.reduce((sum, b) => sum + b.count, 0);
                    if (topCount > 0) {
                      Array.from({ length: topCount }).forEach((_, i) => {
                        const cx = barMargin + (topCount > 1 ? i * (barAreaW / (topCount - 1)) : barAreaW / 2);
                        circles.push(<circle key={`t${i}`} cx={cx} cy={coverPx + 4} r={2.5} fill="#2563eb" />);
                      });
                    }

                    // Bottom bars
                    const botBars = item.mainBars.filter(b => b.placement === 'bottom' || !b.placement);
                    const botCount = botBars.reduce((sum, b) => sum + b.count, 0);
                    if (botCount > 0) {
                      Array.from({ length: botCount }).forEach((_, i) => {
                        const cx = barMargin + (botCount > 1 ? i * (barAreaW / (botCount - 1)) : barAreaW / 2);
                        circles.push(<circle key={`b${i}`} cx={cx} cy={pH - coverPx - 4} r={2.5} fill="#2563eb" />);
                      });
                    }

                    // Side/Distributed bars (on left and right edges)
                    const sideBars = item.mainBars.filter(b => b.placement === 'distributed');
                    const sideCount = sideBars.reduce((sum, b) => sum + b.count, 0);
                    if (sideCount > 0) {
                      const perSide = Math.ceil(sideCount / 2);
                      // Left side
                      Array.from({ length: perSide }).forEach((_, i) => {
                        const cy = barMargin + (perSide > 1 ? i * (barAreaH / (perSide - 1)) : barAreaH / 2);
                        circles.push(<circle key={`sl${i}`} cx={coverPx + 4} cy={cy} r={2.5} fill="#10b981" />);
                      });
                      // Right side
                      Array.from({ length: sideCount - perSide }).forEach((_, i) => {
                        const rightCount = sideCount - perSide;
                        const cy = barMargin + (rightCount > 1 ? i * (barAreaH / (rightCount - 1)) : barAreaH / 2);
                        circles.push(<circle key={`sr${i}`} cx={pW - coverPx - 4} cy={cy} r={2.5} fill="#10b981" />);
                      });
                    }

                    // Center bars
                    const centerBars = item.mainBars.filter(b => b.placement === 'center');
                    const centerCount = centerBars.reduce((sum, b) => sum + b.count, 0);
                    if (centerCount > 0) {
                      Array.from({ length: centerCount }).forEach((_, i) => {
                        const cx = barMargin + (centerCount > 1 ? i * (barAreaW / (centerCount - 1)) : barAreaW / 2);
                        circles.push(<circle key={`c${i}`} cx={cx} cy={pH / 2} r={2.5} fill="#f59e0b" />);
                      });
                    }

                    return circles;
                  })()}
                </g>
              );
            })()}
          </g>

          {/* Stirrup Detail - Below */}
          <g transform="translate(40, 240)">
            {(() => {
              const sW = item.stirrupWidth || 20;
              const sH = item.stirrupHeight || 40;
              const scale = Math.min(80 / sW, 100 / sH);
              const pW = sW * scale;
              const pH = sH * scale;

              return (
                <g>
                  {/* Stirrup Shape - Full Rectangle */}
                  <rect x={0} y={0} width={pW} height={pH} fill="none" stroke="#000" strokeWidth="2" />

                  {/* Hook Cross Detail (Top Left) */}
                  {/* Hooks crossing inwards at top-left corner */}
                  <path d="M4,4 L12,4" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4,4 L4,12" stroke="#000" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4,4 L8,8" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Dimensions */}
                  <text x={pW + 10} y={pH / 2} dominantBaseline="middle" fontSize="14" fill="#000">{Math.round(sH)}</text>
                  <text x={pW / 2} y={pH + 18} textAnchor="middle" fontSize="14" fill="#000">{Math.round(sW)}</text>

                  {/* Info Text */}
                  <text x={0} y={pH + 45} textAnchor="start" fontSize="12" fontWeight="bold" fill="#0f172a" style={{ whiteSpace: 'pre' }}>
                    {Math.floor(numStirrups)} {item.stirrupPosition || 'N2'} ø{item.stirrupGauge || '5.0'} C={Math.round((sW + sH) * 2 + 10)}
                  </text>
                </g>
              );
            })()}
          </g>
        </g>



      </svg >
      <div className="absolute top-4 right-4 bg-slate-100 rounded-full px-3 py-1 text-[10px] font-bold text-slate-500">
        Clique nas barras para editar
      </div>
    </div >
  );
};

const ItemReinforcementPreview: React.FC<{
  item: SteelItem;
  onEditBar: (idx: number) => void;
  onRemoveBar: (idx: number) => void;
  onEditStirrups: () => void;
  onBarUpdate?: (idx: number, newOffset: number) => void;
}> = ({ item, onEditBar, onRemoveBar, onEditStirrups, onBarUpdate }) => {
  const isSapata = item.type === ElementType.SAPATA;
  if (item.mainBars.length === 0 && !item.hasStirrups) return null;

  return (
    <div className="mt-4 p-5 bg-slate-50/50 rounded-[2rem] border border-slate-100/50 space-y-4">
      {/* Listagem de ferros Individuais */}
      {/* Listagem de ferros Individuais REMOVIDA - Agora Integrada no Desenho */}
      {/* 
        The user explicitly requested to remove the separate card list and merge interaction into the drawing.
        "que tal deixar em um so.. ali conseguimos no desenho fica mais facil de visualizar editar"
      */}

      {/* Resumo da Gaiola / Estribos Automáticos + Seção Visual */}
      {/* Resumo da Gaiola / Estribos Automáticos + Seção Visual */}
      {(item.hasStirrups || (!isSapata && item.mainBars.length > 0)) && (
        <div className="flex flex-col gap-4 items-stretch">
          {/* Technical Project View - Elevation + Section */}
          {!isSapata && (
            <div className="flex flex-wrap gap-6 items-center justify-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              {/* Elevation */}
              {/* Elevation - Now Interactive */}
              <BeamElevationView
                item={item}
                onEditBar={onEditBar}
                onRemoveBar={onRemoveBar}
                onBarUpdate={onBarUpdate}
              />

              {/* Section */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Seção</span>
                  <CompositeCrossSection
                    stirrupW={item.stirrupWidth}
                    stirrupH={item.stirrupHeight}
                    bars={item.mainBars}
                    stirrupPos={item.stirrupPosition}
                    stirrupGauge={item.stirrupGauge}
                    stirrupCount={Math.floor(item.length * 100 / (item.stirrupSpacing || 20))}
                  />
                </div>
              </div>
            </div>
          )}

          {item.hasStirrups && (
            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all group/st ${isSapata ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-100'}`}>
              <div className="flex items-center gap-6">
                {isSapata ? (
                  <CageDrawing lengthCm={Math.round(item.length * 100)} widthCm={Math.round((item.width || 0) * 100)} spacing={item.stirrupSpacing} compact />
                ) : (
                  <StirrupDrawing width={item.stirrupWidth} height={item.stirrupHeight} compact />
                )}

                <div className="flex flex-col">
                  <span className={`text-[9px] font-black uppercase leading-none ${isSapata ? 'text-indigo-700' : 'text-amber-700'}`}>{isSapata ? 'Gaiola Fechada' : 'Estribos'}</span>
                  <span className="text-[12px] font-black text-slate-800">Ø{item.stirrupGauge} c/{item.stirrupSpacing}cm</span>
                </div>

                {isSapata && (
                  <div className="flex gap-4">
                    <div className="text-[10px] font-bold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm border border-indigo-100">
                      {Math.ceil((item.width || 0.8) * 100 / item.stirrupSpacing)} un. no Comprimento
                    </div>
                    <div className="text-[10px] font-bold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-sm border border-indigo-100">
                      {Math.ceil(item.length * 100 / item.stirrupSpacing)} un. na Largura
                    </div>
                  </div>
                )}
              </div>
              <button onClick={onEditStirrups} className={`p-2 transition-all bg-white rounded-xl shadow-sm ${isSapata ? 'text-indigo-600 hover:text-indigo-800' : 'text-amber-600 hover:text-amber-800 opacity-0 group-hover/st:opacity-100'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ client, onSave, onCancel }) => {
  const [items, setItems] = useState<SteelItem[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [editingContext, setEditingContext] = useState<{ item: SteelItem, barIdx?: number, initialTab?: 'ferros' | 'estribos', initialUsage?: BarUsage } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [newItemBase, setNewItemBase] = useState<{ type: ElementType, qty: number, lengthCm: number, widthCm: number, heightCm: number, obs: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // State for AI Analysis loading

  // Helper function to get effective length from bars (uses max segmentA)
  const getEffectiveLength = (item: SteelItem): number => {
    if (item.mainBars.length === 0) {
      return item.length; // Fallback to default if no bars yet
    }
    const maxSegmentA = Math.max(...item.mainBars.map(bar => bar.segmentA || 0));
    return maxSegmentA > 0 ? maxSegmentA / 100 : item.length; // Convert cm to m
  };

  const calculateWeight = (itemsList: SteelItem[]) => {
    return itemsList.reduce((acc, item) => {
      const mainWeight = item.mainBars.reduce((total, group) => {
        const weightPerMeter = STEEL_WEIGHTS[group.gauge] || 0;

        // Base length: prioritize segmentA (cm) then fallback to item.length (m) or item.width (m)
        const baseLenM = (group.segmentA && group.segmentA > 0)
          ? (group.segmentA / 100)
          : (group.usage.includes('Largura') ? (item.width || item.length) : item.length);

        // Legs & Hooks extra (cm): B, C, D, E
        const segmentsExtraCm = (group.segmentB || 0) + (group.segmentC || 0) + (group.segmentD || 0) + (group.segmentE || 0);

        // Fallback extra if segments not used but hooks are (compatibility)
        const hookExtraCm = (!group.segmentB && group.hookStartType !== 'none' ? group.hookStart : 0) +
          (!group.segmentC && group.hookEndType !== 'none' ? group.hookEnd : 0);

        const totalExtraM = (segmentsExtraCm + hookExtraCm) / 100;

        return total + (item.quantity * group.count * (baseLenM + totalExtraM) * weightPerMeter);
      }, 0);

      let totalStirrupWeight = 0;
      if (item.hasStirrups) {
        const effectiveLength = getEffectiveLength(item);
        if (item.type === ElementType.SAPATA) {
          const weightPerMeter = STEEL_WEIGHTS[item.stirrupGauge] || 0;
          const hookCm = (item.height || 20) - 5;
          const hooksM = (hookCm * 2) / 100;
          const countL = Math.ceil((item.width || 0.8) * 100 / item.stirrupSpacing);
          const weightL = item.quantity * countL * (effectiveLength + hooksM) * weightPerMeter;
          const countW = Math.ceil(effectiveLength * 100 / item.stirrupSpacing);
          const weightW = item.quantity * countW * ((item.width || 0.8) + hooksM) * weightPerMeter;
          totalStirrupWeight = weightL + weightW;
        } else {
          const stirrupCount = Math.ceil((effectiveLength * 100) / item.stirrupSpacing);
          const stirrupPerimeter = (item.stirrupWidth * 2 + item.stirrupHeight * 2 + 10) / 100;
          totalStirrupWeight = item.quantity * stirrupCount * stirrupPerimeter * (STEEL_WEIGHTS[item.stirrupGauge] || 0);
        }
      }
      return acc + mainWeight + totalStirrupWeight;
    }, 0);
  };

  const confirmNewItem = () => {
    if (!newItemBase) return;
    const lengthM = newItemBase.lengthCm / 100;
    const widthM = newItemBase.widthCm / 100;
    const newItem: SteelItem = {
      id: crypto.randomUUID(),
      type: newItemBase.type,
      observation: newItemBase.obs,
      quantity: newItemBase.qty,
      length: lengthM,
      width: newItemBase.type === ElementType.SAPATA ? widthM : undefined,
      height: newItemBase.heightCm,
      mainBars: [],
      hasStirrups: newItemBase.type === ElementType.SAPATA,
      stirrupGauge: newItemBase.type === ElementType.SAPATA ? '10.0' : '5.0',
      stirrupSpacing: 15,
      stirrupWidth: newItemBase.type === ElementType.SAPATA ? (newItemBase.widthCm) : 15,
      stirrupHeight: newItemBase.type === ElementType.SAPATA ? (newItemBase.heightCm) : 20,
      isConfigured: false
    };
    setItems([...items, newItem]);
    setNewItemBase(null);
    setShowTypeSelector(false);
    // Don't open editor automatically. User selects from the list.
  };

  const saveBarConfig = (updatedItem: SteelItem, barData: MainBarGroup, barIdx?: number) => {
    let newBars = [...updatedItem.mainBars];
    if (barIdx !== undefined) newBars[barIdx] = barData;
    else newBars.push(barData);
    const finalItem = { ...updatedItem, mainBars: newBars, isConfigured: true };
    setItems(items.map(i => i.id === finalItem.id ? finalItem : i));
    setEditingContext(null);
  };

  const saveStirrupConfig = (updatedItem: SteelItem) => {
    setItems(items.map(i => i.id === updatedItem.id ? { ...updatedItem, isConfigured: true } : i));
    setEditingContext(null);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      alert("Recurso indisponível: Configure a chave de API do Gemini (VITE_GEMINI_API_KEY) no arquivo .env e REINICIE o servidor.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const newItems = await analyzeImageWithGemini(file, apiKey);
      setItems(prev => [...prev, ...newItems]);
      // Optional: scroll to bottom or show toast
    } catch (error) {
      console.error(error);
      alert("Erro ao analisar imagem: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setIsAnalyzing(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      {/* Resumo do Orçamento */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-slate-900 text-amber-500 rounded-3xl shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{client.name}</span>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Orçamento de Ferragem</h2>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-400 uppercase block tracking-wider">Carga Total</span>
            <span className="text-3xl font-black text-slate-900 tracking-tighter">{calculateWeight(items).toFixed(1)} <small className="text-sm font-medium">kg</small></span>
          </div>
          <button
            disabled={items.length === 0 || !items.every(i => i.mainBars.length > 0 && i.hasStirrups)}
            onClick={() => onSave({ id: crypto.randomUUID(), clientId: client.id, date: new Date().toISOString(), items: items, totalWeight: calculateWeight(items), totalPrice: calculateWeight(items) * DEFAULT_KG_PRICE, status: 'Draft' })}
            className="bg-emerald-500 text-white px-10 py-4 rounded-3xl font-black hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-40 active:scale-95"
          >
            Finalizar Orçamento
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map(item => {
          const hasMainBars = item.mainBars.length > 0;
          const hasStirrups = item.hasStirrups;
          const isComplete = hasMainBars && hasStirrups;

          return (
            <div key={item.id} className={`bg-white p-8 rounded-[2.5rem] border-2 shadow-sm transition-all flex flex-col group hover:shadow-lg ${!isComplete ? 'border-amber-300 bg-amber-50/10' : 'border-slate-100 bg-white'}`}>
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-8">
                  <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-lg shadow-sm border ${!isComplete ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                    {item.quantity}x
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xl uppercase tracking-tight flex items-center gap-3">
                      {item.type}
                      {!isComplete && <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded-md uppercase tracking-wider">Incompleto</span>}
                      {item.observation && <span className="text-slate-400 font-medium lowercase text-base"> - {item.observation}</span>}
                    </h4>
                    <div className="flex gap-3 items-center mt-1">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        {item.type === ElementType.SAPATA
                          ? `${Math.round(getEffectiveLength(item) * 100)}cm x ${Math.round(item.width! * 100)}cm x ${item.height}cm`
                          : `${Math.round(getEffectiveLength(item) * 100)}cm de comprimento`}
                      </span>
                    </div>
                    {/* Validation Feedback */}
                    {!isComplete && (
                      <div className="flex gap-2 mt-3">
                        {!hasMainBars && <span className="text-[9px] font-black text-red-400 uppercase bg-red-50 px-2 py-1 rounded-lg border border-red-100">Falta Ferro Principal</span>}
                        {!hasStirrups && <span className="text-[9px] font-black text-red-400 uppercase bg-red-50 px-2 py-1 rounded-lg border border-red-100">Falta Estribo</span>}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 relative">
                  <div className="relative">
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                      className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${!isComplete ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      {!isComplete && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
                      {isComplete ? 'Editar Detalhes' : 'Configurar Aço'}
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${openDropdownId === item.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>

                    {openDropdownId === item.id && (
                      <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">
                          Opções da Peça
                        </div>
                        <div className="flex flex-col p-2 gap-1">
                          <button
                            onClick={() => { setEditingContext({ item, initialTab: 'ferros', initialUsage: BarUsage.PRINCIPAL }); setOpenDropdownId(null); }}
                            className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between group"
                          >
                            <span>Adicionar / Editar Ferros</span>
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">Abrir Editor</span>
                          </button>

                          <div className="h-px bg-slate-100 my-1" />

                          <button
                            onClick={() => {
                              // Duplicar item logic? Or delete?
                              // Assuming the list had delete but I don't see one in this dropdown block.
                              // Let's add a Remove action if it wasn't there or if useful.
                              // But for now, user asked to simplify "Add Components".
                              setItems(items.filter(i => i.id !== item.id));
                            }}
                            className="text-left px-4 py-3 rounded-xl hover:bg-red-50 text-xs font-bold text-red-500 flex items-center justify-between group"
                          >
                            <span>Remover Peça</span>
                            <span className="text-[10px] bg-red-100 text-red-500 px-2 py-0.5 rounded group-hover:bg-red-200 transition-colors">X</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="p-3 text-slate-200 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </div>
              <ItemReinforcementPreview
                item={item}
                onEditBar={(idx) => setEditingContext({ item, barIdx: idx, initialTab: 'ferros' })}
                onRemoveBar={(idx) => {
                  const newBars = item.mainBars.filter((_, i) => i !== idx);
                  setItems(items.map(it => it.id === item.id ? { ...it, mainBars: newBars, isConfigured: newBars.length > 0 || it.hasStirrups } : it));
                }}
                onEditStirrups={() => setEditingContext({ item, initialTab: 'estribos' })}
                onBarUpdate={(idx, offset) => {
                  const newBars = [...item.mainBars];
                  if (newBars[idx]) {
                    newBars[idx] = { ...newBars[idx], offset };
                    const newItem = { ...item, mainBars: newBars };
                    setItems(items.map(it => it.id === item.id ? newItem : it));
                  }
                }}
              />
            </div>
          );
        })}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Import via AI Button */}
          <label className={`w-full py-10 bg-white border-4 border-dashed border-indigo-100 rounded-[3rem] text-indigo-400 font-black uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all active:scale-[0.99] flex items-center justify-center gap-4 group cursor-pointer relative overflow-hidden ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={isAnalyzing}
            />
            {isAnalyzing ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-xs">Analisando imagem...</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                Importar de Imagem 📸
              </>
            )}
          </label>

          {/* Add Manual Button */}
          <button onClick={() => setShowTypeSelector(true)} className="w-full py-10 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-400 font-black uppercase tracking-widest hover:border-amber-300 hover:text-amber-500 transition-all active:scale-[0.99] flex items-center justify-center gap-4 group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            </div>
            Adicionar Novo Material
          </button>
        </div>
      </div>

      {showTypeSelector && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4" onClick={() => setShowTypeSelector(false)}>
          <div className="bg-white rounded-[3rem] w-full max-w-4xl p-10 shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            {!newItemBase ? (
              <>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-8 text-center">Qual o elemento?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Object.values(ElementType).map(t => (
                    <button key={t} onClick={() => setNewItemBase({ type: t, qty: 1, lengthCm: 100, widthCm: 80, heightCm: 20, obs: '' })} className="bg-slate-50 hover:bg-white border-2 border-transparent hover:border-amber-500 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 transition-all group shadow-sm hover:shadow-xl">
                      <div className="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">{t.charAt(0)}</div>
                      <span className="font-black text-slate-700 text-xs uppercase tracking-widest text-center">{t}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={() => setNewItemBase(null)} className="text-slate-400 hover:text-slate-900 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Cadastro da {newItemBase.type}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Identificação</label>
                    <input autoFocus type="text" value={newItemBase.obs} onChange={e => setNewItemBase({ ...newItemBase, obs: e.target.value })} placeholder="Ex: Sapata Sala, Viga Fundo..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-bold outline-none focus:border-amber-500 transition-all shadow-inner" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quantidade</label>
                    <input type="number" value={newItemBase.qty} onChange={e => setNewItemBase({ ...newItemBase, qty: Number(e.target.value) })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-amber-500 transition-all shadow-inner" />
                  </div>

                  {/* Dimensões serão definidas no "Configurar Aço" através dos segmentos */}
                  {/* {newItemBase.type === ElementType.SAPATA ? (
                    <div className="col-span-full grid grid-cols-3 gap-4 p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Comprimento (cm)</label>
                        <input type="number" value={newItemBase.lengthCm} onChange={e => setNewItemBase({ ...newItemBase, lengthCm: Number(e.target.value) })} className="w-full bg-white border-2 border-amber-200 rounded-2xl p-5 text-lg font-black outline-none focus:border-amber-500 transition-all shadow-sm" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Largura (cm)</label>
                        <input type="number" value={newItemBase.widthCm} onChange={e => setNewItemBase({ ...newItemBase, widthCm: Number(e.target.value) })} className="w-full bg-white border-2 border-amber-200 rounded-2xl p-5 text-lg font-black outline-none focus:border-amber-500 transition-all shadow-sm" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest block">Altura (cm)</label>
                        <input type="number" value={newItemBase.heightCm} onChange={e => setNewItemBase({ ...newItemBase, heightCm: Number(e.target.value) })} className="w-full bg-white border-2 border-amber-200 rounded-2xl p-5 text-lg font-black outline-none focus:border-amber-500 transition-all shadow-sm" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Comprimento (cm)</label>
                      <input type="number" step="1" value={newItemBase.lengthCm} onChange={e => setNewItemBase({ ...newItemBase, lengthCm: Number(e.target.value) })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-amber-500 transition-all shadow-inner" />
                    </div>
                  )} */}
                </div>

                <button onClick={confirmNewItem} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">
                  Confirmar e Ir para Aço
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {editingContext && (
        <ItemDetailEditor
          item={editingContext.item}
          barIdx={editingContext.barIdx}
          initialTab={editingContext.initialTab}
          initialUsage={editingContext.initialUsage}
          onSaveBar={(barData, idx) => saveBarConfig(editingContext.item, barData, idx)}
          onSaveStirrups={(stirrupData) => saveStirrupConfig(stirrupData)}
          onUpdateItem={(newItem) => {
            // Fully replace the item with the new state from the unified editor
            setItems(items.map(i => i.id === newItem.id ? newItem : i));
            setEditingContext(null);
          }}
          onCancel={() => setEditingContext(null)}
        />
      )}
    </div>
  );
};

interface EditorProps {
  item: SteelItem;
  barIdx?: number;
  initialTab?: 'ferros' | 'estribos';
  initialUsage?: BarUsage;
  onSaveBar: (bar: MainBarGroup) => void;
  onSaveStirrups: (item: SteelItem) => void;
  onCancel: () => void;
}

const ItemDetailEditor: React.FC<{
  item: SteelItem;
  // barIdx is no longer needed as primary entry point for "Add", but if editing specific, we can use internal state
  barIdx?: number;
  initialTab?: 'ferros' | 'estribos'; // Deprecated but kept for compatibility or used to focus section
  initialUsage?: BarUsage;
  onSaveBar: (bar: MainBarGroup, idx?: number) => void; // Modified to accept idx
  onSaveStirrups: (item: SteelItem) => void;
  onCancel: () => void;
  onUpdateItem: (newItem: SteelItem) => void; // New prop to update whole item state
}> = ({ item, barIdx, initialTab, initialUsage, onSaveBar, onSaveStirrups, onCancel, onUpdateItem }) => {

  const isSapata = item.type === ElementType.SAPATA;
  // Local state for the item being edited to support batch changes
  const [localItem, setLocalItem] = useState<SteelItem>(JSON.parse(JSON.stringify(item)));
  const [zoomLevel, setZoomLevel] = useState<number>(1.2);


  // State for the "New Bar Form"
  const defaultHook = isSapata ? (item.height || 20) - 5 : 15;
  const [newBar, setNewBar] = useState<MainBarGroup>({
    count: 2,
    gauge: '10.0',
    usage: initialUsage || BarUsage.PRINCIPAL,
    placement: (initialUsage === BarUsage.COSTELA) ? 'distributed' : 'bottom',
    hookStartType: isSapata ? 'up' : 'none',
    hookEndType: isSapata ? 'up' : 'none',
    hookStart: defaultHook,
    hookEnd: defaultHook,
    position: ''
  });

  // Auto-expand item length if bars exceed it
  useEffect(() => {
    const bars = [...localItem.mainBars];
    if (newBar) bars.push(newBar);

    const maxExtent = bars.reduce((max, bar) => {
      const barLen = bar.segmentA || 0;
      const offset = bar.offset || 0;
      return Math.max(max, offset + barLen);
    }, 0);

    const extentM = maxExtent / 100;
    if (extentM > localItem.length) {
      setLocalItem(prev => ({ ...prev, length: extentM }));
    }
  }, [localItem.mainBars, newBar]);

  const [editingIndex, setEditingIndex] = useState<number | undefined>(barIdx);
  const [visualShape, setVisualShape] = useState<string>('straight');
  const [lastUsedSegmentA, setLastUsedSegmentA] = useState<number>(localItem.length);

  // Sync edits if editingIndex changes
  useEffect(() => {
    if (editingIndex !== undefined && localItem.mainBars[editingIndex]) {
      const bar = localItem.mainBars[editingIndex];
      setNewBar(bar);

      // Infer visual shape
      if (bar.shape) {
        setVisualShape(bar.shape);
      } else {
        // Fallback inference for old bars
        if (bar.hookStartType === 'none' && bar.hookEndType === 'none') setVisualShape('straight');
        else if (bar.hookStartType === 'up' && bar.hookEndType === 'none') setVisualShape('l_left_up');
        else if (bar.hookStartType === 'none' && bar.hookEndType === 'up') setVisualShape('l_right_up');
        else if (bar.hookStartType === 'up' && bar.hookEndType === 'up') setVisualShape('u_up');
        else if (bar.hookStartType === 'down' && bar.hookEndType === 'none') setVisualShape('l_left_down');
        else if (bar.hookStartType === 'none' && bar.hookEndType === 'down') setVisualShape('l_right_down');
        else if (bar.hookStartType === 'down' && bar.hookEndType === 'down') setVisualShape('u_down');
        else setVisualShape('custom');
      }
    } else {
      // Reset to default
      setNewBar({
        count: 2,
        gauge: '10.0',
        usage: initialUsage || BarUsage.PRINCIPAL,
        placement: (initialUsage === BarUsage.COSTELA) ? 'distributed' : 'bottom',
        hookStartType: isSapata ? 'up' : 'none',
        hookEndType: isSapata ? 'up' : 'none',
        hookStart: isSapata ? defaultHook : 0,
        hookEnd: isSapata ? defaultHook : 0,
        position: '',
        shape: 'straight',
        segmentA: localItem.length,
        segmentB: isSapata ? defaultHook : 0,
        segmentC: isSapata ? defaultHook : 0,
        segmentD: 0,
        segmentE: 0,
        offset: 0
      });
      setVisualShape('straight');
    }
  }, [editingIndex, localItem.mainBars, defaultHook, initialUsage, isSapata]);


  const handleAddOrUpdateBar = () => {
    const bars = [...localItem.mainBars];
    if (editingIndex !== undefined) {
      bars[editingIndex] = newBar;
    } else {
      bars.push(newBar);
    }
    const updated = { ...localItem, mainBars: bars, isConfigured: true };
    setLocalItem(updated);
    // Save last used segmentA for quick reuse
    if (newBar.segmentA && newBar.segmentA > 0) {
      setLastUsedSegmentA(newBar.segmentA);
    }
    setEditingIndex(undefined); // Reset interaction to "Add New" mode
  };

  const handleRemoveBar = (idx: number) => {
    const bars = localItem.mainBars.filter((_, i) => i !== idx);
    setLocalItem({ ...localItem, mainBars: bars });
    if (editingIndex === idx) setEditingIndex(undefined);
  };

  const handleDuplicateBar = (idx: number) => {
    const barToDuplicate = localItem.mainBars[idx];
    const bars = [...localItem.mainBars, { ...barToDuplicate }];
    setLocalItem({ ...localItem, mainBars: bars, isConfigured: true });
  };

  const handleSaveAll = () => {
    // Commit everything
    onUpdateItem(localItem);
  };

  // Keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter to add/update bar (only if not in an input)
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleAddOrUpdateBar();
      }
      // Escape to close editor
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }

      // Arrow Keys for Movement (Offset)
      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const delta = e.key === 'ArrowRight' ? step : -step;

        if (editingIndex !== undefined) {
          const currentOffset = newBar.offset || 0;
          const barLen = newBar.segmentA || 0;
          const totalLen = Math.round(localItem.length * 100);
          const maxOffset = Math.max(0, totalLen - barLen);
          const nextOffset = Math.max(0, Math.min(currentOffset + delta, maxOffset));

          if (nextOffset !== currentOffset) {
            setNewBar(prev => ({ ...prev, offset: nextOffset }));
            setLocalItem(prevItem => {
              const newBars = [...prevItem.mainBars];
              if (newBars[editingIndex]) {
                newBars[editingIndex] = { ...newBars[editingIndex], offset: nextOffset };
              }
              return { ...prevItem, mainBars: newBars };
            });
          }
        } else {
          // Handle movement for the NEW bar being added
          setNewBar(prev => {
            const currentOffset = prev.offset || 0;
            const barLen = prev.segmentA || 0;
            const totalLen = Math.round(localItem.length * 100);
            const maxOffset = Math.max(0, totalLen - barLen);
            const nextOffset = Math.max(0, Math.min(currentOffset + delta, maxOffset));
            return { ...prev, offset: nextOffset };
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAddOrUpdateBar, onCancel, editingIndex, newBar, localItem.length]);


  // Helper for Hook Selector
  const HookSelector: React.FC<{ label: string, current: HookType, onChange: (t: HookType) => void }> = ({ label, current, onChange }) => (
    <div className="space-y-1">
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200">
        {(['none', 'up', 'down'] as HookType[]).map(t => (
          <button key={t} onClick={() => onChange(t)} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${current === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'}`}>
            {t === 'none' ? 'Reto' : t === 'up' ? '↑' : '↓'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950 z-[250] flex animate-in fade-in duration-300">

      {/* LEFT SIDE: MASSIVE VISUALIZATION (75%) */}
      <div className="flex-grow flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 relative">

        {/* Top Bar */}
        <div className="flex-none h-14 px-6 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/30">
              {localItem.type.charAt(0)}
            </div>
            <div>
              <h2 className="font-black text-white text-lg tracking-tight">Detalhamento Profissional</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{localItem.observation || localItem.type} • Escala 1:100</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8 items-center">
            <div className="text-center">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Barras</p>
              <p className="text-2xl font-black text-white leading-none">{localItem.mainBars.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Peso</p>
              <p className="text-2xl font-black text-white leading-none">
                {localItem.mainBars.reduce((acc, bar) => {
                  const weightPerMeter = STEEL_WEIGHTS[bar.gauge] || 0;
                  const baseLenM = (bar.segmentA || 0) / 100;
                  const extraM = ((bar.segmentB || 0) + (bar.segmentC || 0) + (bar.segmentD || 0) + (bar.segmentE || 0)) / 100;
                  return acc + (bar.count * (baseLenM + extraM) * weightPerMeter);
                }, 0).toFixed(1)}<span className="text-sm text-slate-400 ml-1">kg</span>
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-700 transition-all">Cancelar</button>
            <button onClick={handleSaveAll} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-black uppercase tracking-wide hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30 transform active:scale-95 transition-all">✓ Salvar</button>
          </div>
        </div>

        {/* MAIN DRAWING AREA */}
        <div className="flex-grow overflow-auto custom-scrollbar p-8 relative">
          <div className="bg-white rounded-3xl shadow-2xl shadow-black/20 p-8 min-h-full border border-slate-200">
            <BeamElevationView item={localItem} newBar={editingIndex === undefined ? newBar : undefined} onNewBarUpdate={(offset) => setNewBar(prev => ({ ...prev, offset }))} onEditBar={(idx) => setEditingIndex(idx)} onRemoveBar={handleRemoveBar} selectedIdx={editingIndex} onBarUpdate={(idx, offset) => { const bars = [...localItem.mainBars]; if (bars[idx]) { bars[idx] = { ...bars[idx], offset }; setLocalItem({ ...localItem, mainBars: bars, isConfigured: true }); if (editingIndex === idx) { setNewBar(prev => ({ ...prev, offset })); } } }} readOnly={false} />
          </div>
        </div>

        {/* Bottom Bar - Added Items as Pills */}
        <div className="flex-none h-20 px-6 py-3 border-t border-slate-700/50 bg-slate-900/80 backdrop-blur-sm overflow-x-auto">
          <div className="flex items-center gap-3 h-full">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Itens:</span>
            {localItem.mainBars.length === 0 && <span className="text-slate-600 text-sm font-bold">Nenhum ferro adicionado</span>}
            {localItem.mainBars.map((bar, idx) => (
              <div key={idx} onClick={() => setEditingIndex(idx)} className={`shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all ${editingIndex === idx ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                <span className="font-black text-lg">{bar.count}x</span>
                <div>
                  <p className="font-black text-sm leading-none">Ø{bar.gauge}mm</p>
                  <p className="text-[9px] opacity-70 font-bold">{bar.position || `N${idx + 1}`} • {bar.placement === 'top' ? 'Sup' : 'Inf'}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleRemoveBar(idx); }} className="ml-2 p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: CONTROLS (650px - WIDER) */}
      <div className="w-[650px] shrink-0 bg-white flex flex-col border-l border-slate-200 shadow-2xl">

        {/* TOP ROW: Cross Section + Stirrups SIDE BY SIDE */}
        <div className="h-[480px] shrink-0 p-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200 flex gap-4">

          {/* LEFT: Cross Section */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest">Seção Transversal</h4>
              <span className="text-[10px] font-bold text-slate-400">Clique p/ posicionar</span>
            </div>
            <div className="flex-grow flex items-center justify-center bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
              <div className="transform scale-[1.8]">
                <CompositeCrossSection stirrupW={localItem.stirrupWidth} stirrupH={localItem.stirrupHeight} bars={localItem.mainBars} stirrupPos={localItem.stirrupPosition} stirrupGauge={localItem.stirrupGauge} onZoneClick={(zone) => { setNewBar(prev => ({ ...prev, placement: zone })); }} selectedZone={newBar.placement} />
              </div>
            </div>
          </div>

          {/* RIGHT: Stirrups Config */}
          <div className="w-[240px] shrink-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Estribos
              </h4>
              <input type="checkbox" checked={localItem.hasStirrups} onChange={e => setLocalItem({ ...localItem, hasStirrups: e.target.checked })} className="toggle-checkbox" />
            </div>
            {localItem.hasStirrups && (
              <div className="flex-grow bg-amber-50 rounded-2xl border-2 border-amber-200 p-3 flex flex-col gap-2">
                <div>
                  <label className="text-[10px] font-black text-amber-600 uppercase block mb-1">Bitola</label>
                  <select value={localItem.stirrupGauge} onChange={e => setLocalItem({ ...localItem, stirrupGauge: e.target.value })} className="w-full p-3 bg-white border-2 border-amber-300 rounded-xl text-lg font-black">
                    {GAUGES.map(g => <option key={g} value={g}>Ø {g}mm</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-600 uppercase block mb-1">Espaçamento</label>
                  <input type="number" value={localItem.stirrupSpacing} onChange={e => setLocalItem({ ...localItem, stirrupSpacing: Number(e.target.value) })} placeholder="15" className="w-full p-3 bg-white border-2 border-amber-300 rounded-xl text-lg font-black text-center" />
                </div>
                {!isSapata && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-black text-amber-600 uppercase block mb-1">Larg.</label>
                      <input type="number" value={localItem.stirrupWidth} onChange={e => setLocalItem({ ...localItem, stirrupWidth: Number(e.target.value) })} className="w-full p-2 bg-white border-2 border-amber-300 rounded-xl text-base font-black text-center" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-amber-600 uppercase block mb-1">Alt.</label>
                      <input type="number" value={localItem.stirrupHeight} onChange={e => setLocalItem({ ...localItem, stirrupHeight: Number(e.target.value) })} className="w-full p-2 bg-white border-2 border-amber-300 rounded-xl text-base font-black text-center" />
                    </div>
                  </div>
                )}
              </div>
            )}
            {!localItem.hasStirrups && (
              <div className="flex-grow bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                <span className="text-slate-400 text-sm font-bold">Desativado</span>
              </div>
            )}
          </div>
        </div>

        {/* FORM - NO SCROLL */}
        <div className="flex-grow p-4 flex flex-col">

          {/* Header */}
          <div className="flex justify-between items-center mb-2">
            <h4 className={`font-black uppercase text-xs tracking-widest ${editingIndex !== undefined ? 'text-amber-600' : 'text-indigo-600'}`}>
              {editingIndex !== undefined ? `Editando #${editingIndex + 1}` : 'Adicionar Ferro'}
            </h4>
            {editingIndex !== undefined && <button onClick={() => setEditingIndex(undefined)} className="text-[10px] font-bold text-red-500 hover:underline">✕ Cancelar</button>}
          </div>

          {/* Row 1: Qtd + Bitola + Pos + Comprimento (LARGER) */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase block">Qtd</label>
              <input type="number" value={newBar.count} onChange={e => setNewBar({ ...newBar, count: Number(e.target.value) })} className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl font-black text-2xl text-center outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase block">Bitola</label>
              <select value={newBar.gauge} onChange={e => setNewBar({ ...newBar, gauge: e.target.value })} className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl font-black text-base outline-none focus:border-indigo-500">
                {GAUGES.map(g => <option key={g} value={g}>{g}mm</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-600 uppercase block">Pos.</label>
              <input type="text" value={newBar.position || ''} onChange={e => setNewBar({ ...newBar, position: e.target.value })} placeholder="N1" className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl font-black text-base text-center outline-none focus:border-indigo-500" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-indigo-600 uppercase block">Comp. A (cm)</label>
              <input type="number" value={newBar.segmentA || ''} onChange={e => setNewBar({ ...newBar, segmentA: Number(e.target.value) })} placeholder="600" className="w-full p-3 bg-indigo-50 border-2 border-indigo-400 rounded-xl font-black text-2xl text-indigo-700 text-center outline-none focus:border-indigo-500" />
            </div>
          </div>

          {/* Quick Reuse */}
          {lastUsedSegmentA && lastUsedSegmentA !== newBar.segmentA && (
            <button onClick={() => setNewBar({ ...newBar, segmentA: lastUsedSegmentA })} className="mb-2 w-full py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] font-bold hover:bg-amber-100">↩ Usar último: {lastUsedSegmentA}cm</button>
          )}

          {/* Shapes */}
          <div className="mb-2">
            <label className="text-[8px] font-black text-slate-500 uppercase block mb-1">Formato</label>
            <div className="flex gap-1">
              {[{ s: 'straight', svg: 'M2,12 L22,12' }, { s: 'l_left_up', svg: 'M4,4 L4,12 L20,12' }, { s: 'l_right_up', svg: 'M4,12 L20,12 L20,4' }, { s: 'u_up', svg: 'M4,4 L4,16 L28,16 L28,4', w: 32 }, { s: 'c_up', svg: 'M8,8 L4,8 L4,16 L28,16 L28,8 L24,8', w: 32 }, { s: 'l_left_down', svg: 'M4,20 L4,12 L20,12' }, { s: 'l_right_down', svg: 'M4,12 L20,12 L20,20' }, { s: 'u_down', svg: 'M4,20 L4,8 L28,8 L28,20', w: 32 }, { s: 'c_down', svg: 'M8,16 L4,16 L4,8 L28,8 L28,16 L24,16', w: 32 }].map(sh => (
                <button key={sh.s} onClick={() => { const hS = newBar.hookStart || 20; const hE = newBar.hookEnd || 20; const isC = sh.s.startsWith('c_'); setNewBar({ ...newBar, hookStartType: sh.s.includes('left') || sh.s.includes('u_') || isC ? (sh.s.includes('down') ? 'down' : 'up') : 'none', hookEndType: sh.s.includes('right') || sh.s.includes('u_') || isC ? (sh.s.includes('down') ? 'down' : 'up') : 'none', hookStart: sh.s.includes('left') || sh.s.includes('u_') || isC ? hS : 0, hookEnd: sh.s.includes('right') || sh.s.includes('u_') || isC ? hE : 0, shape: sh.s, segmentB: sh.s.includes('left') || sh.s.includes('u_') || isC ? hS : 0, segmentC: sh.s.includes('right') || sh.s.includes('u_') || isC ? hE : 0, segmentD: isC ? (newBar.segmentD || 10) : 0, segmentE: isC ? (newBar.segmentE || 10) : 0 }); setVisualShape(sh.s); }} className={`flex-1 h-9 rounded-lg border flex items-center justify-center transition-all ${visualShape === sh.s ? 'border-indigo-600 bg-indigo-100 text-indigo-600' : 'border-slate-200 text-slate-400 hover:border-indigo-300'}`}>
                  <svg width={sh.w ? 16 : 14} height="14" viewBox={`0 0 ${sh.w || 24} 24`} className="stroke-current stroke-2 fill-none"><path d={sh.svg} /></svg>
                </button>
              ))}
            </div>
          </div>

          {/* Segments B/C/D/E in one row */}
          {(['l_left_up', 'l_left_down', 'u_up', 'u_down', 'c_up', 'c_down', 'l_right_up', 'l_right_down'].includes(visualShape)) && (
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['l_left_up', 'l_left_down', 'u_up', 'u_down', 'c_up', 'c_down'].includes(visualShape) && (
                <div><label className="text-[8px] font-black text-slate-500 uppercase block">B (cm)</label><input type="number" value={newBar.segmentB || newBar.hookStart || ''} onChange={e => { const val = Number(e.target.value); setNewBar({ ...newBar, segmentB: val, hookStart: val }); }} placeholder="20" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm text-center outline-none focus:border-indigo-500" /></div>
              )}
              {['u_up', 'u_down', 'c_up', 'c_down', 'l_right_up', 'l_right_down'].includes(visualShape) && (
                <div><label className="text-[8px] font-black text-slate-500 uppercase block">C (cm)</label><input type="number" value={newBar.segmentC || newBar.hookEnd || ''} onChange={e => { const val = Number(e.target.value); setNewBar({ ...newBar, segmentC: val, hookEnd: val }); }} placeholder="20" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm text-center outline-none focus:border-indigo-500" /></div>
              )}
              {['c_up', 'c_down'].includes(visualShape) && (
                <>
                  <div><label className="text-[8px] font-black text-slate-500 uppercase block">D (cm)</label><input type="number" value={newBar.segmentD || ''} onChange={e => setNewBar({ ...newBar, segmentD: Number(e.target.value) })} placeholder="10" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm text-center outline-none focus:border-indigo-500" /></div>
                  <div><label className="text-[8px] font-black text-slate-500 uppercase block">E (cm)</label><input type="number" value={newBar.segmentE || ''} onChange={e => setNewBar({ ...newBar, segmentE: Number(e.target.value) })} placeholder="10" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-sm text-center outline-none focus:border-indigo-500" /></div>
                </>
              )}
            </div>
          )}

          {/* Preview + Add Button */}
          <div className="mt-auto">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between mb-3">
              <div className="flex gap-1">
                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[9px] font-black">{newBar.count}x Ø{newBar.gauge}</span>
                {newBar.segmentA && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[9px] font-black">{((newBar.segmentA || 0) + (newBar.segmentB || 0) + (newBar.segmentC || 0))}cm</span>}
              </div>
              <div className="scale-75 origin-right"><BarDrawing length={(newBar.segmentA || 0) / 100} hookStart={newBar.segmentB || newBar.hookStart || 0} hookEnd={newBar.segmentC || newBar.hookEnd || 0} startType={newBar.hookStartType} endType={newBar.hookEndType} shape={visualShape} segmentD={newBar.segmentD} segmentE={newBar.segmentE} /></div>
            </div>

            <button onClick={handleAddOrUpdateBar} className={`w-full py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${editingIndex !== undefined ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white'}`}>
              {editingIndex !== undefined ? '✓ Atualizar' : '+ Adicionar Ferro'}
            </button>
          </div>

        </div>

        {/* APOIOS (Supports) Section */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-b from-blue-50 to-white max-h-64 overflow-y-auto">
          <h4 className="font-black uppercase text-xs tracking-widest text-blue-600 mb-3">Vãos e Apoios</h4>

          {/* Beam Extremity Gaps */}
          <div className="grid grid-cols-2 gap-2 mb-3 p-2 bg-white rounded-lg border border-blue-200">
            <div>
              <label className="text-[8px] text-blue-600 font-bold block">Vão Início (cm)</label>
              <input
                type="number"
                value={localItem.startGap || ''}
                onChange={e => setLocalItem({ ...localItem, startGap: Number(e.target.value) })}
                placeholder="40"
                className="w-full p-1 text-xs font-bold text-center border border-blue-300 rounded"
              />
            </div>
            <div>
              <label className="text-[8px] text-blue-600 font-bold block">Vão Final (cm)</label>
              <input
                type="number"
                value={localItem.endGap || ''}
                onChange={e => setLocalItem({ ...localItem, endGap: Number(e.target.value) })}
                placeholder="20"
                className="w-full p-1 text-xs font-bold text-center border border-blue-300 rounded"
              />
            </div>
          </div>

          {/* Support List Header */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-bold text-pink-600 uppercase">Apoios Intermediários</span>
            <button
              onClick={() => {
                const newSupport = { position: localItem.length * 50, width: 20, leftGap: 20, rightGap: 20, label: `P${(localItem.supports?.length || 0) + 1}` };
                setLocalItem({ ...localItem, supports: [...(localItem.supports || []), newSupport] });
              }}
              className="px-2 py-0.5 rounded bg-pink-500 text-white text-[9px] font-bold hover:bg-pink-600"
            >
              + Apoio
            </button>
          </div>

          {(!localItem.supports || localItem.supports.length === 0) ? (
            <p className="text-[10px] text-slate-400 text-center py-2 bg-slate-50 rounded border border-dashed border-slate-200">Nenhum apoio intermediário</p>
          ) : (
            <div className="space-y-2">
              {localItem.supports.map((support, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={support.label || ''}
                      onChange={e => {
                        const supports = [...(localItem.supports || [])];
                        supports[idx] = { ...supports[idx], label: e.target.value };
                        setLocalItem({ ...localItem, supports });
                      }}
                      placeholder="P1"
                      className="w-14 p-1 text-xs font-bold text-center border border-pink-300 rounded bg-pink-50"
                    />
                    <div className="flex-1">
                      <label className="text-[7px] text-pink-600 font-bold">Posição (cm)</label>
                      <input
                        type="number"
                        value={support.position}
                        onChange={e => {
                          const supports = [...(localItem.supports || [])];
                          supports[idx] = { ...supports[idx], position: Number(e.target.value) };
                          setLocalItem({ ...localItem, supports });
                        }}
                        className="w-full p-1 text-xs font-bold text-center border border-pink-300 rounded"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const supports = (localItem.supports || []).filter((_, i) => i !== idx);
                        setLocalItem({ ...localItem, supports });
                      }}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  {/* Gap fields */}
                  <div className="grid grid-cols-3 gap-1">
                    <div>
                      <label className="text-[7px] text-blue-600 font-bold">Vão ← (cm)</label>
                      <input
                        type="number"
                        value={support.leftGap || ''}
                        onChange={e => {
                          const supports = [...(localItem.supports || [])];
                          supports[idx] = { ...supports[idx], leftGap: Number(e.target.value) };
                          setLocalItem({ ...localItem, supports });
                        }}
                        placeholder="20"
                        className="w-full p-1 text-xs font-bold text-center border border-blue-300 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[7px] text-gray-500 font-bold">Largura (cm)</label>
                      <input
                        type="number"
                        value={support.width}
                        onChange={e => {
                          const supports = [...(localItem.supports || [])];
                          supports[idx] = { ...supports[idx], width: Number(e.target.value) };
                          setLocalItem({ ...localItem, supports });
                        }}
                        className="w-full p-1 text-xs font-bold text-center border border-gray-300 rounded bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="text-[7px] text-blue-600 font-bold">Vão → (cm)</label>
                      <input
                        type="number"
                        value={support.rightGap || ''}
                        onChange={e => {
                          const supports = [...(localItem.supports || [])];
                          supports[idx] = { ...supports[idx], rightGap: Number(e.target.value) };
                          setLocalItem({ ...localItem, supports });
                        }}
                        placeholder="20"
                        className="w-full p-1 text-xs font-bold text-center border border-blue-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default QuoteBuilder;
