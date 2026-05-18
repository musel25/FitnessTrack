# Fitness Tracker

App pessoal de musculação + dieta. Roda no iPhone via Expo Go.

## Como rodar

1. **Instalar Expo Go no iPhone**
   App Store → "Expo Go".

2. **Iniciar o dev server (no laptop)**

   ```bash
   npm start
   ```

   Vai abrir um QR code no terminal/navegador.

3. **No iPhone**
   Abrir o **Expo Go** → escanear o QR code (mesma rede Wi-Fi do laptop). O app carrega com hot reload.

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
