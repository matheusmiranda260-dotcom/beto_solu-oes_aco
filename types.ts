export interface User {
    id: string; // Supabase UUID
    username: string;
    role: 'admin' | 'gestor' | 'user';
    name: string;
    email?: string;
    permissions?: string[];
    // Tracking Stats
    loginCount?: number;
    lastSeen?: string;
    isOnline?: boolean;
    totalTime?: number;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
}

export interface InventoryItem {
    id: string;
    name: string;
    category: 'Bobinas' | 'Chapas' | 'Perfis' | 'Tubos';
    quantity: number; // em toneladas
    status: 'Normal' | 'Baixo' | 'Crítico';
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
}

export interface MeshType {
    id: string;
    tela: string;
    metros: number;
    bitola: number;
    espacamento: string;
    dimensao: string;
    t: number;
    l: number;
    peso: number;
    isTemplate?: boolean;
}

export interface TrussType {
    id: string;
    model: string;       // Nome/Modelo ex: H8
    height: number;      // cm (Altura)
    length: number;      // m (Tamanho)
    topDiam: number;     // mm (Superior)
    botDiam: number;     // mm (Inferior)
    sineDiam: number;    // mm (Senozoide)
    totalWeight: number; // kg (Peso Final)
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    message: string;
    date: Date;
    status: 'New' | 'Contacted';
}

export interface SparePart {
    id: string;
    name: string;
    code?: string;
    category: string; // e.g. 'Trefila', 'Geral'
    quantity: number;
    minLevel: number; // For low stock alerts
    location?: string;
    imageUrl?: string;
}

export interface StockLot {
    id: string;
    lotNumber: string;
    supplier: string;
    labelWeight: number;
    scaleWeight: number;
    difference?: number;
    status: string;
    notes?: string;
    createdAt?: string;
}

// --- NEW MODULE TYPES BELOW ---

export enum ElementType {
    BROCA = 'Broca',
    SAPATA = 'Sapata',
    PILAR = 'Pilar',
    VIGA_BALDRAME = 'Viga Baldrame',
    VIGA_SUPERIOR = 'Viga Superior'
}

export enum BarUsage {
    PRINCIPAL = 'Principal',
    COSTELA = 'Costela',
    CAMADA_2 = '2ª Camada',
    REFORCO = 'Reforço',
    CAVALETE = 'Cavalete',
    OUTROS = 'Outros'
}

export type HookType = 'none' | 'up' | 'down';

export interface Client {
    id: string;
    name: string;
    phone: string;
    address: string;
}

export interface MainBarGroup {
    count: number;
    gauge: string;
    usage: BarUsage;
    hookStartType: HookType; // Tipo da dobra inicial
    hookEndType: HookType;   // Tipo da dobra final
    hookStart: number;       // Medida em cm
    hookEnd: number;         // Medida em cm
    position?: string;       // Posição opcional (N...)
    placement?: 'top' | 'bottom' | 'distributed'; // Posição na seção (Superior/Inferior/Lateral)
    shape?: string; // Formato visual (ex: 'straight', 'u_up', 'c_up')
}

export interface SteelItem {
    id: string;
    type: ElementType;
    observation?: string; // Campo de observação individual (ex: "fundo", "sala", "pilar P1")
    quantity: number;
    length: number;
    width?: number;       // Largura (específico para sapatas)
    height?: number;      // Altura (específico para sapatas)
    mainBars: MainBarGroup[];
    hasStirrups: boolean;
    stirrupGauge: string;
    stirrupSpacing: number;
    stirrupWidth: number;
    stirrupHeight: number;
    stirrupPosition?: string; // Posição opcional do estribo (N...)
    isConfigured: boolean;
}

export interface Quote {
    id: string;
    clientId: string;
    isCounter?: boolean;
    counterName?: string;
    counterPhone?: string;
    observation?: string;
    date: string;
    items: SteelItem[];
    totalWeight: number;
    totalPrice: number;
    status: 'Draft' | 'Sent' | 'Approved';
}
