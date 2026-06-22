import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_NAME = process.env.MONGODB_DB_NAME ?? 'saloon-booking';

/** Ensures Atlas/local URIs always target the same database. */
export function resolveMongoUri(): string {
  let uri = process.env.MONGODB_URI ?? `mongodb://127.0.0.1:27017/${DB_NAME}`;

  // mongodb+srv://user:pass@host/  → append db name
  if (/^mongodb(\+srv)?:\/\/[^/]+\/?$/.test(uri)) {
    uri = `${uri.replace(/\/$/, '')}/${DB_NAME}`;
  }

  // mongodb+srv://user:pass@host  (no trailing slash)
  if (/^mongodb(\+srv)?:\/\/[^/?]+$/.test(uri)) {
    uri = `${uri}/${DB_NAME}`;
  }

  return uri;
}

export function getDatabaseName(): string {
  const uri = resolveMongoUri();
  const match = uri.match(/\/([^/?]+)(\?|$)/);
  return match?.[1] ?? DB_NAME;
}
