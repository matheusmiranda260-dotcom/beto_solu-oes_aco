
import React, { useState } from 'react';
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
const BarDrawing: React.FC<{ length: number; hookStart: number; hookEnd: number; startType: HookType; endType: HookType; compact?: boolean }> = ({ length, hookStart, hookEnd, startType, endType, compact }) => {
  const viewW = compact ? 120 : 320;
  const viewH = compact ? 50 : 120;
  const padding = compact ? 20 : 60;
  const centerY = viewH / 2;
  const hookSize = compact ? 10 : 25;
  const fontSize = compact ? '7px' : '12px';

  let startPath = `M ${padding},${centerY}`;
  if (startType === 'up') startPath = `M ${padding},${centerY - hookSize} L ${padding},${centerY}`;
  if (startType === 'down') startPath = `M ${padding},${centerY + hookSize} L ${padding},${centerY}`;

  let endPath = `L ${viewW - padding},${centerY}`;
  if (endType === 'up') endPath += ` L ${viewW - padding},${centerY - hookSize}`;
  if (endType === 'down') endPath += ` L ${viewW - padding},${centerY + hookSize}`;

  return (
    <div className={`flex flex-col items-center justify-center rounded-xl transition-all ${compact ? 'p-0 bg-transparent' : 'p-6 bg-white border border-slate-100 shadow-inner mb-2'}`}>
      <svg width={viewW} height={viewH} viewBox={`0 0 ${viewW} ${viewH}`} className="overflow-visible">
        <path d={startPath + endPath} fill="none" stroke="#0f172a" strokeWidth={compact ? "2" : "5"} strokeLinecap="round" strokeLinejoin="round" />
        <text x={viewW / 2} y={centerY - (compact ? 4 : 10)} textAnchor="middle" className="font-black fill-slate-900" style={{ fontSize }}>{(length * 100).toFixed(0)}</text>
        {startType !== 'none' && <text x={padding - (compact ? 8 : 15)} y={startType === 'up' ? centerY - (compact ? 6 : 15) : centerY + (compact ? 12 : 25)} textAnchor="middle" className="font-black fill-indigo-600" style={{ fontSize }}>{hookStart}</text>}
        {endType !== 'none' && <text x={viewW - padding + (compact ? 8 : 15)} y={endType === 'up' ? centerY - (compact ? 6 : 15) : centerY + (compact ? 12 : 25)} textAnchor="middle" className="font-black fill-indigo-600" style={{ fontSize }}>{hookEnd}</text>}
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
const CompositeCrossSection: React.FC<{ stirrupW: number; stirrupH: number; bars: MainBarGroup[]; stirrupPos?: string; stirrupGauge?: string; stirrupCount?: number }> = ({ stirrupW, stirrupH, bars, stirrupPos, stirrupGauge, stirrupCount }) => {
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
        // Corners first? No, just distribute.
        // Usually we want bars in corners.
        // If 2 bars -> 0, w.
        // If 3 bars -> 0, w/2, w.
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
        // If even count, 2 per row (one left, one right).
        // If odd? odd usually not for sides (pairs).
        // Assuming pairs for sides.
        const side = i % 2 === 0 ? 0 : w;
        // Rows excluding top/bottom bars.
        const rows = Math.ceil(count / 2); // e.g. 4 bars -> 2 rows.
        const rowIdx = Math.floor(i / 2);
        // Distribute vertically between 0 and h? No, typically "skin" is middle.
        // Let's use spacing.
        const yPos = (h * (rowIdx + 1)) / (rows + 1);
        allPoints.push({ x: side, y: yPos, color });
      }
    }
  });

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-2 flex items-center justify-center relative" style={{ minWidth: '160px', height: '160px' }}>
        <svg width={w + padding * 2} height={h + padding * 2} viewBox={`-${padding} -${padding} ${w + padding * 2} ${h + padding * 2}`} className="overflow-visible">
          {/* Section Box */}
          <rect x="0" y="0" width={w} height={h} fill="none" stroke="#000" strokeWidth="2" />
          {/* Concrete Hatch */}
          <path d={`M0,${h} L${w},0`} stroke="#000" strokeWidth="0.5" opacity="0.1" />

          {/* Inner Stirrup */}
          <rect x="4" y="4" width={w - 8} height={h - 8} fill="none" stroke="#000" strokeWidth="1.5" rx="1" />

          {/* Bars */}
          {allPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.color} />
          ))}

          {/* External Dimensions */}
          <TechnicalDimension x1={0} y1={h} x2={w} y2={h} text={`${Math.round(width)}`} offset={10} />
          <TechnicalDimension x1={0} y1={0} x2={0} y2={h} text={`${Math.round(height)}`} offset={-10} vertical />
        </svg>
      </div>

      <div className="mt-2 flex flex-col items-center">
        <svg width="60" height="80" viewBox="0 0 60 80" className="overflow-visible">
          <rect x="10" y="10" width="40" height="60" fill="none" stroke="#000" strokeWidth="1.5" rx="2" />
          <path d="M45,15 L50,10" stroke="#000" strokeWidth="1.5" />
          <path d="M15,15 L10,10" stroke="#000" strokeWidth="1.5" />
          <text x="60" y="40" fontSize="8" fontFamily="Arial">{Math.round(height - 6)}</text>
          <text x="30" y="80" fontSize="8" fontFamily="Arial" textAnchor="middle">{Math.round(width - 6)}</text>
        </svg>
        <span className="text-[9px] font-bold text-slate-600 mt-1">
          {stirrupCount || 'N'} {stirrupPos || ''} ø{stirrupGauge || '5.0'} C={Math.round((width + height) * 2 - 24)}
        </span>
      </div>
    </div>
  );
};

// Nova Visualização Longitudinal Interativa (Elevação Detalhada)
const BeamElevationView: React.FC<{
  item: SteelItem;
  onEditBar: (idx: number) => void;
  onRemoveBar: (idx: number) => void;
  readOnly?: boolean;
}> = ({ item, onEditBar, onRemoveBar, readOnly }) => {
  const viewW = 600; // Increased width for better clarity
  const viewH = 400; // Increased height for multiple layers
  const padX = 60;

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

  const beamTopY = 140;
  const beamBotY = 190;
  const beamWidthPx = viewW - 2 * padX;
  const scaleX = beamWidthPx / (item.length * 100);

  // Filter bars
  const topBars = item.mainBars.flatMap((b, idx) => ({ ...b, originalIdx: idx })).filter(b => b.placement === 'top');
  const bottomBars = item.mainBars.flatMap((b, idx) => ({ ...b, originalIdx: idx })).filter(b => b.placement === 'bottom' || !b.placement);
  const sideBars = item.mainBars.flatMap((b, idx) => ({ ...b, originalIdx: idx })).filter(b => b.placement === 'distributed');

  // Stirrups
  const spacing = item.stirrupSpacing || 20;
  const numStirrups = Math.floor((item.length * 100) / spacing);
  const visualStep = numStirrups > 30 ? Math.ceil(numStirrups / 30) : 1;
  const stirrupX = [];
  for (let i = 0; i <= numStirrups; i += visualStep) {
    stirrupX.push(padX + (i * spacing * scaleX));
  }

  const renderInteractableBar = (group: MainBarGroup & { originalIdx: number }, yBase: number, isTop: boolean) => {
    const lenCm = Math.round(group.usage.includes('Largura') ? (item.width || 0) * 100 : item.length * 100);
    const pxLen = lenCm * scaleX;
    const hookStart = group.hookStartType !== 'none' ? group.hookStart : 0;
    const hookEnd = group.hookEndType !== 'none' ? group.hookEnd : 0;
    const hookH = 15;
    const C = lenCm + hookStart + hookEnd;

    let shape = "";
    // Start Hook
    if (group.hookStartType === 'up') shape += `M ${padX},${yBase - hookH} L ${padX},${yBase} `;
    else if (group.hookStartType === 'down') shape += `M ${padX},${yBase + hookH} L ${padX},${yBase} `;
    else shape += `M ${padX},${yBase} `;

    // Span
    shape += `L ${padX + pxLen},${yBase} `;

    // End Hook
    if (group.hookEndType === 'up') shape += `L ${padX + pxLen},${yBase - hookH}`;
    else if (group.hookEndType === 'down') shape += `L ${padX + pxLen},${yBase + hookH}`;

    const label = `${group.count} ${group.position || (`N${group.originalIdx + 1}`)} ø${group.gauge} C=${C}`;
    const subLabel = isTop ? 'Superior' : group.placement === 'distributed' ? 'Lateral' : 'Inferior';

    return (
      <g
        key={group.originalIdx}
        className={readOnly ? "" : "cursor-pointer group hover:opacity-80"}
        onClick={() => !readOnly && onEditBar(group.originalIdx)}
      >
        {/* Invisible Hit Area for easier clicking */}
        <rect x={padX - 20} y={yBase - 20} width={pxLen + 40} height={40} fill="transparent" />

        {/* The Bar Line */}
        <path d={shape} fill="none" stroke={isTop ? "#ef4444" : "#0f172a"} strokeWidth="4" className="transition-all group-hover:stroke-amber-500 shadow-sm" strokeLinecap="round" strokeLinejoin="round" />

        {/* Info Box / Label */}
        <foreignObject x={padX + pxLen / 2 - 60} y={yBase - (isTop ? 28 : -10)} width="120" height="40" style={{ overflow: 'visible' }}>
          <div className="flex flex-col items-center">
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight shadow-sm border ${readOnly ? 'bg-white border-slate-100 text-slate-800' : 'bg-white border-indigo-100 text-indigo-700 group-hover:bg-amber-100 group-hover:text-amber-700 group-hover:border-amber-200 transition-colors'}`}>
              {label}
            </span>
          </div>
        </foreignObject>

        {/* Dimension Labels (Hooks) */}
        {hookStart > 0 && <text x={padX - 8} y={yBase} textAnchor="end" fontSize="10" fontWeight="bold" fill="#64748b" dominantBaseline="middle">{hookStart}</text>}
        {hookEnd > 0 && <text x={padX + pxLen + 8} y={yBase} textAnchor="start" fontSize="10" fontWeight="bold" fill="#64748b" dominantBaseline="middle">{hookEnd}</text>}

        {/* Length Label (Middle) */}
        <text x={padX + pxLen / 2} y={yBase + (isTop ? 14 : -14)} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8" className="select-none">{Math.round(lenCm)}</text>

        {!readOnly && (
          <g className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); onRemoveBar(group.originalIdx); }}>
            <circle cx={padX + pxLen + 30} cy={yBase} r={8} fill="#fee2e2" stroke="#ef4444" strokeWidth="1" />
            <path d={`M${padX + pxLen + 27},${yBase - 3} L${padX + pxLen + 33},${yBase + 3} M${padX + pxLen + 33},${yBase - 3} L${padX + pxLen + 27},${yBase + 3}`} stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center w-full max-w-3xl mx-auto overflow-hidden relative">
      <div className="flex justify-between w-full mb-4 px-4">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalhamento Long.</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Escala s/z</span>
      </div>

      <svg width="100%" height={viewH} viewBox={`0 0 ${viewW} ${viewH}`} className="overflow-visible select-none">

        <defs>
          <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" style={{ stroke: 'black', strokeWidth: 0.5 }} opacity="0.1" />
          </pattern>
        </defs>

        {/* Top (Negative) Reinforcement Stack */}
        {topBars.map((b, i) => {
          // Stack upwards from beam top? Or just list from Y=30 down.
          // Let's list from Y=30 down to beam.
          // If many bars, we might need more space.
          // Let's assume max 3-4 layers.
          const y = 30 + (i * 35);
          return renderInteractableBar(b, y, true);
        })}

        {/* Beam Body / Stirrups */}
        <g>
          <rect x={padX} y={beamTopY} width={beamWidthPx} height={50} fill="url(#diagonalHatch)" stroke="#0f172a" strokeWidth="2" rx="4" />
          {/* Stirrup Lines */}
          {stirrupX.map((x, i) => (
            <line key={i} x1={x} y1={beamTopY} x2={x} y2={beamTopY + 50} stroke="#0f172a" strokeWidth="1" strokeOpacity="0.3" />
          ))}
          {/* Axis Line */}
          <line x1={padX - 10} y1={beamTopY + 25} x2={padX + beamWidthPx + 10} y2={beamTopY + 25} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
        </g>

        {/* Bottom (Positive) Reinforcement Stack */}
        {bottomBars.map((b, i) => {
          const y = 230 + (i * 35);
          return renderInteractableBar(b, y, false);
        })}

        {/* Side (Distributed) Reinforcement Stack */}
        {sideBars.map((b, i) => {
          const y = 230 + (bottomBars.length * 35) + 20 + (i * 35);
          return renderInteractableBar(b, y, false);
        })}

        {/* Stirrup Callout */}
        <TechnicalDimension
          x1={padX} y1={beamBotY + 15}
          x2={padX + beamWidthPx} y2={beamBotY + 15}
          text={`${Math.floor(numStirrups)} ${item.stirrupPosition || 'EST'} c/${spacing}`}
          offset={0}
        />

      </svg>
      <div className="absolute top-4 right-4 bg-slate-100 rounded-full px-3 py-1 text-[10px] font-bold text-slate-500">
        Clique nas barras para editar
      </div>
    </div>
  );
};

const ItemReinforcementPreview: React.FC<{
  item: SteelItem;
  onEditBar: (idx: number) => void;
  onRemoveBar: (idx: number) => void;
  onEditStirrups: () => void;
}> = ({ item, onEditBar, onRemoveBar, onEditStirrups }) => {
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

  const calculateWeight = (itemsList: SteelItem[]) => {
    return itemsList.reduce((acc, item) => {
      const mainWeight = item.mainBars.reduce((total, group) => {
        const weightPerMeter = STEEL_WEIGHTS[group.gauge] || 0;
        const currentLen = group.usage.includes('Largura') ? (item.width || item.length) : item.length;
        const extra = (group.hookStartType !== 'none' ? group.hookStart / 100 : 0) + (group.hookEndType !== 'none' ? group.hookEnd / 100 : 0);
        return total + (item.quantity * group.count * (currentLen + extra) * weightPerMeter);
      }, 0);

      let totalStirrupWeight = 0;
      if (item.hasStirrups) {
        if (item.type === ElementType.SAPATA) {
          const weightPerMeter = STEEL_WEIGHTS[item.stirrupGauge] || 0;
          const hookCm = (item.height || 20) - 5;
          const hooksM = (hookCm * 2) / 100;
          const countL = Math.ceil((item.width || 0.8) * 100 / item.stirrupSpacing);
          const weightL = item.quantity * countL * (item.length + hooksM) * weightPerMeter;
          const countW = Math.ceil(item.length * 100 / item.stirrupSpacing);
          const weightW = item.quantity * countW * ((item.width || 0.8) + hooksM) * weightPerMeter;
          totalStirrupWeight = weightL + weightW;
        } else {
          const stirrupCount = Math.ceil((item.length * 100) / item.stirrupSpacing);
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
      stirrupWidth: newItemBase.type === ElementType.SAPATA ? (newItemBase.widthCm - 6) : 15,
      stirrupHeight: newItemBase.type === ElementType.SAPATA ? (newItemBase.heightCm - 6) : 20,
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
                          ? `${Math.round(item.length * 100)}cm x ${Math.round(item.width! * 100)}cm x ${item.height}cm`
                          : `${Math.round(item.length * 100)}cm de comprimento`}
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
                          Adicionar Componente
                        </div>
                        <div className="flex flex-col p-2 gap-1">
                          <button
                            onClick={() => { setEditingContext({ item, initialTab: 'ferros', initialUsage: BarUsage.PRINCIPAL }); setOpenDropdownId(null); }}
                            className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between group"
                          >
                            <span>Ferro Principal</span>
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">+</span>
                          </button>

                          {item.type !== ElementType.SAPATA && (
                            <>
                              <button
                                onClick={() => { setEditingContext({ item, initialTab: 'ferros', initialUsage: BarUsage.COSTELA }); setOpenDropdownId(null); }}
                                className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between group"
                              >
                                <span>Costela (Pele)</span>
                                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">+</span>
                              </button>
                              <button
                                onClick={() => { setEditingContext({ item, initialTab: 'ferros', initialUsage: BarUsage.CAMADA_2 }); setOpenDropdownId(null); }}
                                className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between group"
                              >
                                <span>2ª Camada</span>
                                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">+</span>
                              </button>
                            </>
                          )}

                          <div className="h-px bg-slate-100 my-1" />

                          <button
                            onClick={() => { setEditingContext({ item, initialTab: 'estribos' }); setOpenDropdownId(null); }}
                            className="text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-between group"
                          >
                            <span>{item.type === ElementType.SAPATA ? 'Gaiola / Malha' : 'Estribos'}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">Config</span>
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
              />
            </div>
          );
        })}

        <button onClick={() => setShowTypeSelector(true)} className="w-full py-10 bg-white border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-400 font-black uppercase tracking-widest hover:border-amber-300 hover:text-amber-500 transition-all active:scale-[0.99] flex items-center justify-center gap-4 group">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          </div>
          Adicionar Novo Material
        </button>
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

                  {newItemBase.type === ElementType.SAPATA ? (
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
                  )}
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
          onSaveBar={(barData) => saveBarConfig(editingContext.item, barData, editingContext.barIdx)}
          onSaveStirrups={(stirrupData) => saveStirrupConfig(stirrupData)}
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

const ItemDetailEditor: React.FC<EditorProps> = ({ item, barIdx, initialTab = 'ferros', initialUsage, onSaveBar, onSaveStirrups, onCancel }) => {
  const isEditingBar = barIdx !== undefined;
  const isSapata = item.type === ElementType.SAPATA;



  const [activeTab, setActiveTab] = useState<'ferros' | 'estribos'>(initialTab);
  const defaultHook = isSapata ? (item.height || 20) - 5 : 15;

  // Logic to hide tabs if we are in a "specific" mode (initialTab passed via dropdown context and isEditingBar is false [newItem] or true [editing])
  // Actually, we moved logic to single editor. The tabs (lines 541-548) should be removed or hidden.
  // We'll replace the return JSX to NOT render the tab bar.

  const [barData, setBarData] = useState<MainBarGroup>(
    isEditingBar
      ? { ...item.mainBars[barIdx] }
      : {
        count: isSapata ? 6 : 4,
        gauge: '10.0',
        usage: initialUsage || (isSapata ? 'Reforço Manual' as BarUsage : BarUsage.PRINCIPAL),
        placement: (initialUsage === BarUsage.COSTELA) ? 'distributed' : 'bottom', // Default placement
        hookStartType: isSapata ? 'up' : 'none',
        hookEndType: isSapata ? 'up' : 'none',
        hookStart: defaultHook,
        hookEnd: defaultHook
      }
  );

  const [stirrupData, setStirrupData] = useState<SteelItem>({ ...item });

  /* Live Preview of All Bars */
  const previewBars = React.useMemo(() => {
    // Clone existing bars to avoid mutation
    let bars = [...item.mainBars];

    if (activeTab === 'ferros') {
      if (isEditingBar && barIdx !== undefined) {
        // If editing, replace the current one
        bars[barIdx] = barData;
      } else {
        // If adding new, append the current editor state
        bars.push(barData);
      }
    }
    return bars;
  }, [item.mainBars, barData, isEditingBar, barIdx, activeTab]);

  const HookSelector: React.FC<{ label: string, current: HookType, onChange: (t: HookType) => void }> = ({ label, current, onChange }) => (
    <div className="space-y-3">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200">
        {(['none', 'up', 'down'] as HookType[]).map(t => (
          <button key={t} onClick={() => onChange(t)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${current === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>
            {t === 'none' ? 'Reto' : t === 'up' ? 'Ponta ↑' : 'Ponta ↓'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[250] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-8">

        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${isSapata ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-amber-500'}`}>
              {item.type.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{isEditingBar ? 'Editar Ferro Individual' : isSapata ? 'Desenho da Gaiola' : 'Configurar Estribos'}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {item.type} • {item.quantity}x • {isSapata ? `${Math.round(item.length * 100)}x${Math.round(item.width! * 100)}x${item.height}cm` : `${item.length}m`}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-300 hover:text-slate-900 transition-colors p-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        {/* Tabs Hidden - Locked to Initial Tab Mode */}
        <div className="h-4 bg-slate-50/50 border-b border-slate-50"></div>

        <div className="flex-grow overflow-y-auto p-10 custom-scrollbar bg-slate-50/20">
          {activeTab === 'ferros' ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Vista Longitudinal</p>
                  <BarDrawing
                    length={barData.usage.includes('Largura') ? (item.width || 1) : item.length}
                    hookStart={barData.hookStart}
                    hookEnd={barData.hookEnd}
                    startType={barData.hookStartType}
                    endType={barData.hookEndType}
                  />
                </div>

                {/* Cross Section View */}
                {!item.type.includes('Sapata') && (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Seção Transversal (Acumulada)</p>
                    <CompositeCrossSection
                      stirrupW={item.stirrupWidth || 15}
                      stirrupH={item.stirrupHeight || 20}
                      bars={previewBars}
                      stirrupPos={stirrupData.stirrupPosition}
                      stirrupGauge={stirrupData.stirrupGauge}
                      stirrupCount={Math.floor(item.length * 100 / (stirrupData.stirrupSpacing || 20))}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qtd. de Barras</label>
                  <input type="number" value={barData.count} onChange={e => setBarData({ ...barData, count: Number(e.target.value) })} className="w-full border-2 border-slate-50 bg-white rounded-2xl p-4 font-black text-lg focus:border-indigo-500 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bitola Ø (mm)</label>
                  <select value={barData.gauge} onChange={e => setBarData({ ...barData, gauge: e.target.value })} className="w-full border-2 border-slate-50 bg-white rounded-2xl p-4 font-black text-lg focus:border-indigo-500 outline-none shadow-inner">
                    {GAUGES.map(g => <option key={g} value={g}>{g} mm</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Posição (N...)</label>
                  <input type="text" value={barData.position || ''} onChange={e => setBarData({ ...barData, position: e.target.value })} placeholder="Ex: N1" className="w-full border-2 border-slate-50 bg-white rounded-2xl p-4 font-black text-lg focus:border-indigo-500 outline-none transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Uso/Sentido</label>
                  <select value={barData.usage} onChange={e => setBarData({ ...barData, usage: e.target.value as BarUsage })} className="w-full border-2 border-slate-50 bg-white rounded-2xl p-4 font-black text-sm outline-none focus:border-indigo-500 shadow-inner">
                    {isSapata ? (
                      <>
                        <option value="Reforço Longitudinal">Reforço Sentido X</option>
                        <option value="Reforço Transversal (Largura)">Reforço Sentido Y</option>
                        <option value="Arranque">Arranque</option>
                      </>
                    ) : (
                      Object.values(BarUsage).map(u => <option key={u} value={u}>{u}</option>)
                    )}
                  </select>
                </div>
                {!isSapata && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Posição na Seção</label>
                    <select
                      value={barData.placement || 'bottom'}
                      onChange={e => setBarData({ ...barData, placement: e.target.value as any })}
                      className="w-full border-2 border-slate-50 bg-white rounded-2xl p-4 font-black text-sm outline-none focus:border-indigo-500 shadow-inner"
                    >
                      <option value="bottom">Inferior (Positivo)</option>
                      <option value="top">Superior (Negativo)</option>
                      <option value="distributed">Lateral (Costela)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <HookSelector label="Gancho Lado A" current={barData.hookStartType} onChange={(t) => setBarData({ ...barData, hookStartType: t })} />
                <HookSelector label="Gancho Lado B" current={barData.hookEndType} onChange={(t) => setBarData({ ...barData, hookEndType: t })} />

                {(barData.hookStartType !== 'none' || barData.hookEndType !== 'none') && (
                  <div className="col-span-full flex items-center justify-center gap-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in zoom-in-95">
                    <span className="text-[10px] font-black text-indigo-700 uppercase">Medida do Gancho (cm):</span>
                    <input type="number" value={barData.hookStart} onChange={e => setBarData({ ...barData, hookStart: Number(e.target.value), hookEnd: Number(e.target.value) })} className="w-24 bg-white border-2 border-indigo-200 rounded-xl p-3 font-black text-indigo-700 outline-none text-center" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className={`p-10 rounded-[3rem] border-2 transition-all flex flex-col items-center shadow-lg ${stirrupData.hasStirrups ? 'bg-indigo-100 border-indigo-300' : 'bg-slate-50 border-slate-200 border-dashed'}`}>
                {isSapata ? (
                  <div className="text-center">
                    <CageDrawing lengthCm={Math.round(item.length * 100)} widthCm={Math.round(item.width! * 100)} spacing={stirrupData.stirrupSpacing} />
                    <h4 className="font-black text-indigo-900 uppercase text-xl mt-6 mb-2">Gaiola Automática</h4>
                    <p className="text-indigo-700 text-xs font-bold uppercase tracking-tight max-w-xs mx-auto mb-8">Gera as barras nos dois sentidos com dobras proporcionais à altura.</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <StirrupDrawing width={stirrupData.stirrupWidth} height={stirrupData.stirrupHeight} />
                    <h4 className="font-black text-slate-800 uppercase text-xl mt-6 mb-6">Configuração de Estribo</h4>
                  </div>
                )}

                <button onClick={() => setStirrupData({ ...stirrupData, hasStirrups: !stirrupData.hasStirrups })} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${stirrupData.hasStirrups ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  {stirrupData.hasStirrups ? (isSapata ? 'Desativar Gaiola' : 'Remover Estribos') : (isSapata ? 'Ativar Gaiola Armada' : 'Ativar Estribos')}
                </button>

                {stirrupData.hasStirrups && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-6 bg-white rounded-3xl border border-indigo-200 mt-8 w-full shadow-md animate-in slide-in-from-top-4">
                    <div className="space-y-1"><span className="text-[9px] font-black text-indigo-600 uppercase">Posição</span><input type="text" placeholder="N.." value={stirrupData.stirrupPosition || ''} onChange={e => setStirrupData({ ...stirrupData, stirrupPosition: e.target.value })} className="w-full p-3 bg-slate-50 border-slate-100 rounded-xl font-black text-base" /></div>
                    <div className="space-y-1"><span className="text-[9px] font-black text-indigo-600 uppercase">Bitola Ø</span><select value={stirrupData.stirrupGauge} onChange={e => setStirrupData({ ...stirrupData, stirrupGauge: e.target.value })} className="w-full p-3 bg-slate-50 border-slate-100 rounded-xl font-black text-base">{GAUGES.map(g => <option key={g} value={g}>{g} mm</option>)}</select></div>
                    <div className="space-y-1"><span className="text-[9px] font-black text-indigo-600 uppercase">Esp. (cm)</span><input type="number" value={stirrupData.stirrupSpacing} onChange={e => setStirrupData({ ...stirrupData, stirrupSpacing: Number(e.target.value) })} className="w-full p-3 bg-slate-50 border-slate-100 rounded-xl font-black text-base" /></div>
                    {!isSapata && (
                      <>
                        <div className="space-y-1"><span className="text-[9px] font-black text-amber-600 uppercase">Larg. (cm)</span><input type="number" value={stirrupData.stirrupWidth} onChange={e => setStirrupData({ ...stirrupData, stirrupWidth: Number(e.target.value) })} className="w-full p-3 bg-slate-50 border-slate-100 rounded-xl font-black text-base" /></div>
                        <div className="space-y-1"><span className="text-[9px] font-black text-amber-600 uppercase">Alt. (cm)</span><input type="number" value={stirrupData.stirrupHeight} onChange={e => setStirrupData({ ...stirrupData, stirrupHeight: Number(e.target.value) })} className="w-full p-3 bg-slate-50 border-slate-100 rounded-xl font-black text-base" /></div>
                      </>
                    )}
                    {isSapata && (
                      <div className="col-span-2 flex items-center justify-center p-2 bg-indigo-50 rounded-xl">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">Altura Sapata: {item.height}cm</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {stirrupData.hasStirrups && isSapata && (
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center gap-4 animate-in fade-in">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Resumo Calculado</span>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <span className="block text-[9px] font-black text-slate-400 uppercase">Barras no X</span>
                      <span className="text-xl font-black text-slate-900">{Math.ceil((item.width || 0.8) * 100 / stirrupData.stirrupSpacing)} un.</span>
                    </div>
                    <div className="text-center border-l border-slate-100 pl-8">
                      <span className="block text-[9px] font-black text-slate-400 uppercase">Barras no Y</span>
                      <span className="text-xl font-black text-slate-900">{Math.ceil(item.length * 100 / stirrupData.stirrupSpacing)} un.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-white flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 font-black text-slate-400 uppercase text-xs tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
          <button onClick={() => activeTab === 'ferros' ? onSaveBar(barData) : onSaveStirrups(stirrupData)} className="flex-[2] py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95">
            {activeTab === 'ferros' ? (isEditingBar ? 'Salvar Ferro' : 'Adicionar Ferro') : 'Confirmar Gaiola / Estribos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuoteBuilder;
