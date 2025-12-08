import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ReferenceLine, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  LayoutDashboard, LogOut, MessageSquare, Package,
  TrendingUp, HardHat, Send, Menu, X, Grid3X3, Plus, Save, Trash2,
  Calculator, Scale, ArrowRight, ScanLine, Cable, Settings, Briefcase, DollarSign, PlusCircle,
  Calendar, FileText, Printer, Clock, CheckSquare, User, Edit, ArrowUpRight, Triangle, Layers, AlertCircle
} from 'lucide-react';
import { generateBetoResponse } from '../services/geminiService';
import { ChatMessage, MeshType, TrussType } from '../types';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

const mockData = [
  { name: 'Bobinas', stock: 4000, capacity: 5000 },
  { name: 'Chapas', stock: 3000, capacity: 4500 },
  { name: 'Perfis', stock: 2000, capacity: 3000 },
  { name: 'Tubos', stock: 2780, capacity: 3500 },
];

const priceData = [
  { month: 'Jan', price: 4200 },
  { month: 'Fev', price: 4350 },
  { month: 'Mar', price: 4100 },
  { month: 'Abr', price: 4500 },
  { month: 'Mai', price: 4800 },
  { month: 'Jun', price: 4950 },
];

const initialMeshes: MeshType[] = [
  { id: '1', tela: 'EQ 045', metros: 60, bitola: 3.4, espacamento: '20x20', dimensao: '2,00 X 3,00', t: 15, l: 10, peso: 4.28 },
  { id: '2', tela: 'EQ 061', metros: 82, bitola: 3.4, espacamento: '15x15', dimensao: '2,00 X 3,00', t: 20, l: 14, peso: 5.85 },
  { id: '3', tela: 'EQ 092', metros: 82, bitola: 4.2, espacamento: '15x15', dimensao: '2,00 X 3,00', t: 20, l: 14, peso: 8.91 },
  { id: '4', tela: 'EQ 138', metros: 120, bitola: 4.2, espacamento: '10x10', dimensao: '2,00 X 3,00', t: 30, l: 20, peso: 13.05 },
  { id: '5', tela: 'Q 061', metros: 200, bitola: 3.4, espacamento: '15x15', dimensao: '2,45 X 6,00', t: 40, l: 17, peso: 14.25 },
  { id: '6', tela: 'Q 075', metros: 200, bitola: 3.8, espacamento: '15x15', dimensao: '2,45 X 6,00', t: 40, l: 17, peso: 17.80 },
  { id: '7', tela: 'Q 092', metros: 200, bitola: 4.2, espacamento: '15x15', dimensao: '2,45 X 6,00', t: 40, l: 17, peso: 21.74 },
  { id: '8', tela: 'Q 113', metros: 297, bitola: 3.8, espacamento: '10x10', dimensao: '2,45 X 6,00', t: 60, l: 25, peso: 26.43 },
  { id: '9', tela: 'Q 138', metros: 297, bitola: 4.2, espacamento: '10x10', dimensao: '2,45 X 6,00', t: 60, l: 25, peso: 32.28 },
  { id: '10', tela: 'Q 159', metros: 297, bitola: 4.5, espacamento: '10x10', dimensao: '2,45 X 6,00', t: 60, l: 25, peso: 37.06 },
  { id: '11', tela: 'Q 196', metros: 297, bitola: 5.0, espacamento: '10x10', dimensao: '2,45 X 6,00', t: 60, l: 25, peso: 45.75 },
  { id: '12', tela: 'Q 246', metros: 297, bitola: 5.6, espacamento: '10x10', dimensao: '2,45 X 6,00', t: 60, l: 25, peso: 57.40 },
  { id: '13', tela: 'Q 283', metros: 297, bitola: 6.0, espacamento: '10x10', dimensao: '2,45 X 6,00', t: 60, l: 25, peso: 65.88 },
];

const initialTrusses: TrussType[] = [
  { id: '1', model: 'H8', height: 8, length: 6, topDiam: 5.6, botDiam: 3.2, sineDiam: 3.2, totalWeight: 2.89 },
];

const initialCompanies = [
  { id: '1', name: 'ATOMAT', percent: 5 },
  { id: '2', name: 'MACH MAQUINAS', percent: 5 },
  { id: '3', name: 'COSTINHA', percent: 5 },
  { id: '4', name: 'FRIMOX', percent: 5 },
  { id: '5', name: 'TALIS MAQUINA', percent: 5 },
  { id: '6', name: 'MARCO MAQUINAS', percent: 5 },
  { id: '7', name: 'FABIO MS CHINA', percent: 5 },
  { id: '8', name: 'TJK', percent: 5 },
];

const months = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

interface CommissionData {
  [key: string]: number; // key: "companyId-monthIndex", value: amount
}

interface FinancialRecord {
  id: string;
  value: number;
  companyName: string;
}

interface ConsultingJob {
  id: string;
  client: string;
  startDate: string;
  endDate?: string;
  status: 'Agendado' | 'Em Andamento' | 'Concluido';
  description: string;
}

interface QuoteForm {
  clientName: string;
  contact: string;
  startDate: string;
  weeks: number;
  valueWeeklyService: number;
  valueWeeklyTravel: number;
  valueWeeklyFood: number;
  shifts: string; // Turnos A/B etc
  hoursPerDay: number;
  workingDays: number[]; // 0=Dom, 1=Seg, ... 6=Sab
  taxPercent: number; // Acrescimo MAS
}

interface SavedQuote extends QuoteForm {
  id: string;
  createdAt: string;
}

interface TrefilaRecipe {
  id: string;
  name: string;
  date: string;
  entry: number;
  exit: number;
  passes: number;
  dies: number[];
}

const COLORS = ['#3b82f6', '#f97316', '#22c55e']; // Blue (Agendado), Orange (Em Andamento), Green (Concluido)

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat' | 'malhas' | 'trelica' | 'trefila' | 'comissao' | 'consultorias'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Malhas State
  const [meshes, setMeshes] = useState<MeshType[]>(initialMeshes);
  const [isAddingMesh, setIsAddingMesh] = useState(false);
  const [newMesh, setNewMesh] = useState<Partial<MeshType>>({
    tela: '', metros: 0, bitola: 0, espacamento: '', dimensao: '', t: 0, l: 0, peso: 0
  });

  // Treliça State
  const [trusses, setTrusses] = useState<TrussType[]>(initialTrusses);
  const [trussQuantity, setTrussQuantity] = useState<number>(1);
  const [newTruss, setNewTruss] = useState<Partial<TrussType>>({
    model: '', height: 0, length: 0, topDiam: 0, botDiam: 0, sineDiam: 0
  });
  const [calculatedTrussWeight, setCalculatedTrussWeight] = useState<number>(0);
  const [trussBreakdown, setTrussBreakdown] = useState<{ top: number, bot: number, sine: number, total: number } | null>(null);

  // Trefila State
  const [trefilaEntry, setTrefilaEntry] = useState<number>(5.5);
  const [trefilaExit, setTrefilaExit] = useState<number>(3.2);
  const [trefilaPassCount, setTrefilaPassCount] = useState<number>(4);
  const [trefilaDies, setTrefilaDies] = useState<number[]>([4.7, 4.05, 3.56, 3.2]);
  const [trefilaReductions, setTrefilaReductions] = useState<{ pass: number, reduction: number }[]>([]);
  const [trefilaMode, setTrefilaMode] = useState<'cacetes' | 'frieiras'>('cacetes');
  const [savedRecipes, setSavedRecipes] = useState<TrefilaRecipe[]>([]);
  const [recipeName, setRecipeName] = useState('');

  // Comissao State
  const [companies, setCompanies] = useState(initialCompanies);
  const [commissionData, setCommissionData] = useState<CommissionData>({});
  const [advances, setAdvances] = useState<FinancialRecord[]>([]);
  const [receipts, setReceipts] = useState<FinancialRecord[]>([]);
  const [newAdvance, setNewAdvance] = useState({ value: '', company: '' });
  const [newReceipt, setNewReceipt] = useState({ value: '', company: '' });

  // Consultoria State
  const [consultingTab, setConsultingTab] = useState<'agenda' | 'orcamento'>('agenda');
  const [agendaItems, setAgendaItems] = useState<ConsultingJob[]>([
    { id: '1', client: 'MANETONI', startDate: '2025-02-02', endDate: '2025-02-05', status: 'Em Andamento', description: 'Consultoria de Trefilação' },
    { id: '2', client: 'ARCELORMITTAL', startDate: '2025-03-10', endDate: '2025-03-12', status: 'Agendado', description: 'Treinamento Operacional' },
    { id: '3', client: 'GERDAU', startDate: '2025-01-15', endDate: '2025-01-15', status: 'Concluido', description: 'Manutenção de Máquina' }
  ]);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<ConsultingJob>>({});

  const [quoteForm, setQuoteForm] = useState<QuoteForm>({
    clientName: 'MANETONI',
    contact: '(11) 99999-9999',
    startDate: '2026-02-02',
    weeks: 4,
    valueWeeklyService: 7500,
    valueWeeklyTravel: 1300,
    valueWeeklyFood: 200,
    shifts: 'A/B e B/C',
    hoursPerDay: 8,
    workingDays: [1, 2, 3, 4, 5], // Seg-Sex
    taxPercent: 7
  });
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);

  // Update dies array size when pass count changes
  useEffect(() => {
    if (trefilaDies.length !== trefilaPassCount) {
      const newDies = [...trefilaDies];
      if (newDies.length < trefilaPassCount) {
        // Add new steps (copy last or default)
        for (let i = newDies.length; i < trefilaPassCount; i++) {
          newDies.push(newDies[newDies.length - 1] || trefilaEntry);
        }
      } else {
        // Trim
        newDies.length = trefilaPassCount;
      }
      setTrefilaDies(newDies);
    }
  }, [trefilaPassCount]);

  // Calculate Trefila Reductions
  useEffect(() => {
    const reductions = [];
    let previousDiameter = trefilaEntry;

    for (let i = 0; i < trefilaDies.length; i++) {
      const currentDiameter = trefilaDies[i];
      // Area Reduction Formula: (D_in^2 - D_out^2) / D_in^2
      // If D_out > D_in (impossible in drawing), result is negative
      if (previousDiameter > 0) {
        const areaIn = Math.PI * Math.pow(previousDiameter / 2, 2);
        const areaOut = Math.PI * Math.pow(currentDiameter / 2, 2);
        const reduction = ((areaIn - areaOut) / areaIn) * 100;
        reductions.push({
          pass: i + 1,
          reduction: reduction
        });
      } else {
        reductions.push({ pass: i + 1, reduction: 0 });
      }
      previousDiameter = currentDiameter;
    }
    setTrefilaReductions(reductions);
  }, [trefilaEntry, trefilaDies]);



  const calculateIdealPasses = () => {
    if (trefilaEntry <= trefilaExit || trefilaPassCount <= 0) return;

    // ALGORITMO DE CÁLCULO DE PASSE DECRESCENTE
    // Regra: A última redução deve ser no máximo 19% (Ideal ~18%).
    // Regra: A primeira redução deve ser no máximo 29%.
    // Regra: A curva deve ser decrescente (R1 > R2 > ... > Rn).

    // Alvo para o último passe (Vamos mirar em 18% para ter margem)
    const targetLastRed = 0.18;

    if (trefilaPassCount === 1) {
      setTrefilaDies([trefilaExit]);
      return;
    }

    // Função auxiliar para calcular o diâmetro final dado uma Redução Inicial (R_start)
    // Assume uma distribuição linear da redução: De R_start até targetLastRed
    const calculateFinalD = (rStart: number) => {
      let currentD = trefilaEntry;
      for (let i = 0; i < trefilaPassCount; i++) {
        // Interpolação Linear da Redução
        const t = i / (trefilaPassCount - 1);
        const currentRed = rStart * (1 - t) + targetLastRed * t;

        // Aplica a redução: D_novo = D_anterior * sqrt(1 - %Red)
        currentD = currentD * Math.sqrt(1 - currentRed);
      }
      return currentD;
    };

    // Busca Binária para encontrar o R_start ideal
    let low = 0.01;
    let high = 0.99;

    const flatResult = calculateFinalD(targetLastRed);

    if (flatResult < trefilaExit) {
      low = 0.001;
      high = targetLastRed;
    } else {
      low = targetLastRed;
      high = 0.90; // Não deve precisar chegar tão alto
    }

    // 50 iterações são suficientes para precisão alta
    for (let j = 0; j < 50; j++) {
      const mid = (low + high) / 2;
      const res = calculateFinalD(mid);

      if (res < trefilaExit) {
        high = mid; // Reduziu demais
      } else {
        low = mid; // Reduziu de menos
      }
    }

    const bestRStart = (low + high) / 2;

    // Gerar os passes finais com o melhor R_start encontrado
    const newDies = [];
    let d = trefilaEntry;
    for (let i = 0; i < trefilaPassCount; i++) {
      const t = i / (trefilaPassCount - 1);
      const r = bestRStart * (1 - t) + targetLastRed * t;

      d = d * Math.sqrt(1 - r);

      // Forçar o último para o valor exato
      if (i === trefilaPassCount - 1) d = trefilaExit;

      newDies.push(Number(d.toFixed(3)));
    }

    setTrefilaDies(newDies);
  };

  const calculateEqualPasses = () => {
    if (trefilaEntry <= trefilaExit || trefilaPassCount <= 0) return;

    // ALGORITMO DE DISTRIBUIÇÃO UNIFORME (Frieiras)
    // Regra: A porcentagem de redução deve ser igual para todos os passes.
    // Ideal: 19% a 23%.

    // R = 1 - (Exit/Entry)^(2/passes)
    const requiredReduction = 1 - Math.pow(trefilaExit / trefilaEntry, 2 / trefilaPassCount);

    const newDies = [];
    let currentD = trefilaEntry;

    for (let i = 0; i < trefilaPassCount; i++) {
      // nextD = currentD * Math.sqrt(1 - requiredReduction)
      currentD = currentD * Math.sqrt(1 - requiredReduction);

      // Forçar o último para o valor exato para evitar erros de floating point
      if (i === trefilaPassCount - 1) currentD = trefilaExit;

      newDies.push(Number(currentD.toFixed(3)));
    }

    setTrefilaDies(newDies);
  };

  const handleSaveRecipe = () => {
    if (!recipeName.trim()) return;
    const recipe: TrefilaRecipe = {
      id: Date.now().toString(),
      name: recipeName,
      date: new Date().toLocaleDateString(),
      entry: trefilaEntry,
      exit: trefilaExit,
      passes: trefilaPassCount,
      dies: [...trefilaDies]
    };
    setSavedRecipes([...savedRecipes, recipe]);
    setRecipeName('');
  };

  const handleLoadRecipe = (recipe: TrefilaRecipe) => {
    setTrefilaEntry(recipe.entry);
    setTrefilaExit(recipe.exit);
    setTrefilaPassCount(recipe.passes);
    setTrefilaDies(recipe.dies);
  };

  const handleDeleteRecipe = (id: string) => {
    setSavedRecipes(savedRecipes.filter(r => r.id !== id));
  };

  const handleDieChange = (index: number, value: string) => {
    const newDies = [...trefilaDies];
    newDies[index] = Number(value);
    setTrefilaDies(newDies);
  };


  // Calculator State (Malhas)
  const [calcMeshId, setCalcMeshId] = useState<string>('');
  const [calcMode, setCalcMode] = useState<'kg' | 'unit'>('kg');
  const [calcInput, setCalcInput] = useState<string>('');
  const [calcResult, setCalcResult] = useState<number | null>(null);

  // Breakdown State
  const [breakdown, setBreakdown] = useState<{
    width: number,
    length: number,
    partA: number,
    partB: number,
    total: number,
    quantityUsed: number,
    countT: number,
    countL: number
  } | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: `Olá, ${username}! Sou o Beto. Como posso ajudar com o estoque, especificações técnicas ou as novas tabelas de malhas hoje?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculator Effect
  useEffect(() => {
    const mesh = meshes.find(m => m.id === calcMeshId);
    const value = parseFloat(calcInput);

    let productionQuantity = 1;

    if (mesh && !isNaN(value) && value > 0) {
      if (calcMode === 'kg') {
        productionQuantity = value / mesh.peso;
      } else {
        productionQuantity = value;
      }
    } else {
      productionQuantity = 1;
    }

    if (mesh) {
      try {
        const parts = mesh.dimensao.toLowerCase().split('x').map(p => parseFloat(p.replace(',', '.').trim()));
        if (parts.length === 2) {
          const width = parts[0];
          const length = parts[1];

          const partA_single = mesh.t * width;
          const partB_single = mesh.l * length;

          const partA_total = partA_single * productionQuantity;
          const partB_total = partB_single * productionQuantity;

          const countT_total = mesh.t * productionQuantity;
          const countL_total = mesh.l * productionQuantity;

          setBreakdown({
            width,
            length,
            partA: partA_total,
            partB: partB_total,
            total: partA_total + partB_total,
            quantityUsed: productionQuantity,
            countT: countT_total,
            countL: countL_total
          });
        } else {
          setBreakdown(null);
        }
      } catch (e) {
        setBreakdown(null);
      }
    } else {
      setBreakdown(null);
    }

    if (!mesh || isNaN(value) || value <= 0) {
      setCalcResult(null);
      return;
    }

    if (calcMode === 'kg') {
      setCalcResult(value / mesh.peso);
    } else {
      setCalcResult(value * mesh.peso);
    }
  }, [calcMeshId, calcMode, calcInput, meshes]);

  // Truss Calculator Logic
  useEffect(() => {
    const { height, length, topDiam, botDiam, sineDiam } = newTruss;
    const qty = trussQuantity > 0 ? trussQuantity : 1;

    if (height && length && topDiam && botDiam && sineDiam) {
      // Constant
      const K = 0.006162;

      // 1. Top Wire Weight (Per unit)
      const topWeightUnit = (topDiam * topDiam * K) * length;

      // 2. Bottom Wire Weight (2 wires, Per unit)
      const botWeightUnit = (botDiam * botDiam * K) * length * 2;

      // 3. Sine (Zigzag) Weight (Per unit)
      const teorema = Math.sqrt((height * height) + 100);
      const passes = length / 0.20; // 20cm step
      const sineTotalLengthMeters = (teorema * 2 * passes * 2) / 100;
      const sineWeightUnit = sineTotalLengthMeters * (sineDiam * sineDiam * K);

      const totalUnit = topWeightUnit + botWeightUnit + sineWeightUnit;

      setCalculatedTrussWeight(totalUnit);
      setTrussBreakdown({
        top: topWeightUnit * qty,
        bot: botWeightUnit * qty,
        sine: sineWeightUnit * qty,
        total: totalUnit * qty
      });

    } else {
      setCalculatedTrussWeight(0);
      setTrussBreakdown(null);
    }
  }, [newTruss, trussQuantity]);

  const handleSaveTruss = () => {
    if (newTruss.model && calculatedTrussWeight > 0) {
      setTrusses([...trusses, {
        id: Date.now().toString(),
        model: newTruss.model!,
        height: newTruss.height!,
        length: newTruss.length!,
        topDiam: newTruss.topDiam!,
        botDiam: newTruss.botDiam!,
        sineDiam: newTruss.sineDiam!,
        totalWeight: parseFloat(calculatedTrussWeight.toFixed(2))
      }]);
      // Reset form (optional, or keep values for ease of entry?)
      // Keeping values but clearing model name for next entry
      setNewTruss({ ...newTruss, model: '' });
    }
  };

  const handleDeleteTruss = (id: string) => {
    setTrusses(trusses.filter(t => t.id !== id));
  };


  // Commission Logic
  const handleCommissionChange = (companyId: string, monthIndex: number, value: string) => {
    const key = `${companyId}-${monthIndex}`;
    setCommissionData(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  const getCompanyTotal = (companyId: string) => {
    let total = 0;
    for (let i = 0; i < 12; i++) {
      total += commissionData[`${companyId}-${i}`] || 0;
    }
    return total;
  };

  const updateCompany = (id: string, field: 'name' | 'percent', value: string | number) => {
    setCompanies(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCompany = () => {
    const newId = (companies.length + 1).toString();
    setCompanies([...companies, { id: newId, name: 'NOVA EMPRESA', percent: 5 }]);
  };

  const addAdvance = () => {
    if (newAdvance.value && newAdvance.company) {
      setAdvances([...advances, {
        id: Date.now().toString(),
        value: parseFloat(newAdvance.value) || 0,
        companyName: newAdvance.company
      }]);
      setNewAdvance({ value: '', company: '' });
    }
  };

  const addReceipt = () => {
    if (newReceipt.value && newReceipt.company) {
      setReceipts([...receipts, {
        id: Date.now().toString(),
        value: parseFloat(newReceipt.value) || 0,
        companyName: newReceipt.company
      }]);
      setNewReceipt({ value: '', company: '' });
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const responseText = await generateBetoResponse(inputMessage);

    const betoMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, betoMsg]);
    setIsTyping(false);
  };

  const handleSaveMesh = () => {
    if (newMesh.tela && newMesh.peso) {
      const meshToAdd: MeshType = {
        id: Date.now().toString(),
        tela: newMesh.tela,
        metros: Number(newMesh.metros) || 0,
        bitola: Number(newMesh.bitola) || 0,
        espacamento: newMesh.espacamento || '',
        dimensao: newMesh.dimensao || '',
        t: Number(newMesh.t) || 0,
        l: Number(newMesh.l) || 0,
        peso: Number(newMesh.peso) || 0,
      };
      setMeshes([...meshes, meshToAdd]);
      setIsAddingMesh(false);
      setNewMesh({ tela: '', metros: 0, bitola: 0, espacamento: '', dimensao: '', t: 0, l: 0, peso: 0 });
    }
  };

  const handleDeleteMesh = (id: string) => {
    setMeshes(meshes.filter(m => m.id !== id));
  };

  // Consulting Job Handlers
  const handleOpenNewJob = () => {
    setCurrentJob({
      status: 'Agendado',
      startDate: new Date().toISOString().split('T')[0]
    });
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: ConsultingJob) => {
    setCurrentJob({ ...job });
    setIsJobModalOpen(true);
  };

  const handleDeleteJob = (id: string) => {
    setAgendaItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSaveJob = () => {
    if (!currentJob.client || !currentJob.description || !currentJob.startDate) return;

    if (currentJob.id) {
      // Edit
      setAgendaItems(prev => prev.map(item => item.id === currentJob.id ? currentJob as ConsultingJob : item));
    } else {
      // Create
      const newJob: ConsultingJob = {
        id: Date.now().toString(),
        client: currentJob.client,
        description: currentJob.description,
        startDate: currentJob.startDate,
        endDate: currentJob.endDate,
        status: currentJob.status as 'Agendado' | 'Em Andamento' | 'Concluido' || 'Agendado'
      };
      setAgendaItems([...agendaItems, newJob]);
    }
    setIsJobModalOpen(false);
  };


  // Helper for budget calculation dates
  const addWeeks = (dateStr: string, weeks: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + (weeks * 7));
    return d.toLocaleDateString('pt-BR');
  };

  const getWeekRange = (dateStr: string, weekIndex: number) => {
    const start = new Date(dateStr);
    start.setDate(start.getDate() + (weekIndex * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 4); // Assuming 5 day work week or just range representation
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} a ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}`;
  };

  // Dashboard Overview Calculations
  const activeConsultingJobs = agendaItems.filter(i => i.status === 'Em Andamento').length;
  const scheduledConsultingJobs = agendaItems.filter(i => i.status === 'Agendado').length;
  const nextConsultingJob = agendaItems
    .filter(i => new Date(i.startDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const statusData = [
    { name: 'Agendado', value: scheduledConsultingJobs },
    { name: 'Em Andamento', value: activeConsultingJobs },
    { name: 'Concluído', value: agendaItems.filter(i => i.status === 'Concluido').length },
  ];


  // Budget Calculations
  const totalWeekly = quoteForm.valueWeeklyService + quoteForm.valueWeeklyTravel + quoteForm.valueWeeklyFood;
  const totalMonthly = totalWeekly * quoteForm.weeks;
  const taxValue = totalMonthly * (quoteForm.taxPercent / 100);
  const grandTotal = totalMonthly + taxValue;
  const totalConsultingHours = quoteForm.weeks * quoteForm.workingDays.length * quoteForm.hoursPerDay;
  const paymentPerWeek = grandTotal / quoteForm.weeks;

  return (
    <div className="flex h-screen bg-slate-50 print:h-auto print:bg-white">
      {/* Sidebar - Mobile Responsive */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out flex flex-col print:hidden`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-700 bg-slate-800">
          <div className="bg-white p-2 rounded-full border-2 border-orange-500 shadow-md">
            <HardHat className="text-orange-600" size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">BETO</h2>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Soluções em Aço</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden ml-auto">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span>Visão Geral</span>
          </button>

          <button
            onClick={() => setActiveTab('consultorias')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'consultorias' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Calendar size={20} />
            <span>Consultorias</span>
          </button>

          <button
            onClick={() => setActiveTab('malhas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'malhas' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Grid3X3 size={20} />
            <span>Malhas</span>
          </button>

          <button
            onClick={() => setActiveTab('trelica')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'trelica' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Triangle size={20} />
            <span>Treliças</span>
          </button>

          <button
            onClick={() => setActiveTab('trefila')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'trefila' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Cable size={20} />
            <span>Máquina Trefila</span>
          </button>

          <button
            onClick={() => setActiveTab('comissao')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'comissao' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Briefcase size={20} />
            <span>Comissão</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'chat' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <MessageSquare size={20} />
            <span>Fale com o Beto</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-orange-500 overflow-hidden text-white">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{username}</p>
              <p className="text-xs text-slate-400">Gestor</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible print:h-auto">
        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b p-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <HardHat className="text-orange-600" size={24} />
            <span className="font-bold text-slate-800">BETO</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 print:overflow-visible print:p-0">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Painel de Controle</h1>
                  <p className="text-slate-500">Bem-vindo de volta, {username}. Aqui está o resumo da sua agenda.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border flex items-center gap-2 text-sm text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Agenda Atualizada
                </div>
              </div>

              {/* KPI Cards - UPDATED FOR CONSULTING */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Briefcase size={64} className="text-orange-500" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                      <Clock size={24} />
                    </div>
                    <span className="text-orange-600 text-sm font-medium">Atuais</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium relative z-10">Consultorias em Andamento</h3>
                  <p className="text-3xl font-bold text-slate-800 mt-1 relative z-10">{activeConsultingJobs}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Calendar size={64} className="text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <Calendar size={24} />
                    </div>
                    <span className="text-blue-600 text-sm font-medium">Futuros</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium relative z-10">Agendamentos Confirmados</h3>
                  <p className="text-3xl font-bold text-slate-800 mt-1 relative z-10">{scheduledConsultingJobs}</p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User size={64} className="text-green-500" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                      <User size={24} />
                    </div>
                    <span className="text-green-600 text-sm font-medium">Próximo</span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium relative z-10">Próximo Compromisso</h3>
                  <p className="text-xl font-bold text-slate-800 mt-1 truncate relative z-10">
                    {nextConsultingJob ? nextConsultingJob.client : 'Nenhum'}
                  </p>
                  <p className="text-xs text-slate-500 relative z-10">
                    {nextConsultingJob ? new Date(nextConsultingJob.startDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Agenda Timeline List */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Calendar className="text-slate-400" size={20} />
                      Próximos Compromissos
                    </h3>
                    <button
                      onClick={() => setActiveTab('consultorias')}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ver Agenda Completa <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {agendaItems
                      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                      .slice(0, 5) // Show top 5
                      .map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-4 border-transparent hover:border-orange-500">
                          <div className="flex flex-col items-center min-w-[50px] bg-slate-100 rounded p-1">
                            <span className="text-xs font-bold text-slate-500 uppercase">{new Date(item.startDate).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                            <span className="text-lg font-bold text-slate-800">{new Date(item.startDate).getDate()}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-800 text-sm">{item.client}</h4>
                            <p className="text-xs text-slate-500 truncate">{item.description}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${item.status === 'Agendado' ? 'bg-blue-100 text-blue-700' :
                            item.status === 'Em Andamento' ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    {agendaItems.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <Calendar size={48} className="mx-auto mb-2 opacity-20" />
                        <p>Sua agenda está vazia.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Charts & Quick Actions */}
                <div className="space-y-6">
                  {/* Status Chart */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Visão Geral da Carteira</h3>
                    <div className="h-48 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                          <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Acesso Rápido</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => { setActiveTab('consultorias'); setConsultingTab('orcamento'); }}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all group"
                      >
                        <FileText className="text-slate-400 group-hover:text-orange-500 mb-2" size={24} />
                        <span className="text-sm font-bold">Novo Orçamento</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('consultorias'); setConsultingTab('agenda'); setTimeout(handleOpenNewJob, 100); }}
                        className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all group"
                      >
                        <Clock className="text-slate-400 group-hover:text-blue-500 mb-2" size={24} />
                        <span className="text-sm font-bold">Agendar Visita</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'malhas' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Tipos de Malhas</h1>
                  <p className="text-slate-500">Catálogo técnico e calculadora de produção</p>
                </div>
                <button
                  onClick={() => setIsAddingMesh(!isAddingMesh)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Plus size={20} />
                  {isAddingMesh ? 'Cancelar' : 'Nova Malha'}
                </button>
              </div>

              {isAddingMesh && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-in slide-in-from-top-4 fade-in">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Cadastrar Nova Malha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input type="text" placeholder="Tela (ex: EQ 045)" className="p-2 border rounded" value={newMesh.tela} onChange={(e) => setNewMesh({ ...newMesh, tela: e.target.value })} />
                    <input type="number" placeholder="Metros" className="p-2 border rounded" value={newMesh.metros || ''} onChange={(e) => setNewMesh({ ...newMesh, metros: parseFloat(e.target.value) })} />
                    <input type="number" placeholder="Bitola (mm)" className="p-2 border rounded" value={newMesh.bitola || ''} onChange={(e) => setNewMesh({ ...newMesh, bitola: parseFloat(e.target.value) })} />
                    <input type="text" placeholder="Espaçamento" className="p-2 border rounded" value={newMesh.espacamento} onChange={(e) => setNewMesh({ ...newMesh, espacamento: e.target.value })} />
                    <input type="text" placeholder="Dimensão (LxC)" className="p-2 border rounded" value={newMesh.dimensao} onChange={(e) => setNewMesh({ ...newMesh, dimensao: e.target.value })} />
                    <input type="number" placeholder="T" className="p-2 border rounded" value={newMesh.t || ''} onChange={(e) => setNewMesh({ ...newMesh, t: parseFloat(e.target.value) })} />
                    <input type="number" placeholder="L" className="p-2 border rounded" value={newMesh.l || ''} onChange={(e) => setNewMesh({ ...newMesh, l: parseFloat(e.target.value) })} />
                    <input type="number" placeholder="Peso (Kg/Pç)" className="p-2 border rounded" value={newMesh.peso || ''} onChange={(e) => setNewMesh({ ...newMesh, peso: parseFloat(e.target.value) })} />
                  </div>
                  <button onClick={handleSaveMesh} className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                    <Save size={18} /> Salvar
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-white uppercase text-xs">
                      <tr>
                        <th className="px-4 py-3">Tela</th>
                        <th className="px-4 py-3">Metros</th>
                        <th className="px-4 py-3">Ø Bitola</th>
                        <th className="px-4 py-3">Espaçamento</th>
                        <th className="px-4 py-3">Dimensão</th>
                        <th className="px-4 py-3">T</th>
                        <th className="px-4 py-3">L</th>
                        <th className="px-4 py-3">Peso (Kg/Pç)</th>
                        <th className="px-4 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {meshes.map((mesh, idx) => (
                        <tr key={mesh.id} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                          <td className="px-4 py-3 font-medium text-slate-900">{mesh.tela}</td>
                          <td className="px-4 py-3 text-slate-600">{mesh.metros}</td>
                          <td className="px-4 py-3 text-slate-600">{mesh.bitola}</td>
                          <td className="px-4 py-3 text-slate-600">{mesh.espacamento}</td>
                          <td className="px-4 py-3 text-slate-600">{mesh.dimensao}</td>
                          <td className="px-4 py-3 text-slate-600">{mesh.t}</td>
                          <td className="px-4 py-3 text-slate-600">{mesh.l}</td>
                          <td className="px-4 py-3 font-bold text-slate-800">{mesh.peso}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => handleDeleteMesh(mesh.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculator Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calculator className="text-orange-500" /> Calcular Produção de Malhas
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Modelo da Treliça / Malha</label>
                      <select
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={calcMeshId}
                        onChange={(e) => setCalcMeshId(e.target.value)}
                      >
                        <option value="">Selecione um modelo...</option>
                        {meshes.map(m => (
                          <option key={m.id} value={m.id}>{m.tela} - {m.peso} Kg/Pç</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Modo de Cálculo</label>
                        <div className="flex bg-slate-100 rounded-lg p-1">
                          <button
                            onClick={() => setCalcMode('kg')}
                            className={`flex-1 py-1 px-3 rounded-md text-sm font-medium transition-all ${calcMode === 'kg' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                          >
                            Por KG
                          </button>
                          <button
                            onClick={() => setCalcMode('unit')}
                            className={`flex-1 py-1 px-3 rounded-md text-sm font-medium transition-all ${calcMode === 'unit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                          >
                            Por Unidade
                          </button>
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {calcMode === 'kg' ? 'Quantidade (KG)' : 'Quantidade (Peças)'}
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                          value={calcInput}
                          onChange={(e) => setCalcInput(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-4">
                      <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Resultado:</span>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-orange-600">
                            {calcResult !== null ? calcResult.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '--'}
                          </span>
                          <span className="text-sm text-slate-400 block font-medium">
                            {calcMode === 'kg' ? 'Peças produzidas' : 'Kg Total'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Breakdown */}
                {breakdown && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <ScanLine className="text-blue-500" /> Detalhamento Técnico
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-500 font-bold uppercase mb-1">Largura</p>
                          <p className="font-bold text-slate-700">{breakdown.width.toFixed(2)}m</p>
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="font-bold">{Math.ceil(breakdown.countT).toLocaleString()}</span> fios de {breakdown.width.toFixed(2)}m
                          </p>
                          <p className="text-sm font-bold text-slate-800 mt-1">= {breakdown.partA.toFixed(2)}m lineares</p>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-xs text-blue-500 font-bold uppercase mb-1">Comprimento</p>
                          <p className="font-bold text-slate-700">{breakdown.length.toFixed(2)}m</p>
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="font-bold">{Math.ceil(breakdown.countL).toLocaleString()}</span> fios de {breakdown.length.toFixed(2)}m
                          </p>
                          <p className="text-sm font-bold text-slate-800 mt-1">= {breakdown.partB.toFixed(2)}m lineares</p>
                        </div>
                      </div>
                      <div className="bg-slate-900 text-white p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Total de Aço Necessário</p>
                          <p className="text-xs text-slate-500">Para {Math.ceil(breakdown.quantityUsed).toLocaleString()} peças</p>
                        </div>
                        <p className="text-2xl font-bold">{breakdown.total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">metros lineares</span></p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trelica' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Cálculo de Treliças</h1>
                  <p className="text-slate-500">Calculadora técnica para peso e estrutura de treliças</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* Calculator Card */}
                <div className="xl:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Triangle className="text-orange-500" /> Nova Treliça / Produção
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Modelo / Nome</label>
                      <input
                        type="text"
                        placeholder="Ex: H8, H12"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                        value={newTruss.model || ''}
                        onChange={(e) => setNewTruss({ ...newTruss, model: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Altura (cm)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                          value={newTruss.height || ''}
                          onChange={(e) => setNewTruss({ ...newTruss, height: parseFloat(e.target.value.replace(',', '.')) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Tamanho (mts)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                          value={newTruss.length || ''}
                          onChange={(e) => setNewTruss({ ...newTruss, length: parseFloat(e.target.value.replace(',', '.')) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="text-xs font-bold text-green-700 uppercase mb-1 block">Superior (mm)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-2 border border-green-200 bg-green-50 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                          value={newTruss.topDiam || ''}
                          onChange={(e) => setNewTruss({ ...newTruss, topDiam: parseFloat(e.target.value.replace(',', '.')) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-emerald-800 uppercase mb-1 block">Inferior (mm)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-2 border border-emerald-200 bg-emerald-50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={newTruss.botDiam || ''}
                          onChange={(e) => setNewTruss({ ...newTruss, botDiam: parseFloat(e.target.value.replace(',', '.')) })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-lime-700 uppercase mb-1 block">Senozoide (mm)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full p-2 border border-lime-200 bg-lime-50 rounded-lg focus:ring-2 focus:ring-lime-500 outline-none"
                          value={newTruss.sineDiam || ''}
                          onChange={(e) => setNewTruss({ ...newTruss, sineDiam: parseFloat(e.target.value.replace(',', '.')) })}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-900 uppercase mb-1 block">Quantidade a Produzir</label>
                      <input
                        type="number"
                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-lg font-medium"
                        value={trussQuantity || ''}
                        onChange={(e) => setTrussQuantity(parseInt(e.target.value))}
                        placeholder="1"
                      />
                    </div>

                    {/* Production Breakdown Summary */}
                    {trussBreakdown && (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 mt-4">
                        <h4 className="text-sm font-bold text-slate-800 uppercase border-b border-slate-200 pb-2">Resumo de Produção ({trussQuantity} pçs)</h4>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700 font-medium">Superior ({newTruss.topDiam}mm):</span>
                          <span className="font-bold">{trussBreakdown.top.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-800 font-medium">Inferior ({newTruss.botDiam}mm):</span>
                          <span className="font-bold">{trussBreakdown.bot.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-lime-700 font-medium">Senozoide ({newTruss.sineDiam}mm):</span>
                          <span className="font-bold">{trussBreakdown.sine.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</span>
                        </div>
                        <div className="flex justify-between text-base pt-2 border-t border-slate-200">
                          <span className="text-slate-900 font-bold uppercase">Total Geral:</span>
                          <span className="font-black text-orange-600">{trussBreakdown.total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleSaveTruss}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save size={18} /> Salvar Modelo
                    </button>
                  </div>
                </div>

                {/* Table List */}
                <div className="xl:col-span-8">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-4 text-center">
                      <h3 className="text-white font-bold text-xl uppercase tracking-wider">Cálculo de Treliças</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-center">
                        <thead>
                          <tr className="text-white text-xs font-bold uppercase">
                            <th className="p-4 bg-slate-800 w-1/6">Modelo</th>
                            <th className="p-4 bg-slate-700 w-1/6">Altura</th>
                            <th className="p-4 bg-slate-800 w-1/6">Tamanho (mts)</th>
                            <th className="p-4 bg-[#4a6741] w-1/6">Superior (mm)</th>
                            <th className="p-4 bg-[#3d5a34] w-1/6">Inferior (mm)</th>
                            <th className="p-4 bg-[#5e8052] w-1/6">Senozoide (mm)</th>
                            <th className="p-4 bg-[#c25e00] w-1/6">Peso Unit.</th>
                            <th className="p-4 bg-slate-900 w-10"></th>
                          </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                          {trusses.map((truss) => (
                            <tr key={truss.id} className="border-b border-slate-100 last:border-0">
                              <td className="p-4 bg-slate-50 text-slate-900 font-bold">{truss.model}</td>
                              <td className="p-4 bg-blue-50 text-slate-800">{truss.height}</td>
                              <td className="p-4 bg-blue-100 text-slate-900">{truss.length}</td>
                              <td className="p-4 bg-green-200 text-green-900">{truss.topDiam}</td>
                              <td className="p-4 bg-green-300 text-green-900">{truss.botDiam}</td>
                              <td className="p-4 bg-green-100 text-green-800">{truss.sineDiam}</td>
                              <td className="p-4 bg-orange-200 text-orange-900 font-bold text-lg">{truss.totalWeight.toFixed(2)}</td>
                              <td className="p-2">
                                <button onClick={() => handleDeleteTruss(truss.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {trusses.length === 0 && (
                            <tr>
                              <td colSpan={8} className="p-8 text-slate-400">Nenhuma treliça cadastrada.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'trefila' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Cálculo de Trefilação</h1>
                  <p className="text-slate-500">Otimização de passes e controle de área de redução</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Cable className="text-orange-500" /> Parâmetros
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Trefilação</label>
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => setTrefilaMode('cacetes')}
                          className={`flex-1 py-1 px-3 rounded-md text-xs font-bold uppercase transition-all ${trefilaMode === 'cacetes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Cacetes
                        </button>
                        <button
                          onClick={() => setTrefilaMode('frieiras')}
                          className={`flex-1 py-1 px-3 rounded-md text-xs font-bold uppercase transition-all ${trefilaMode === 'frieiras' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          Frieiras
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Diâmetro de Entrada (mm)</label>
                      <input
                        type="number" step="0.01"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={trefilaEntry}
                        onChange={(e) => setTrefilaEntry(parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Diâmetro Final (mm)</label>
                      <input
                        type="number" step="0.01"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={trefilaExit}
                        onChange={(e) => setTrefilaExit(parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número de Passes</label>
                      <input
                        type="number"
                        className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        value={trefilaPassCount}
                        onChange={(e) => setTrefilaPassCount(parseInt(e.target.value))}
                      />
                    </div>

                    <button
                      onClick={() => trefilaMode === 'cacetes' ? calculateIdealPasses() : calculateEqualPasses()}
                      className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                      <Settings size={18} /> Calcular Distribuição
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  {/* Visual Blocks Representation */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                      <ScanLine className="text-blue-600" /> Fluxo de Redução
                    </h3>

                    <div className="flex items-center gap-2 overflow-x-auto pb-6 px-4">
                      {/* INPUT BLOCK */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-32 h-24 bg-slate-800 text-white flex flex-col items-center justify-center rounded-l-lg shadow-lg relative group">
                          <span className="text-xs text-slate-400 absolute top-2 left-2">Entrada</span>
                          <span className="text-2xl font-black">{trefilaEntry.toFixed(2)}</span>
                          <span className="text-xs">mm</span>
                        </div>
                        <div className="h-1 w-full bg-slate-300 mt-[-1px]"></div>
                      </div>

                      {/* PASSES CHAIN */}
                      {trefilaDies.map((die, i) => {
                        const red = trefilaReductions[i]?.reduction || 0;
                        const isHigh = trefilaMode === 'cacetes'
                          ? (red > 29)
                          : (red > 23 || red < 19);

                        const isLastHigh = trefilaMode === 'cacetes'
                          ? ((i === trefilaDies.length - 1) && red > 19)
                          : false; // Uniform distribution covers all passes

                        return (
                          <div key={i} className="flex flex-col items-center flex-shrink-0">
                            {/* Connecting Wire */}
                            <div className="w-full h-2 bg-slate-300 relative top-[48px] -z-10"></div>

                            {/* Die Representation */}
                            <div className="relative flex flex-col items-center mx-2 transform hover:scale-105 transition-transform z-10">
                              <div className="w-24 h-24 bg-slate-200 border-4 border-slate-400 flex flex-col items-center justify-center shadow-md relative"
                                style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}>
                                <span className="text-xs font-bold text-slate-500 mb-1">Passe {i + 1}</span>
                                <span className="text-xl font-bold text-slate-800">{die.toFixed(2)}</span>
                              </div>

                              {/* Reduction Tag */}
                              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${isHigh || isLastHigh ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
                                }`}>
                                {red.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        )
                      })}

                      {/* OUTPUT BLOCK */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-full h-2 bg-slate-300 relative top-[48px] -z-10"></div>
                        <div className="ml-2 w-32 h-24 bg-green-600 text-white flex flex-col items-center justify-center rounded-r-lg shadow-lg relative">
                          <span className="text-xs text-green-200 absolute top-2 right-2">Final</span>
                          <span className="text-2xl font-black">{trefilaExit.toFixed(2)}</span>
                          <span className="text-xs">mm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Graph Section */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Gráfico de Redução (% da Área)</h3>
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trefilaReductions} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="pass" stroke="#64748b" label={{ value: 'Passe', position: 'insideBottom', offset: -5 }} />
                          <YAxis stroke="#64748b" label={{ value: '% Redução', angle: -90, position: 'insideLeft' }} />
                          <Tooltip contentStyle={{ borderRadius: '8px' }} />
                          {/* Limit Lines */}
                          {trefilaMode === 'cacetes' ? (
                            <>
                              <ReferenceLine y={29} label="Max Inicial (29%)" stroke="red" strokeDasharray="3 3" />
                              <ReferenceLine y={19} label="Max Final (19%)" stroke="orange" strokeDasharray="3 3" />
                            </>
                          ) : (
                            <>
                              <ReferenceLine y={23} label="Max (23%)" stroke="red" strokeDasharray="3 3" />
                              <ReferenceLine y={19} label="Min (19%)" stroke="orange" strokeDasharray="3 3" />
                            </>
                          )}

                          <Line type="monotone" dataKey="reduction" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Save Recipe Section */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Save size={20} className="text-orange-500" /> Salvar Receita
                    </h3>
                    <div className="flex gap-4 mb-6">
                      <input
                        type="text"
                        placeholder="Nome da Receita (Ex: Trefila 5.5 -> 3.2)"
                        className="flex-1 p-2 border border-slate-300 rounded-lg"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                      />
                      <button
                        onClick={handleSaveRecipe}
                        className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50"
                        disabled={!recipeName.trim()}
                      >
                        Salvar
                      </button>
                    </div>

                    {savedRecipes.length > 0 && (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                              <th className="px-4 py-3">Nome</th>
                              <th className="px-4 py-3">Entrada</th>
                              <th className="px-4 py-3">Saída</th>
                              <th className="px-4 py-3">Passes</th>
                              <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {savedRecipes.map(recipe => (
                              <tr key={recipe.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-bold text-slate-700">{recipe.name}</td>
                                <td className="px-4 py-3">{recipe.entry}mm</td>
                                <td className="px-4 py-3">{recipe.exit}mm</td>
                                <td className="px-4 py-3">{recipe.passes}</td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                  <button onClick={() => handleLoadRecipe(recipe)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase">Carregar</button>
                                  <button onClick={() => handleDeleteRecipe(recipe.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Quick Edit Table */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Tabela Detalhada</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-3">Passe</th>
                            <th className="px-4 py-3">Diâmetro (mm)</th>
                            <th className="px-4 py-3">Redução (%)</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {trefilaDies.map((die, index) => {
                            const reduction = trefilaReductions[index]?.reduction || 0;

                            let status = 'OK';
                            if (trefilaMode === 'cacetes') {
                              if (reduction > 29) status = 'Crítica';
                              else if (reduction > 22) status = 'Alta';
                            } else {
                              if (reduction > 23) status = 'Alta';
                              if (reduction < 19) status = 'Baixa';
                            }

                            const isWarning = status !== 'OK';

                            return (
                              <tr key={index} className="bg-white hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">#{index + 1}</td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number" step="0.01"
                                    className="w-24 p-1 border border-slate-300 rounded text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={die}
                                    onChange={(e) => handleDieChange(index, e.target.value)}
                                  />
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700">
                                  {reduction.toFixed(3)}%
                                </td>
                                <td className="px-4 py-3">
                                  {isWarning ? (
                                    <span className="text-red-500 font-bold text-xs flex items-center gap-1"><AlertCircle size={12} /> {status}</span>
                                  ) : (
                                    <span className="text-green-500 font-bold text-xs flex items-center gap-1"><CheckSquare size={12} /> OK</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'consultorias' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Consultoria Técnica</h1>
                  <p className="text-slate-500">Gestão de agendamentos e orçamentos</p>
                </div>
                <div className="flex bg-slate-200 p-1 rounded-lg">
                  <button
                    onClick={() => setConsultingTab('agenda')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${consultingTab === 'agenda' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
                  >
                    Agenda
                  </button>
                  <button
                    onClick={() => setConsultingTab('orcamento')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${consultingTab === 'orcamento' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
                  >
                    Orçamento
                  </button>
                </div>
              </div>

              {consultingTab === 'agenda' ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Agendamentos</h3>
                    <button onClick={handleOpenNewJob} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                      <Plus size={18} /> Novo Agendamento
                    </button>
                  </div>
                  <div className="space-y-4">
                    {agendaItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-300 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                            <Calendar size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{item.client}</h4>
                            <p className="text-sm text-slate-500">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600 flex items-center gap-1">
                                {new Date(item.startDate).toLocaleDateString()}
                                {item.endDate && item.endDate !== item.startDate && ` - ${new Date(item.endDate).toLocaleDateString()}`}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.status === 'Concluido' ? 'bg-green-100 text-green-700' :
                                item.status === 'Em Andamento' ? 'bg-orange-100 text-orange-700' :
                                  'bg-blue-100 text-blue-700'
                                }`}>
                                {item.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditJob(item)} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18} /></button>
                          <button onClick={() => handleDeleteJob(item.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Toolbar */}
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 print:hidden">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Gerador de Propostas</h3>
                      <p className="text-xs text-slate-500">Crie orçamentos técnicos profissionais</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <Printer size={18} /> Imprimir
                      </button>
                      <button
                        onClick={() => {
                          const newQuote: SavedQuote = { ...quoteForm, id: Date.now().toString(), createdAt: new Date().toISOString() };
                          setSavedQuotes([...savedQuotes, newQuote]);
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <Save size={18} /> Salvar Proposta
                      </button>
                    </div>
                  </div>

                  {/* Document Paper Representation */}
                  <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200 mx-auto max-w-4xl print:shadow-none print:border-none print:w-full print:max-w-none print:p-0">

                    {/* Document Header */}
                    <div className="flex justify-between items-start border-b-2 border-orange-500 pb-6 mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white p-3 rounded-lg print:bg-slate-900 print:text-white">
                          <HardHat size={32} />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">BETO Soluções em Aço</h1>
                          <p className="text-sm text-slate-500">Consultoria Especializada e Treinamentos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Orçamento</h2>
                        <p className="text-sm font-medium text-slate-600">#{new Date().getFullYear()}-{Math.floor(Math.random() * 1000)}</p>
                        <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:gap-8">
                      {/* Left Column: Inputs */}
                      <div className="space-y-8">

                        {/* Client Info Section */}
                        <section>
                          <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 border-b border-orange-100 pb-2">
                            <User size={16} /> Informações do Cliente
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa / Cliente</label>
                              <input type="text" className="w-full p-2 border-b border-slate-300 focus:border-orange-500 bg-transparent outline-none transition-colors font-medium text-slate-900" placeholder="Nome da Empresa" value={quoteForm.clientName} onChange={e => setQuoteForm({ ...quoteForm, clientName: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contato</label>
                                <input type="text" className="w-full p-2 border-b border-slate-300 focus:border-orange-500 bg-transparent outline-none transition-colors text-slate-700" placeholder="Nome do Contato" value={quoteForm.contact} onChange={e => setQuoteForm({ ...quoteForm, contact: e.target.value })} />
                              </div>
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data de Início</label>
                                <input type="date" className="w-full p-2 border-b border-slate-300 focus:border-orange-500 bg-transparent outline-none transition-colors text-slate-700" value={quoteForm.startDate} onChange={e => setQuoteForm({ ...quoteForm, startDate: e.target.value })} />
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Scope Section */}
                        <section>
                          <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 border-b border-orange-100 pb-2">
                            <Briefcase size={16} /> Escopo do Projeto
                          </h4>
                          <div className="space-y-4">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duração (Semanas)</label>
                                <input type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900" value={quoteForm.weeks} onChange={e => setQuoteForm({ ...quoteForm, weeks: parseInt(e.target.value) })} />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Carga Horária / Dia</label>
                                <input type="number" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-900" value={quoteForm.hoursPerDay} onChange={e => setQuoteForm({ ...quoteForm, hoursPerDay: parseFloat(e.target.value) })} />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Dias de Atuação</label>
                              <div className="flex gap-2">
                                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((d, idx) => {
                                  const isSelected = quoteForm.workingDays.includes(idx);
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => {
                                        const newDays = isSelected
                                          ? quoteForm.workingDays.filter(d => d !== idx)
                                          : [...quoteForm.workingDays, idx].sort();
                                        setQuoteForm({ ...quoteForm, workingDays: newDays });
                                      }}
                                      className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-all border ${isSelected ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                                    >
                                      {d}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </section>

                        {/* Financial Inputs Section */}
                        <section className="print:hidden">
                          <h4 className="flex items-center gap-2 text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 border-b border-orange-100 pb-2">
                            <DollarSign size={16} /> Composição de Custos
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Honorários (Semanal)</label><input type="number" className="w-full p-2 border rounded font-medium" value={quoteForm.valueWeeklyService} onChange={e => setQuoteForm({ ...quoteForm, valueWeeklyService: parseFloat(e.target.value) })} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Impostos (%)</label><input type="number" className="w-full p-2 border rounded font-medium" value={quoteForm.taxPercent} onChange={e => setQuoteForm({ ...quoteForm, taxPercent: parseFloat(e.target.value) })} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Deslocamento</label><input type="number" className="w-full p-2 border rounded" value={quoteForm.valueWeeklyTravel} onChange={e => setQuoteForm({ ...quoteForm, valueWeeklyTravel: parseFloat(e.target.value) })} /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Alimentação</label><input type="number" className="w-full p-2 border rounded" value={quoteForm.valueWeeklyFood} onChange={e => setQuoteForm({ ...quoteForm, valueWeeklyFood: parseFloat(e.target.value) })} /></div>
                          </div>
                        </section>
                      </div>

                      {/* Right Column: Financial Summary Document */}
                      <div>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 print:bg-transparent print:border-slate-300 print:p-0">
                          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center justify-between">
                            Investimento Estimado
                            <span className="text-xs font-normal bg-white border border-slate-200 px-2 py-1 rounded text-slate-500 print:hidden">
                              Atualização automática
                            </span>
                          </h3>

                          <div className="space-y-6">
                            {/* Time Breakdown */}
                            <div className="flex items-center gap-4 text-sm text-slate-600 pb-6 border-b border-slate-200 border-dashed">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>{quoteForm.weeks} Semanas</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock size={16} />
                                <span>{totalConsultingHours} Horas Totais</span>
                              </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">Serviços Técnicos</span>
                                <span className="font-semibold text-slate-900">R$ {((quoteForm.valueWeeklyService * quoteForm.weeks)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-600">Custos Logísticos (Viagem/Alim.)</span>
                                <span className="font-semibold text-slate-900">R$ {(((quoteForm.valueWeeklyTravel + quoteForm.valueWeeklyFood) * quoteForm.weeks)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <div className="flex justify-between items-center text-orange-600">
                                <span>Encargos e Impostos ({quoteForm.taxPercent}%)</span>
                                <span className="font-semibold">R$ {taxValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                            </div>

                            {/* Total Box */}
                            <div className="bg-slate-900 text-white p-6 rounded-lg mt-6 print:bg-transparent print:text-black print:border-t-2 print:border-black print:rounded-none print:px-0">
                              <p className="text-sm text-slate-400 uppercase tracking-widest mb-1 print:text-slate-500">Valor Total do Projeto</p>
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm font-light">R$</span>
                                <span className="text-3xl font-bold tracking-tight">{grandTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-2 print:hidden">*Proposta válida por 15 dias.</p>
                            </div>

                            {/* Signature Placeholder Print Only */}
                            <div className="hidden print:block pt-16 mt-8">
                              <div className="grid grid-cols-2 gap-12">
                                <div className="border-t border-slate-400 pt-2">
                                  <p className="text-xs font-bold uppercase text-slate-900">BETO Soluções em Aço</p>
                                  <p className="text-[10px] text-slate-500">Consultor Técnico</p>
                                </div>
                                <div className="border-t border-slate-400 pt-2">
                                  <p className="text-xs font-bold uppercase text-slate-900">De Acordo</p>
                                  <p className="text-[10px] text-slate-500">{quoteForm.clientName || 'Cliente'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer - Print Only */}
                    <div className="hidden print:block mt-24 text-center border-t border-slate-100 pt-8">
                      <p className="text-xs text-slate-400">Beto Soluções em Aço - Especialista em Trefilação e Processos Siderúrgicos</p>
                      <p className="text-[10px] text-slate-300 mt-1">beto.solucoesemaco@gmail.com | (11) 99999-9999</p>
                    </div>
                  </div>


                  {/* Saved Quotes List */}
                  {savedQuotes.length > 0 && (
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
                      <h3 className="font-bold text-slate-800 mb-4">Orçamentos Salvos</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                              <th className="px-4 py-3">Data</th>
                              <th className="px-4 py-3">Cliente</th>
                              <th className="px-4 py-3">Valor Total</th>
                              <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {savedQuotes.map(quote => {
                              // Recalculate basic totals for display
                              const wTotal = quote.valueWeeklyService + quote.valueWeeklyTravel + quote.valueWeeklyFood;
                              const mTotal = wTotal * quote.weeks;
                              const grand = mTotal + (mTotal * (quote.taxPercent / 100));

                              return (
                                <tr key={quote.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3">{new Date(quote.createdAt).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 font-bold">{quote.clientName}</td>
                                  <td className="px-4 py-3 text-green-700 font-bold">R$ {grand.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                  <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    <button
                                      onClick={() => setQuoteForm(quote)}
                                      className="text-blue-600 hover:underline font-bold text-xs"
                                    >
                                      Carregar
                                    </button>
                                    <button
                                      onClick={() => setSavedQuotes(savedQuotes.filter(q => q.id !== quote.id))}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}


          {activeTab === 'comissao' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-slate-800">Controle de Comissões</h1>
              <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-left bg-slate-50 text-slate-500 uppercase text-xs">
                      <th className="p-2 sticky left-0 bg-slate-50 z-10">Empresa</th>
                      {months.map(m => <th key={m} className="p-2">{m.slice(0, 3)}</th>)}
                      <th className="p-2 font-bold text-slate-900">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.map(company => (
                      <tr key={company.id}>
                        <td className="p-2 sticky left-0 bg-white z-10 font-medium">{company.name}</td>
                        {months.map((_, idx) => (
                          <td key={idx} className="p-1">
                            <input
                              type="number"
                              className="w-20 p-1 border rounded text-right text-xs"
                              placeholder="0.00"
                              value={commissionData[`${company.id}-${idx}`] || ''}
                              onChange={(e) => handleCommissionChange(company.id, idx, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="p-2 font-bold text-slate-900">
                          {getCompanyTotal(company.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addCompany} className="mt-4 text-sm text-blue-600 font-bold hover:underline">+ Adicionar Empresa</button>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 p-4 flex items-center gap-3">
                <div className="bg-white p-1.5 rounded-full">
                  <HardHat className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">Beto Virtual</h3>
                  <p className="text-orange-400 text-xs">Especialista em Aço</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user'
                      ? 'bg-orange-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                      }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-orange-100' : 'text-slate-400'}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Pergunte sobre estoques, normas ou cálculos..."
                    className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-orange-600 text-white p-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div >

      {isJobModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
            <h3 className="text-xl font-bold text-slate-800 mb-4">{currentJob.id ? 'Editar' : 'Novo'} Agendamento</h3>
            <div className="space-y-4">
              <div><label className="text-sm font-bold">Cliente</label><input className="w-full border p-2 rounded" value={currentJob.client || ''} onChange={e => setCurrentJob({ ...currentJob, client: e.target.value })} /></div>
              <div><label className="text-sm font-bold">Descrição</label><input className="w-full border p-2 rounded" value={currentJob.description || ''} onChange={e => setCurrentJob({ ...currentJob, description: e.target.value })} /></div>
              <div><label className="text-sm font-bold">Data Início</label><input type="date" className="w-full border p-2 rounded" value={currentJob.startDate || ''} onChange={e => setCurrentJob({ ...currentJob, startDate: e.target.value })} /></div>
              <div><label className="text-sm font-bold">Data Término</label><input type="date" className="w-full border p-2 rounded" value={currentJob.endDate || ''} onChange={e => setCurrentJob({ ...currentJob, endDate: e.target.value })} /></div>
              <div>
                <label className="text-sm font-bold">Status</label>
                <select className="w-full border p-2 rounded" value={currentJob.status} onChange={e => setCurrentJob({ ...currentJob, status: e.target.value as any })}>
                  <option value="Agendado">Agendado</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluido">Concluído</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsJobModalOpen(false)} className="px-4 py-2 text-slate-600 font-bold">Cancelar</button>
              <button onClick={handleSaveJob} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Dashboard;