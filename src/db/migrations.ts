// Sistema simples de migrations baseado em `user_version` do SQLite.
//
// Como funciona:
// 1. Lemos `PRAGMA user_version` (default 0).
// 2. Pra cada migração não-aplicada, executamos e incrementamos.
// 3. Próxima vez que o app abrir, só corre migrações novas.
//
// Pra adicionar uma migração: empurre nova entrada em MIGRATIONS e bumpe a versão.

import type * as SQLite from "expo-sqlite";
import { SCHEMA_V1, SCHEMA_V1_SEED } from "./schema";

type Migration = {
  version: number;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(SCHEMA_V1);
      await db.execAsync(SCHEMA_V1_SEED);
    },
  },
];

export async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = result?.user_version ?? 0;

  for (const m of MIGRATIONS) {
    if (m.version > currentVersion) {
      console.log(`[db] applying migration v${m.version}`);
      await m.up(db);
      // user_version não aceita placeholder, então interpolamos diretamente.
      // É seguro pq m.version é literal no nosso código.
      await db.execAsync(`PRAGMA user_version = ${m.version}`);
    }
  }
}
