# Fitness Tracker

App pessoal de musculação + dieta. Local-first, roda no iPhone via Expo Go.

## Como rodar

1. **Node**: já está instalado em `~/.local/node`. O `PATH` foi adicionado ao seu `~/.bashrc`. Se uma sessão nova não enxergar `node`, rode `source ~/.bashrc`.

2. **Instalar Expo Go no iPhone**
   App Store → "Expo Go".

3. **Iniciar o dev server (no laptop)**
   ```bash
   npm start
   ```
   Vai abrir um QR code no terminal/navegador.

4. **No iPhone**
   Abrir o **Expo Go** → escanear o QR code (mesma rede Wi-Fi do laptop). O app carrega com hot reload.

> **Importante**: a primeira abertura demora — o Metro bundler compila tudo.

## Estrutura

```
app/                       # expo-router (file-based routes)
├── _layout.tsx            # stack root + telas modais
├── (tabs)/                # tab bar (Treino | Dieta | Settings)
│   ├── _layout.tsx
│   ├── index.tsx          # home: lista templates, começa sessão
│   ├── diet.tsx           # dia atual de dieta
│   └── settings.tsx
├── workout/
│   ├── session/[id].tsx   # sessão ativa de treino
│   └── exercise/[id].tsx  # histórico + gráfico
├── exercises/             # CRUD de exercícios
├── templates/             # CRUD de templates
├── foods/                 # CRUD de alimentos
├── meals/add.tsx          # adicionar entrada em refeição
└── targets.tsx            # metas diárias de macros

src/
├── db/
│   ├── schema.ts          # CREATE TABLE statements
│   ├── migrations.ts      # sistema de versionamento simples
│   ├── client.ts          # singleton de expo-sqlite
│   └── types.ts           # tipos das entidades
├── repositories/          # camada de acesso ao banco (1 arquivo por entidade)
├── components/            # UI: Button, Input, Card, MacroBar, etc
├── hooks/                 # useAsync
└── lib/
    ├── progression.ts     # 1RM, volume, sugestão de carga
    ├── macros.ts          # agregação de macros
    ├── format.ts          # formatação
    └── toast.ts           # Alert wrappers
```

## Princípios

- **Local-first**: tudo em SQLite no device. Sem backend, sem login, sem nuvem.
- **Camada de repositório**: nenhum componente faz SQL direto. Só `src/repositories/*`.
- **Tipagem estrita**: `strict: true` em `tsconfig.json`.
- **Sem over-engineering**: sem testes, sem CI, sem Redux. É um app pessoal.

## Comandos úteis

| Comando | O que faz |
|---|---|
| `npm start` | Inicia o Metro bundler |
| `npm run ios` | Mesma coisa, mas com hint pra iOS |
| `npm run typecheck` | Roda o TypeScript em modo "só checar" |

## Backup do banco

Settings → Exportar fitness.db. Abre a share sheet — manda pra iCloud/AirDrop/Mail.

## Fluxo de uso

1. **Treino > Biblioteca**: cadastre os exercícios que você faz.
2. **Treino > Templates**: monte os treinos (Push, Pull, Legs…).
3. **Treino**: tap "Começar" no template → registra séries → "Finalizar".
4. **Histórico**: tap "Histórico" em qualquer exercício pra ver progressão.
5. **Dieta > Alimentos**: cadastre seu cardápio (arroz, frango, whey, etc).
6. **Dieta**: tap "+ Adicionar" em cada refeição → busca alimento → quantidade.
7. **Settings**: ajuste incremento de progressão e metas de macros.

## Detalhes que valem saber (vindo de Python)

- **TypeScript**: como Python com type hints, mas o checker é estrito e roda em build.
- **JSX**: HTML-like dentro do código. `<View>` é como `<div>`; `<Text>` é como `<span>`.
- **Componentes**: funções que retornam JSX. Re-rodam quando o estado/props mudam.
- **Hooks** (`useState`, `useEffect`): "engatam" estado/efeitos no componente. `useState` = variável que dispara re-render quando muda. `useEffect` = "side-effect depois do render".
- **expo-router**: cada arquivo em `app/` vira uma rota. `[id]` no nome é um param dinâmico.
- **NativeWind**: classes Tailwind no atributo `className`. Em runtime são convertidas pra estilos nativos.
- **expo-sqlite**: API totalmente assíncrona. `await db.runAsync(...)` etc.

## Próximos passos (fora do escopo do MVP)

- Sincronização iCloud / backend
- Importar alimentos de uma API tipo Open Food Facts
- Notificações de treino
- Apple Health integration
- Build standalone via EAS pra instalar permanentemente
