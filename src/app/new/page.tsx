'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveDiary, getPetProfile } from '@/lib/db';

export default function NewDiaryPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState('');
  const [mimeType, setMimeType] = useState('image/jpeg');
  const [generating, setGenerating] = useState(false);
  const [diary, setDiary] = useState('');
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const moodClassMap: Record<string, string> = {
    '#해피': 'mood-happy', '#졸림': 'mood-sleepy', '#배고픔': 'mood-hungry',
    '#신남': 'mood-excited', '#편안': 'mood-relaxed',
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      setImageBase64(result.split(',')[1]);
      setDiary(''); setMoodTags([]); setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64) return;
    const pet = getPetProfile();
    if (!pet.name) { alert('먼저 프로필에서 반려동물 정보를 등록해주세요!'); router.push('/profile'); return; }
    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, petName: pet.name, petType: pet.type }),
      });
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      setDiary(data.diary); setMoodTags(data.moodTags || []);
    } catch { alert('일기 생성에 실패했어요. 다시 시도해주세요.'); }
    finally { setGenerating(false); }
  };

  const handleSave = async () => {
    if (!diary || !preview) return;
    const pet = getPetProfile();
    await saveDiary({ id: crypto.randomUUID(), imageData: preview, diary, moodTags, createdAt: new Date().toISOString(), petName: pet.name, petType: pet.type });
    setSaved(true);
    setTimeout(() => router.push('/'), 800);
  };

  return (
    <div className="min-h-screen">
      <div className="app-header-alt" style={{ borderRadius: '0 0 28px 28px' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', color: 'white', cursor: 'pointer' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800 }}>새 일기</h1>
            <p style={{ fontSize: 12, opacity: 0.7 }}>사진 한 장이면 충분해요</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 pb-24 space-y-5">
        {!preview ? (
          <div className="animate-fade-in">
            <div className="upload-zone" onClick={() => fileRef.current?.click()}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C4C0BB" strokeWidth="1.5" strokeLinecap="round" style={{ margin: '0 auto 16px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>사진을 올려주세요</p>
              <p style={{ fontSize: 13, color: 'var(--text-light)' }}>우리 아이의 오늘 모습을 기록해요</p>
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={() => cameraRef.current?.click()} className="btn-secondary flex-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                촬영
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-primary flex-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                갤러리
              </button>
            </div>
          </div>
        ) : (
          <div className="diary-card animate-scale-in">
            <div className="photo-container">
              <img src={preview} alt="" style={{ height: 240 }} />
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-light)' }}>사진이 선택되었어요</span>
              <button onClick={() => { setPreview(null); setImageBase64(''); setDiary(''); setMoodTags([]); }}
                style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>변경</button>
            </div>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        {preview && !diary && !generating && (
          <button onClick={handleGenerate} className="btn-primary animate-fade-in">
            AI 일기 생성하기
          </button>
        )}

        {generating && (
          <div className="card animate-fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2].map(i => <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>AI가 일기를 쓰고 있어요</p>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>잠시만 기다려주세요</p>
          </div>
        )}

        {diary && (
          <div className="card animate-fade-in" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--warm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700 }}>AI가 쓴 일기</span>
            </div>
            <div style={{ background: 'var(--warm)', borderRadius: 16, padding: 20 }}>
              <p className="diary-text" style={{ whiteSpace: 'pre-wrap' }}>{diary}</p>
            </div>
            {moodTags.length > 0 && (
              <div className="flex flex-wrap gap-2" style={{ marginTop: 14 }}>
                {moodTags.map(tag => <span key={tag} className={`mood-tag ${moodClassMap[tag] || ''}`}>{tag}</span>)}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              {!saved ? (
                <button onClick={handleSave} className="btn-primary">저장하기</button>
              ) : (
                <div className="text-center animate-scale-in" style={{ padding: 12 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>✓ 저장 완료</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
