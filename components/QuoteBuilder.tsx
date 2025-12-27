
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
const CompositeCrossSection: React.FC<{ stirrupW: number; stirrupH: number; bars: MainBarGroup[] }> = ({ stirrupW, stirrupH, bars }) => {
  const width = stirrupW || 15;
  const height = stirrupH || 20;

  // Scale calculations
  const maxDim = Math.max(width, height, 15);
  const scale = 100 / maxDim; // Smaller scale for list view (100px box)
  const w = width * scale;
  const h = height * scale;
  const padding = 15;
  const r = 3;

  const allPoints: { x: number, y: number, color: string }[] = [];

  bars.forEach(group => {
    const usage = group.usage;
    const count = group.count;

    if (usage === BarUsage.PRINCIPAL) {
      allPoints.push({ x: 0, y: 0, color: '#ef4444' });
      allPoints.push({ x: w, y: 0, color: '#ef4444' });
      allPoints.push({ x: 0, y: h, color: '#ef4444' });
      allPoints.push({ x: w, y: h, color: '#ef4444' });
      if (count > 4) {
        const extras = count - 4;
        const perSide = Math.ceil(extras / 2);
        for (let i = 1; i <= perSide; i++) allPoints.push({ x: (w * i) / (perSide + 1), y: 0, color: '#ef4444' });
        for (let i = 1; i <= extras - perSide; i++) allPoints.push({ x: (w * i) / (extras - perSide + 1), y: h, color: '#ef4444' });
      }
    } else if (usage === BarUsage.COSTELA) {
      for (let i = 0; i < count; i++) {
        const side = i % 2 === 0 ? 0 : w;
        const row = Math.floor(i / 2) + 1;
        const totalRows = Math.ceil(count / 2) + 1;
        allPoints.push({ x: side, y: (h * row) / totalRows, color: '#f59e0b' });
      }
    } else if (usage === BarUsage.CAMADA_2) {
      const offset = 15; // Visual offset
      for (let i = 0; i < count; i++) {
        allPoints.push({ x: (w * (i + 1)) / (count + 1), y: h - offset, color: '#3b82f6' });
      }
    }
  });

  return (
    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center" style={{ minWidth: '130px', height: '130px' }}>
      <svg width={w + padding * 2} height={h + padding * 2} viewBox={`-${padding} -${padding} ${w + padding * 2} ${h + padding * 2}`} className="overflow-visible">
        <rect x="0" y="0" width={w} height={h} fill="none" stroke="#e2e8f0" strokeWidth="3" rx="4" />
        {allPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={r} fill={p.color} stroke="white" strokeWidth="1" />
        ))}
      </svg>
    </div>
  );
};

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
      <div className="flex flex-wrap gap-3">
        {item.mainBars.map((group, idx) => (
          <div key={idx} className="bg-white pl-4 pr-2 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group/bar hover:border-indigo-200 transition-all">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{group.count}x Ø{group.gauge}</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">{group.usage}</span>
            </div>
            <BarDrawing
              length={group.usage.includes('Largura') ? (item.width || item.length) : item.length}
              hookStart={group.hookStart}
              hookEnd={group.hookEnd}
              startType={group.hookStartType}
              endType={group.hookEndType}
              compact
            />
            <div className="flex flex-col gap-1 border-l border-slate-50 pl-2">
              <button onClick={() => onEditBar(idx)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
              </button>
              <button onClick={() => onRemoveBar(idx)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo da Gaiola / Estribos Automáticos + Seção Visual */}
      {item.hasStirrups && (
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          {/* Cross Section Box - Visualização Acumulada */}
          {!isSapata && (
            <div className="relative group">
              <div className="absolute -top-2 -left-2 bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-md z-10 opacity-0 group-hover:opacity-100 transition-opacity">SEÇÃO</div>
              <CompositeCrossSection stirrupW={item.stirrupWidth} stirrupH={item.stirrupHeight} bars={item.mainBars} />
            </div>
          )}

          <div className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all group/st ${isSapata ? 'bg-indigo-50 border-indigo-200' : 'bg-amber-50 border-amber-100'}`}>
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

  /* New CrossSectionPreview Component */
  const CrossSectionPreview: React.FC<{ width: number; height: number; usage: BarUsage; count: number }> = ({ width, height, usage, count }) => {
    // Scale factor for visualization (fit in ~200px box)
    const maxDim = Math.max(width, height, 15); // min 15 to avoid div/0
    const scale = 140 / maxDim;
    const w = width * scale;
    const h = height * scale;
    const padding = 40;

    // Bar radius
    const r = 4;

    // Generate bar positions
    const bars: { x: number, y: number }[] = [];

    if (usage === BarUsage.PRINCIPAL) {
      // Corners
      bars.push({ x: 0, y: 0 }); // Top-Left
      bars.push({ x: w, y: 0 }); // Top-Right
      bars.push({ x: 0, y: h }); // Bot-Left
      bars.push({ x: w, y: h }); // Bot-Right
      // If more than 4, distribute? For now, stick to user request of corners/basic.
      // If count > 4, maybe add intermediates? 
      if (count > 4) {
        // simple distribution for extra bars on top/bottom
        const extras = count - 4;
        const perSide = Math.ceil(extras / 2);
        // Top
        for (let i = 1; i <= perSide; i++) bars.push({ x: (w * i) / (perSide + 1), y: 0 });
        // Bottom
        for (let i = 1; i <= extras - perSide; i++) bars.push({ x: (w * i) / (extras - perSide + 1), y: h });
      }
    } else if (usage === BarUsage.COSTELA) {
      // Sides
      for (let i = 0; i < count; i++) {
        // Distribute vertically on both sides? Or just left/right pairs?
        // Assuming pairs for costela mostly
        const side = i % 2 === 0 ? 0 : w; // Left or Right
        const row = Math.floor(i / 2) + 1;
        const totalRows = Math.ceil(count / 2) + 1;
        bars.push({ x: side, y: (h * row) / totalRows });
      }
    } else if (usage === BarUsage.CAMADA_2) { // 2nd Layer
      // Bottom, offset up by ~5cm (scaled). 5cm is roughly 1/4 of a 20cm beam.
      // Let's use a fixed offset of ~15px visual or proportional.
      const offset = 20; // visual representation of "5cm"
      for (let i = 0; i < count; i++) {
        // Distribute horizontally at bottom - offset
        bars.push({ x: (w * (i + 1)) / (count + 1), y: h - offset });
      }
    } else {
      // Default / Arrranque - just center for now or standard
      bars.push({ x: w / 2, y: h / 2 });
    }

    return (
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-3xl border border-slate-100 mt-4">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Simulação de Corte (Seção)</span>
        <svg width={w + padding * 2} height={h + padding * 2} viewBox={`-${padding} -${padding} ${w + padding * 2} ${h + padding * 2}`} className="overflow-visible">
          {/* Stirrup Shape */}
          <rect x="0" y="0" width={w} height={h} fill="none" stroke="#94a3b8" strokeWidth="3" rx="4" />
          <text x={w / 2} y={-10} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">{width}cm</text>
          <text x={w + 10} y={h / 2} textAnchor="start" fill="#64748b" fontSize="10" fontWeight="bold">{height}cm</text>

          {/* Bars */}
          {bars.map((pos, i) => (
            <circle key={i} cx={pos.x} cy={pos.y} r={r} fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
          ))}
        </svg>
      </div>
    );
  };

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
        hookStartType: isSapata ? 'up' : 'none',
        hookEndType: isSapata ? 'up' : 'none',
        hookStart: defaultHook,
        hookEnd: defaultHook
      }
  );

  const [stirrupData, setStirrupData] = useState<SteelItem>({ ...item });

  const HookSelector: React.FC<{ label: string, current: HookType, onChange: (t: HookType) => void }> = ({ label, current, onChange }) => (
    <div className="space-y-3">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200">
        {(['none', 'up', 'down'] as HookType[]).map(t => (
          <button key={t} onClick={() => onChange(t)} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-xl transition-all ${current === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>
            {t === 'none' ? 'Reto' : t === 'up' ? 'Dobrar ↑' : 'Dobrar ↓'}
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
                  <CrossSectionPreview
                    width={item.stirrupWidth || 15}
                    height={item.stirrupHeight || 20}
                    usage={barData.usage}
                    count={barData.count}
                  />
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
                <div className="col-span-2 space-y-2">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white rounded-3xl border border-indigo-200 mt-8 w-full shadow-md animate-in slide-in-from-top-4">
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
