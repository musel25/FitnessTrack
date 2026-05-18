// Cliente SQLite singleton.
//
// expo-sqlite v15+ tem uma API moderna baseada em Promises.
// `openDatabaseSync` abre (ou cria) o arquivo no diretório de documentos do app.
// O arquivo persiste entre restarts — é o filesystem do iPhone, isolado por app.
//
// Padrão: chame `getDB()` em qualquer lugar — primeira chamada inicializa, demais reusam.

import * as SQLite from "expo-sqlite";
import { runMigrations } from "./migrations";

const DB_NAME = "fitness.db";

let _db: SQLite.SQLiteDatabase | null = null;
let _ready: Promise<SQLite.SQLiteDatabase> | null = null;

// Conexão preguiçosa (lazy). Inicializa ao primeiro uso.
// `useDB()` aguarda essa promise antes de renderizar conteúdo dependente.
export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  if (_ready) return _ready;

  _ready = (async () => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    // PRAGMAs importantes:
    // - foreign_keys: ativa as FK ON DELETE CASCADE. SQLite vem desligado por padrão.
    // - journal_mode = WAL: melhor performance pra escrita concorrente.
    await db.execAsync(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
    `);
    await runMigrations(db);
    _db = db;
    return db;
  })();

  return _ready;
}

// Útil pra testes / botão "reset" hipotético. Não chamamos em produção.
export async function _resetDBForDev(): Promise<void> {
  if (_db) {
    await _db.closeAsync();
    _db = null;
    _ready = null;
  }
  await SQLite.deleteDatabaseAsync(DB_NAME);
}

// Caminho absoluto do arquivo .db — usamos pra exportar via share sheet.
export function getDBFileUri(): string {
  // expo-sqlite armazena em FileSystem.documentDirectory + 'SQLite/' + DB_NAME
  // Importamos preguiçosamente pra não inflar bundle se ngm exportar.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const FileSystem = require("expo-file-system");
  return `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;
}
