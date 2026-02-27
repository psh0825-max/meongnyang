'use client';

import { useEffect, useState } from 'react';
import { getAllDiaries, deleteDiary, type DiaryEntry } from '@/lib/db';

const moodMap: Record<string, string> = {
  '#해피': 'mood-happy', '#졸림': 'mood-sleepy', '#배고픔': 'mood-hungry',
  '#신남': 'mood-excited', '#편안': 'mood-relaxed',
};

const splashPhotos = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200&h=200&fit=crop',
];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return { text: '좋은 밤이에요', emoji: '🌙' };
  if (h < 12) return { text: '좋은 아침이에요', emoji: '☀️' };
  if (h < 18) return { text: '좋은 오후에요', emoji: '🌤️' };
  return { text: '좋은 저녁이에요', emoji: '🌅' };
};

const getStreakDays = (diaries: DiaryEntry[]) => {
  if (diaries.length === 0) return 0;
  const dates = [...new Set(diaries.map(d => new Date(d.createdAt).toDateString()))];
  let streak = 1;
  const today = new Date();
  const sorted = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  if (today.toDateString() !== sorted[0].toDateString()) {
    const diff = (today.getTime() - sorted[0].getTime()) / 86400000;
    if (diff > 1.5) return 0;
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = (sorted[i].getTime() - sorted[i + 1].getTime()) / 86400000;
    if (diff <= 1.5) streak++;
    else break;
  }
  return streak;
};

export default function HomePage() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const greeting = getGreeting();

  useEffect(() => {
    const seen = sessionStorage.getItem('splash_seen');
    if (seen) setShowSplash(false);
    else {
      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('splash_seen', '1');
      }, 2200);
    }
    getAllDiaries().then((d) => { setDiaries(d); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('이 일기를 삭제할까요?')) return;
    await deleteDiary(id);
    setDiaries((prev) => prev.filter((d) => d.id !== id));
  };

  const streak = getStreakDays(diaries);
  const uniquePets = [...new Set(diaries.map(d => d.petName))].filter(Boolean);
  const totalMoods = diaries.reduce((acc, d) => acc + (d.moodTags?.length || 0), 0);

  return (
    <div className="min-h-screen" style={{ position: 'relative' }}>
      {/* Decorative paw trails */}
      <span className="paw-trail">🐾</span>
      <span className="paw-trail">🐾</span>
      <span className="paw-trail">🐾</span>

      {/* Splash */}
      <div className={`splash-overlay ${!showSplash ? 'hide' : ''}`}>
        <div style={{ marginBottom: 32 }}>
          <img src="/illust-hero2.png" alt="" className="animate-scale-in" style={{ width: 200, height: 200, borderRadius: 40, objectFit: 'cover', boxShadow: '0 12px 40px rgba(0,0,0,0.1)', border: '4px solid white' }} />
        </div>
        <div className="splash-logo text-center">
          <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em' }}>멍냥로그</h1>
        </div>
        <p className="splash-tagline" style={{ fontSize: 14, color: '#8A8580', marginTop: 10 }}>
          AI가 써주는 우리 아이 일기 🐾
        </p>
      </div>

      {/* Header */}
      <div className="app-header">
        <div className="flex items-center justify-between" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <span className="badge badge-amber">{greeting.emoji} {greeting.text}</span>
            </div>
            <h1 className="gradient-text" style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em' }}>멍냥로그</h1>
            <p style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 4, fontWeight: 500 }}>
              {diaries.length > 0 ? `${diaries.length}개의 소중한 일기` : 'AI가 써주는 우리 아이 일기'}
            </p>
          </div>
          {diaries.length > 0 && (
            <div className="avatar-stack">
              {diaries.slice(0, 3).map((d) => (
                <img key={d.id} src={d.imageData} alt={d.petName} />
              ))}
            </div>
          )}
        </div>

        {/* Stats bar */}
        {diaries.length > 0 && (
          <div className="grid grid-cols-3 gap-3" style={{ marginTop: 20, position: 'relative', zIndex: 1 }}>
            <div className="stat-card animate-fade-in">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>📝</div>
              <div className="stat-number">{diaries.length}</div>
              <div className="stat-label">일기</div>
            </div>
            <div className="stat-card animate-fade-in-1">
              <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.1)' }}>🔥</div>
              <div className="stat-number">{streak}</div>
              <div className="stat-label">연속</div>
            </div>
            <div className="stat-card animate-fade-in-2">
              <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
                {uniquePets.length > 1 ? '🐾' : (diaries[0]?.petType === 'cat' ? '🐱' : '🐶')}
              </div>
              <div className="stat-number">{uniquePets.length || totalMoods}</div>
              <div className="stat-label">{uniquePets.length > 0 ? '반려동물' : '감정'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-28" style={{ position: 'relative', zIndex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
            {[0, 1].map(i => (
              <div key={i} className="loading-skeleton" style={{ height: 320, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        ) : diaries.length === 0 ? (
          <div className="empty-state animate-fade-in" style={{ paddingTop: 32 }}>
            <div className="animate-float" style={{ marginBottom: 24 }}>
              <img src="/illust-empty.png" alt="" style={{ width: 180, height: 180, borderRadius: 32, margin: '0 auto', objectFit: 'cover' }} />
            </div>
            <h3 className="gradient-text" style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
              아직 일기가 없어요
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.7, marginBottom: 28 }}>
              반려동물 사진을 올리면<br/>AI가 귀여운 일기를 써드려요 ✨
            </p>
            <a href="/new" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '16px 40px', borderRadius: 20 }}>
              <span style={{ fontSize: 18 }}>📸</span>
              첫 일기 쓰기
            </a>
          </div>
        ) : (
          <>
            {/* Section title */}
            <div className="flex items-center justify-between" style={{ marginTop: 20, marginBottom: 16 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 18 }}>📖</span>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>최근 일기</h2>
              </div>
              <span className="badge badge-pink">{diaries.length}개</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {diaries.map((entry, i) => (
                <div key={entry.id} className="diary-card animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  {/* Photo */}
                  <div className="photo-container">
                    <img src={entry.imageData} alt={entry.petName} />
                    <div className="photo-date">
                      {new Date(entry.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                    </div>
                    <div className="photo-pet">
                      {entry.petType === 'cat' ? '🐱' : entry.petType === 'dog' ? '🐶' : '🐾'} {entry.petName}
                    </div>
                  </div>

                  {/* Diary content */}
                  <div style={{ padding: '18px 22px 22px' }}>
                    <div className="diary-content-box">
                      <p className="diary-text" style={{ whiteSpace: 'pre-wrap', paddingLeft: 8 }}>{entry.diary}</p>
                    </div>

                    {/* Mood tags + delete */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {entry.moodTags.map((tag) => (
                          <span key={tag} className={`mood-tag ${moodMap[tag] || ''}`}>{tag}</span>
                        ))}
                      </div>
                      <button onClick={() => handleDelete(entry.id)} className="delete-btn" aria-label="삭제">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
