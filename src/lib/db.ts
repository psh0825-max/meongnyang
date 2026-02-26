import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface DiaryEntry {
  id: string;
  imageData: string; // base64
  diary: string;
  moodTags: string[];
  createdAt: string;
  petName: string;
  petType: string;
}

export interface PetProfile {
  name: string;
  type: string; // 강아지, 고양이, 기타
  birthday: string;
}

interface MeongNyangDB extends DBSchema {
  diaries: {
    key: string;
    value: DiaryEntry;
    indexes: { 'by-date': string };
  };
}

let dbPromise: Promise<IDBPDatabase<MeongNyangDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MeongNyangDB>('meongnyang', 1, {
      upgrade(db) {
        const store = db.createObjectStore('diaries', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function saveDiary(entry: DiaryEntry): Promise<void> {
  const db = await getDB();
  await db.put('diaries', entry);
}

export async function getAllDiaries(): Promise<DiaryEntry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('diaries', 'by-date');
  return all.reverse();
}

export async function deleteDiary(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('diaries', id);
}

export function getPetProfile(): PetProfile {
  if (typeof window === 'undefined') return { name: '', type: '', birthday: '' };
  const raw = localStorage.getItem('petProfile');
  if (raw) return JSON.parse(raw);
  return { name: '', type: '', birthday: '' };
}

export function savePetProfile(profile: PetProfile): void {
  localStorage.setItem('petProfile', JSON.stringify(profile));
}
