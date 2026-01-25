import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'ritual-db';
const DB_VERSION = 1;

export interface OfflineMutation {
    id: string;
    type: 'CREATE_HABIT' | 'UPDATE_HABIT' | 'DELETE_HABIT' | 'LOG_HABIT';
    data: any;
    timestamp: number;
}

export async function initDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Habits store
            if (!db.objectStoreNames.contains('habits')) {
                db.createObjectStore('habits', { keyPath: 'id' });
            }
            // Logs store
            if (!db.objectStoreNames.contains('logs')) {
                const logStore = db.createObjectStore('logs', { keyPath: 'id' });
                logStore.createIndex('by-habit-date', ['habitId', 'date'], { unique: true });
            }
            // Mutation Queue for sync
            if (!db.objectStoreNames.contains('mutations')) {
                db.createObjectStore('mutations', { keyPath: 'id' });
            }
        },
    });
}

export async function saveHabitLocally(habit: any) {
    const db = await initDB();
    await db.put('habits', habit);
}

export async function saveLogLocally(log: any) {
    const db = await initDB();
    await db.put('logs', log);
}

export async function queueMutation(mutation: Omit<OfflineMutation, 'id' | 'timestamp'>) {
    const db = await initDB();
    const id = crypto.randomUUID();
    const entry: OfflineMutation = {
        ...mutation,
        id,
        timestamp: Date.now(),
    };
    await db.add('mutations', entry);
}

export async function getPendingMutations(): Promise<OfflineMutation[]> {
    const db = await initDB();
    return db.getAll('mutations');
}

export async function clearMutation(id: string) {
    const db = await initDB();
    await db.delete('mutations', id);
}
