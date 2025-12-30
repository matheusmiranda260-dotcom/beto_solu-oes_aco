# Manual de Desenvolvimento e Glossário - Sistema de Cálculo de Ferragens

Este documento serve como guia para alinhar a comunicação e a terminologia técnica utilizada no desenvolvimento do projeto **Beto Soluções em Aço**.

## 1. Organograma do Sistema (Arquitetura Visual)

O fluxo de dados e a hierarquia dos componentes visuais:

```mermaid
graph TD
    Factory[🏭 QuoteBuilder (A Fábrica)] -->|Gerencia| List[📋 Lista de Itens (Tabela de Orçamento)]
    Factory -->|Usa| Brain[🧠 AIImageAnalyzer (O Cérebro/Leitor de Imagens)]
    Factory -->|Abre| Editor[✏️ ItemDetailEditor (A Prancheta de Edição)]

    subgraph "Edição (ItemDetailEditor)"
        Editor -->|Se for Viga| BeamView[📏 BeamElevationView (Vista Longitudinal Viga)]
        Editor -->|Se for Pilar| ColView[📐 ColumnElevationView (Vista em Elevação Pilar)]
        Editor -->|Para Ambos| SectionView[⭕ CompositeCrossSection (Seletor de Seção/Bolinhas)]
    end

    subgraph "Detalhes Visuais (Desenho Técnico)"
        BeamView & ColView -->|Contém| ConcreteShape[🧱 Seção de Concreto (Borda)]
        BeamView & ColView -->|Contém| MainBars[➖ Ferros Longitudinais (Barras/Pontos)]
        BeamView & ColView -->|Contém| DetachedStirrup[🔲 Estribo Avulso (Detalhamento)]
    end
```

## 2. Dicionário de Termos (Glossário)

Tradução entre o termo técnico do código e o elemento visual do projeto.

### Entidades (Os Dados)
| Nome no Código | Nome no Projeto | Descrição |
| :--- | :--- | :--- |
| **`SteelItem`** | **Peça / Item** | O elemento estrutural completo (Viga, Pilar, Sapata). Contém todas as propriedades. |
| **`MainBar`** | **Ferro Longitudinal** | As barras de aço principais. <br>- **Viga:** Linhas horizontais longas. <br>- **Pilar:** Círculos preenchidos (vista em corte). |
| **`Stirrup`** | **Estribo** | O anel transversal que envolve as barras (Retângulo, Triângulo, etc.). |
| **`id`** | **Identificador** | Código único da peça (ex: "ID_1767..."). |

### Componentes Visuais (As Vistas)
| Nome no Código | Nome Visual | O que faz? |
| :--- | :--- | :--- |
| **`BeamElevationView`** | **Vista Longitudinal (Viga)** | Desenho comprido da viga. Mostra os ferros longitudinais esticados, ganchos e a seção de corte transversal. |
| **`ColumnElevationView`** | **Vista em Elevação (Pilar)** | Desenho vertical ou seção do pilar. Mostra a distribuição dos estribos e a seção transversal com as barras ("bolinhas"). |
| **`CompositeCrossSection`** | **Seletor de Seção** | O quadrado interativo onde se clica para adicionar/remover barras. É o "mapa" da furação. |
| **`Detached Stirrup`** | **Estribo Avulso** | O desenho técnico isolado do estribo (embaixo da peça) mostrando geometria, cotas e totais. |

### Propriedades Técnicas (Atributos)
| Nome no Código | Significado | Exemplo |
| :--- | :--- | :--- |
| **`cutLength`** | **Comprimento de Corte** | Tamanho total da barra esticada ($C=...$). |
| **`placement`** | **Posicionamento** | Onde a barra está na peça: <br>- `top` (Negativo)<br>- `bottom` (Positivo)<br>- `distributed` (Pele/Costela) |
| **`stirrupModel`** | **Formato do Estribo** | O desenho geométrico: `rect`, `circle`, `triangle`, `pentagon`, `hexagon`. |
| **`pointIndices`** | **Furação / Pontos** | Índices exatos do grid onde existem barras (seleção do usuário). |

## 3. Padrão de Cores e Estilos (Design System)

Para manter a consistência visual "Top":

- **Traço Concreto/Borda:** `#0f172a` (Dark Slate), Espessura `2.0`.
- **Traço Estribo (Interno/Avulso):** `#0f172a`, Espessura `1.5` (Interno) / `2.5` (Avulso).
- **Barras Longitudinais (Bolhas):** Preenchimento `#0f172a`, Raio `3.5`.
- **Cotas e Textos:** `#0f172a`, Fonte `Inter/Sans`, Peso `Bold`.
