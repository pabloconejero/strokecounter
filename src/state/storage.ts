import type { Round, StorageShape } from './types';

const KEY_IN_PROGRESS = 'strokeCounter:inProgress';
const KEY_HISTORY = 'strokeCounter:history';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadStorage(): StorageShape {
  return {
    inProgress: readJSON<Round | null>(KEY_IN_PROGRESS, null),
    history: readJSON<Round[]>(KEY_HISTORY, []),
  };
}

export function saveInProgress(round: Round | null): void {
  try {
    if (round === null) {
      localStorage.removeItem(KEY_IN_PROGRESS);
    } else {
      localStorage.setItem(KEY_IN_PROGRESS, JSON.stringify(round));
    }
  } catch {
    /* ignore quota / disabled storage */
  }
}

export function appendHistory(round: Round): Round[] {
  const history = readJSON<Round[]>(KEY_HISTORY, []);
  const next = [round, ...history];
  try {
    localStorage.setItem(KEY_HISTORY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function clearInProgress(): void {
  saveInProgress(null);
}
