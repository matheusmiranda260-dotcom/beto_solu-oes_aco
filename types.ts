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