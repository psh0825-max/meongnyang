import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface DiaryEntry {
  id: string;
  imageData: string; // base64 (primary photo)
  extraImages?: string[]; // additional photos (base64)
  diary: string;
  moodTags: string[];
  healthAlerts?: string[]; // detected health keywords
  createdAt: string;
  petName: string;
  petType: string;
}

export interface PetProfile {
  name: string;
  type: string;
  birthday: string;
  personality?: string;
  gender?: string;
  photo?: string; // base64 data URL
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
    dbPromise = openDB<MeongNyangDB>('meongnyang', 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore('diaries', { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
        }
        // v2: no schema change needed, just new fields on objects
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
  if (typeof window === 'undefined') return { name: '', type: '', birthday: '', personality: '', gender: '', photo: '' };
  const raw = localStorage.getItem('petProfile');
  if (raw) return JSON.parse(raw);
  return { name: '', type: '', birthday: '', personality: '', gender: '', photo: '' };
}

export function savePetProfile(profile: PetProfile): void {
  localStorage.setItem('petProfile', JSON.stringify(profile));
}

// Health keywords detection
const HEALTH_KEYWORDS = [
  { keyword: '절뚝', alert: '다리를 절뚝거리는 모습이 보여요' },
  { keyword: '구토', alert: '구토 증상이 관찰돼요' },
  { keyword: '설사', alert: '설사 증상이 있어요' },
  { keyword: '식욕', alert: '식욕에 변화가 있어요' },
  { keyword: '안 먹', alert: '밥을 잘 안 먹는 것 같아요' },
  { keyword: '기침', alert: '기침을 해요' },
  { keyword: '재채기', alert: '재채기를 자주 해요' },
  { keyword: '긁', alert: '몸을 자주 긁어요' },
  { keyword: '피', alert: '출혈이 관찰돼요' },
  { keyword: '종기', alert: '피부에 이상이 있어요' },
  { keyword: '눈물', alert: '눈물이 많아요' },
  { keyword: '콧물', alert: '콧물이 나와요' },
  { keyword: '힘없', alert: '기운이 없어 보여요' },
  { keyword: '아프', alert: '아파 보이는 모습이에요' },
  { keyword: '축 처', alert: '축 처져 있어요' },
  { keyword: '떨', alert: '몸을 떨고 있어요' },
];

export function detectHealthAlerts(diaryText: string): string[] {
  return HEALTH_KEYWORDS
    .filter(h => diaryText.includes(h.keyword))
    .map(h => h.alert);
}

// Mood trend analysis
export function getMoodTrend(diaries: DiaryEntry[]): Record<string, number> {
  const counts: Record<string, number> = {};
  diaries.forEach(d => {
    d.moodTags.forEach(tag => {
      counts[tag] = (counts[tag] || 0) + 1;
    });
  });
  return counts;
}

export function getWeeklyDiaries(diaries: DiaryEntry[]): DiaryEntry[] {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  return diaries.filter(d => new Date(d.createdAt) >= weekAgo);
}
