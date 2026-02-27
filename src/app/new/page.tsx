'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveDiary, getPetProfile, detectHealthAlerts } from '@/lib/db';

interface ImageItem {
  preview: string;
  base64: string;
  mimeType: string;
}

export default function NewDiaryPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [diary, setDiary] = useState('');
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const moodClassMap: Record<string, string> = {
    '#해피': 'mood-happy', '#졸림': 'mood-sleepy', '#배고픔': 'mood-hungry',
    '#신남': 'mood-excited', '#편안': 'mood-relaxed',
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, isExtra = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isExtra && images.length >= 4) return;
    if (isExtra && images.length >= 4) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const newImg: ImageItem = { preview: result, base64: result.split(',')[1], mimeType: file.type };
      if (isExtra) {
        setImages(prev => [...prev, newImg]);
      } else {
        setImages([newImg]);
        setDiary(''); setMoodTags([]); setHealthAlerts([]); setSaved(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    if (idx === 0) { setDiary(''); setMoodTags([]); setHealthAlerts([]); }
  };

  const handleGenerate = async () => {
    if (images.length === 0) return;
    const pet = getPetProfile();
    if (!pet.name) { alert('먼저 프로필에서 반려동물 정보를 등록해주세요!'); router.push('/profile'); return; }
    setGenerating(true);
    try {
      const extraImages = images.slice(1).map(img => ({ base64: img.base64, mimeType: img.mimeType }));
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: images[0].base64,
          mimeType: images[0].mimeType,
          extraImages,
          petName: pet.name,
          petType: pet.type,
          personality: pet.personality,
          gender: pet.gender,
        }),
      });
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      setDiary(data.diary); setMoodTags(data.moodTags || []);
      const alerts = detectHealthAlerts(data.diary);
      setHealthAlerts(alerts);
    } catch { alert('일기 생성에 실패했어요. 다시 시도해주세요.'); }
    finally { setGenerating(false); }
  };

  const handleSave = async () => {
    if (!diary || images.length === 0) return;
    const pet = getPetProfile();
    const extraImgs = images.slice(1).map(img => img.preview);
    await saveDiary({
      id: crypto.randomUUID(),
      imageData: images[0].preview,
      extraImages: extraImgs.length > 0 ? extraImgs : undefined,
      diary, moodTags,
      healthAlerts: healthAlerts.length > 0 ? healthAlerts : undefined,
      createdAt: new Date().toISOString(),
      petName: pet.name, petType: pet.type,
    });
    setSaved(true);
    setTimeout(() => router.push('/'), 1000);
  };

  return (
    <div style={{ position: 'relative' }}>
      <span className="paw-trail">🐾</span>
      <span className="paw-trail">🐾</span>

      <div className="app-header-alt" style={{ borderRadius: '0 0 32px 32px', paddingBottom: 44 }}>
        <div className="flex items-center gap-3" style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => router.back()} style={{
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900 }}>새 일기</h1>
            <p style={{ fontSize: 12, opacity: 0.8, fontWeight: 500 }}>최대 4장까지 올릴 수 있어요 📸</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28" style={{ marginTop: -16, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {images.length === 0 ? (
            <div className="animate-fade-in">
              <div className="upload-zone" onClick={() => fileRef.current?.click()}>
                <img src="/illust-hero2.png" alt="" style={{ width: 140, height: 140, borderRadius: 28, margin: '0 auto 16px', objectFit: 'cover' }} />
                <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>사진을 올려주세요</p>
                <p style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.5 }}>
                  우리 아이의 오늘 모습을 기록해요 ✨
                </p>
              </div>
              <div className="flex gap-3" style={{ marginTop: 16 }}>
                <button onClick={() => cameraRef.current?.click()} className="btn-secondary flex-1">📷 촬영</button>
                <button onClick={() => fileRef.current?.click()} className="btn-primary flex-1">🖼️ 갤러리</button>
              </div>
              <div className="card animate-fade-in-2" style={{ padding: 20, marginTop: 20 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                  <span style={{ fontSize: 16 }}>💡</span>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>꿀팁</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { emoji: '🐕', text: '얼굴이 잘 보이는 사진이 좋아요' },
                    { emoji: '📸', text: '여러 장 올리면 더 풍성한 일기가 돼요' },
                    { emoji: '🎭', text: '프로필에서 성격을 설정하면 말투가 바뀌어요!' },
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
            <>
              {/* Photo grid */}
              <div className="diary-card animate-scale-in" style={{ marginTop: 8 }}>
                <div className="photo-container">
                  <img src={images[0].preview} alt="" />
                  <div className="photo-date">
                    {new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </div>
                </div>

                {/* Extra photos */}
                {images.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto' }}>
                    {images.slice(1).map((img, i) => (
                      <div key={i} style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={img.preview} alt="" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover' }} />
                        <button onClick={() => removeImage(i + 1)} style={{
                          position: 'absolute', top: -6, right: -6,
                          width: 20, height: 20, borderRadius: 10,
                          background: '#EF4444', color: 'white', border: 'none',
                          fontSize: 11, fontWeight: 900, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-mint">✓ {images.length}장 선택됨</span>
                    {images.length < 4 && (
                      <button onClick={() => extraRef.current?.click()} className="badge badge-amber" style={{ cursor: 'pointer', border: 'none' }}>
                        + 추가
                      </button>
                    )}
                  </div>
                  <button onClick={() => { setImages([]); setDiary(''); setMoodTags([]); setHealthAlerts([]); }}
                    className="btn-danger">초기화</button>
                </div>
              </div>
            </>
          )}

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={e => handleFile(e)} className="hidden" />
          <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e)} className="hidden" />
          <input ref={extraRef} type="file" accept="image/*" onChange={e => handleFile(e, true)} className="hidden" />

          {images.length > 0 && !diary && !generating && (
            <button onClick={handleGenerate} className="btn-primary animate-fade-in" style={{ fontSize: 16 }}>
              ✨ AI 일기 생성하기 {images.length > 1 ? `(${images.length}장 분석)` : ''}
            </button>
          )}

          {generating && (
            <div className="card animate-fade-in" style={{ padding: '44px 24px', textAlign: 'center' }}>
              <div className="animate-float" style={{ marginBottom: 16 }}>
                <img src="/illust-loading.png" alt="" style={{ width: 140, height: 140, borderRadius: 24, margin: '0 auto', objectFit: 'cover' }} />
              </div>
              <div className="flex justify-center gap-2" style={{ marginBottom: 16 }}>
                {[0, 1, 2].map(i => <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>AI가 일기를 쓰고 있어요</p>
              <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 6, lineHeight: 1.6 }}>
                {images.length > 1 ? `${images.length}장의 사진을 분석하고 있어요...` : '사진을 분석하고 있어요...'}
              </p>
            </div>
          )}

          {diary && (
            <div className="card animate-fade-in" style={{ padding: 22 }}>
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
                <p className="diary-text" style={{ whiteSpace: 'pre-wrap' }}>{diary}</p>
              </div>

              {moodTags.length > 0 && (
                <div className="flex flex-wrap gap-2" style={{ marginTop: 16 }}>
                  {moodTags.map(tag => <span key={tag} className={`mood-tag ${moodClassMap[tag] || ''}`}>{tag}</span>)}
                </div>
              )}

              {/* Health Alert */}
              {healthAlerts.length > 0 && (
                <div style={{
                  marginTop: 16, padding: 16, borderRadius: 16,
                  background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                  border: '1px solid #FECACA',
                }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>건강 알림</span>
                  </div>
                  {healthAlerts.map((alert, i) => (
                    <p key={i} style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.6, marginBottom: 4 }}>
                      · {alert}
                    </p>
                  ))}
                  <p style={{ fontSize: 11, color: '#B91C1C', marginTop: 8, opacity: 0.8 }}>
                    💡 증상이 지속되면 가까운 동물병원을 방문해주세요
                  </p>
                </div>
              )}

              <div style={{ marginTop: 20 }}>
                {!saved ? (
                  <button onClick={handleSave} className="btn-primary" style={{ fontSize: 16 }}>💾 저장하기</button>
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
