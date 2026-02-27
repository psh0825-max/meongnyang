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
    setTimeout(() => router.push('/'), 1000);
  };

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Decorative paws */}
      <span className="paw-trail">🐾</span>
      <span className="paw-trail">🐾</span>

      {/* Header */}
      <div className="app-header-alt" style={{ borderRadius: '0 0 32px 32px', paddingBottom: 44 }}>
        <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => router.back()} style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer',
            transition: 'all 0.2s',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900 }}>새 일기</h1>
            <p style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>사진 한 장이면 충분해요 📸</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-28" style={{ marginTop: -16, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!preview ? (
            <div className="animate-fade-in">
              {/* Upload zone */}
              <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                <div className="upload-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>사진을 올려주세요</p>
                <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5 }}>
                  우리 아이의 오늘 모습을 기록해요 ✨
                </p>
              </div>

              {/* Camera / Gallery buttons */}
              <div className="flex gap-3" style={{ marginTop: 16 }}>
                <button onClick={() => cameraRef.current?.click()} className="btn-secondary flex-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  📷 촬영
                </button>
                <button onClick={() => fileRef.current?.click()} className="btn-primary flex-1">
                  🖼️ 갤러리
                </button>
              </div>

              {/* Tips card */}
              <div className="card animate-fade-in-2" style={{ padding: 20, marginTop: 20 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>꿀팁</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { emoji: '🐕', text: '얼굴이 잘 보이는 사진이 좋아요' },
                    { emoji: '🎭', text: '재미있는 표정일수록 일기가 풍성해요' },
                    { emoji: '📍', text: '장소나 상황이 담긴 사진도 좋아요' },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-3" style={{ fontSize: 13, color: 'var(--text-mid)' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{tip.emoji}</span>
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Photo selected */
            <div className="diary-card animate-scale-in" style={{ marginTop: 8 }}>
              <div className="photo-container">
                <img src={preview} alt="" style={{ height: 260 }} />
                <div className="photo-date">
                  {new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                </div>
              </div>
              <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="flex items-center gap-2">
                  <span className="badge badge-mint">✓ 사진 선택됨</span>
                </div>
                <button onClick={() => { setPreview(null); setImageBase64(''); setDiary(''); setMoodTags([]); }}
                  className="btn-danger">
                  변경
                </button>
              </div>
            </div>
          )}

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          {/* Generate button */}
          {preview && !diary && !generating && (
            <button onClick={handleGenerate} className="btn-primary animate-fade-in" style={{ fontSize: 16 }}>
              <span style={{ fontSize: 20 }}>✨</span>
              AI 일기 생성하기
            </button>
          )}

          {/* Generating state */}
          {generating && (
            <div className="card animate-fade-in" style={{ padding: '44px 24px', textAlign: 'center' }}>
              <div className="animate-float" style={{ fontSize: 40, marginBottom: 16 }}>🐾</div>
              <div className="flex justify-center gap-2" style={{ marginBottom: 16 }}>
                {[0, 1, 2].map(i => <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>AI가 일기를 쓰고 있어요</p>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 6, lineHeight: 1.6 }}>
                사진을 분석하고 있어요...<br/>잠시만 기다려주세요 ✨
              </p>
            </div>
          )}

          {/* Generated diary */}
          {diary && (
            <div className="card animate-fade-in" style={{ padding: 22, overflow: 'visible' }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>AI가 쓴 일기</span>
                  <span className="badge badge-amber" style={{ marginLeft: 8 }}>✨ 자동생성</span>
                </div>
              </div>

              <div className="diary-content-box">
                <p className="diary-text" style={{ whiteSpace: 'pre-wrap', paddingLeft: 8 }}>{diary}</p>
              </div>

              {moodTags.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
                  {moodTags.map(tag => <span key={tag} className={`mood-tag ${moodClassMap[tag] || ''}`}>{tag}</span>)}
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                {!saved ? (
                  <button onClick={handleSave} className="btn-primary" style={{ fontSize: 16 }}>
                    <span style={{ fontSize: 18 }}>💾</span>
                    저장하기
                  </button>
                ) : (
                  <div className="save-confirm">
                    <div className="checkmark">✓</div>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint)' }}>저장 완료!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
