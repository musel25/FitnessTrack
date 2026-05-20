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

> O Expo Go precisa estar na mesma SDK do projeto (hoje **SDK 54**). Se der
> "incompatible with this version of Expo Go", atualize o app Expo Go.

## Build / Deployment (app standalone)

O Expo Go serve só pra desenvolvimento. Pra ter o app instalado de verdade no
celular — ícone na home, sem Expo Go, funciona offline — é preciso gerar um
**build**. Os perfis de build ficam em `eas.json`.

### Opção A — EAS Build (na nuvem, funciona em Linux/Windows/Mac)

```bash
npm install -g eas-cli
eas login        # conta Expo gratuita (expo.dev)
eas init         # vincula o repo e grava o projectId no app.json
```

**Android** (mais simples — sem conta paga, sem custo):

```bash
eas build --platform android --profile preview
```

Gera um `.apk`. Ao terminar, o EAS mostra um link/QR — abra no Android e instale.

**iOS**:

```bash
eas device:create   # registra o iPhone (abre um QR — escaneie no aparelho)
eas build --platform ios --profile preview
```

Precisa de uma conta Apple. Com **Apple ID grátis** o build expira em 7 dias;
com a **Apple Developer Program** ($99/ano) dura ~1 ano — ou use `eas submit`
para distribuir via TestFlight.

### Opção B — Build local no Mac (só macOS + Xcode)

Quem tem Mac pode compilar o iOS localmente, sem a nuvem:

```bash
npx expo run:ios            # roda no Simulador do iOS
npx expo run:ios --device   # instala num iPhone conectado via cabo
```

Requer **Xcode** instalado e uma conta Apple configurada em
Xcode → Settings → Accounts. O primeiro build instala os CocoaPods e demora.

Para Android local (Mac ou Linux) é preciso o **Android Studio**:

```bash
npx expo run:android
```

### Perfis do `eas.json`

| Perfil | Pra que serve |
|--------|---------------|
| `development` | dev client — precisa do Metro rodando |
| `preview` | app standalone pra testar (iOS: distribuição interna · Android: `.apk`) |
| `production` | build final para a loja (App Store / Play Store) |

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
