export interface User {
  id: string; // Supabase UUID
  username: string;
  role: 'admin' | 'gestor' | 'user';
  name: string;
  email?: string;
  permissions?: string[];
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