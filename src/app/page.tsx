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

export default function HomePage() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

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

  return (
    <div className="min-h-screen">
      {/* Splash */}
      <div className={`splash-overlay ${!showSplash ? 'hide' : ''}`}>
        <div className="splash-photos">
          {splashPhotos.map((src, i) => (
            <img key={i} src={src} alt="" className="splash-photo" />
          ))}
        </div>
        <div className="splash-logo text-center">
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#2D2A26', letterSpacing: '-0.02em' }}>멍냥로그</h1>
        </div>
        <p className="splash-tagline" style={{ fontSize: 14, color: '#8A8580', marginTop: 8 }}>AI가 써주는 우리 아이 일기</p>
      </div>

      {/* Header */}
      <div className="app-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>멍냥로그</h1>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>
              {diaries.length > 0 ? `${diaries.length}개의 일기` : 'AI가 써주는 우리 아이 일기'}
            </p>
          </div>
          {diaries.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {diaries.slice(0, 3).map((d, i) => (
                <img key={d.id} src={d.imageData} alt="" style={{
                  width: 36, height: 36, borderRadius: 12, objectFit: 'cover',
                  border: '2px solid white', marginLeft: i > 0 ? -8 : 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        ) : diaries.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="empty-visual animate-breathe">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C4C0BB" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>아직 일기가 없어요</h3>
            <p style={{ fontSize: 14, color: 'var(--text-light)', lineHeight: 1.6, marginBottom: 24 }}>
              반려동물 사진을 올리면<br/>AI가 일기를 써드려요
            </p>
            <a href="/new" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '14px 32px' }}>
              첫 일기 쓰기
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
            {diaries.map((entry, i) => (
              <div key={entry.id} className="diary-card animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="photo-container">
                  <img src={entry.imageData} alt="" />
                  <div className="photo-date">
                    {new Date(entry.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                  </div>
                  <div className="photo-pet">{entry.petName}</div>
                </div>
                <div style={{ padding: '16px 20px 20px' }}>
                  <p className="diary-text" style={{ whiteSpace: 'pre-wrap' }}>{entry.diary}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {entry.moodTags.map((tag) => (
                        <span key={tag} className={`mood-tag ${moodMap[tag] || ''}`}>{tag}</span>
                      ))}
                    </div>
                    <button onClick={() => handleDelete(entry.id)}
                      style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: 'none', color: '#D4D0CB', cursor: 'pointer', fontSize: 16, transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#E57373')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#D4D0CB')}>
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
