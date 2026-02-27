'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDiaries, deleteDiary, getPetProfile, getWeeklyDiaries, getMoodTrend, type DiaryEntry } from '@/lib/db';

const moodMap: Record<string, string> = {
  '#해피': 'mood-happy', '#졸림': 'mood-sleepy', '#배고픔': 'mood-hungry',
  '#신남': 'mood-excited', '#편안': 'mood-relaxed',
};

const moodEmojis: Record<string, string> = {
  '#해피': '😊', '#졸림': '😴', '#배고픔': '🍖', '#신남': '🎉',
  '#편안': '☺️', '#궁금': '🧐', '#외로움': '🥺', '#장난꾸러기': '😝',
};

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

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ko-KR', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
};

// Lazy image component
function LazyImage({ src, alt, className, style }: {
  src: string; alt: string; className?: string;
  style?: React.CSSProperties;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.src = src;
          obs.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      alt={alt}
      className={`lazy-img ${loaded ? 'loaded' : ''} ${className || ''}`}
      style={style}
      onLoad={() => setLoaded(true)}
    />
  );
}

// Gradient avatar component
function GradientAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="gradient-avatar" style={{
      width: size, height: size, fontSize: size * 0.4,
    }}>
      {letter}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPet, setFilterPet] = useState('');
  const [filterMood, setFilterMood] = useState('');

  const greeting = getGreeting();

  useEffect(() => {
    const seen = sessionStorage.getItem('splash_seen');
    if (seen) setShowSplash(false);
    else {
      setTimeout(() => { setShowSplash(false); sessionStorage.setItem('splash_seen', '1'); }, 2400);
    }
    getAllDiaries().then((d) => { setDiaries(d); setLoading(false); });
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('이 일기를 삭제할까요?')) return;
    await deleteDiary(id);
    setDiaries((prev) => prev.filter((d) => d.id !== id));
  };

  const streak = getStreakDays(diaries);
  const uniquePets = [...new Set(diaries.map(d => d.petName))].filter(Boolean);
  const petProfile = getPetProfile();

  // Weekly emotion stats
  const weeklyDiaries = getWeeklyDiaries(diaries);
  const weeklyMoods = getMoodTrend(weeklyDiaries);
  const sortedWeeklyMoods = Object.entries(weeklyMoods).sort((a, b) => b[1] - a[1]);
  const topMood = sortedWeeklyMoods.length > 0 ? sortedWeeklyMoods[0] : null;
  const maxMoodCount = topMood ? topMood[1] : 0;

  // All mood tags for filter
  const allMoodTags = [...new Set(diaries.flatMap(d => d.moodTags))];

  // Filter diaries
  const filteredDiaries = diaries.filter(d => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!d.diary.toLowerCase().includes(q) && !d.petName.toLowerCase().includes(q)) return false;
    }
    if (filterPet && d.petName !== filterPet) return false;
    if (filterMood && !d.moodTags.includes(filterMood)) return false;
    return true;
  });

  return (
    <>
      {/* ── Splash ── */}
      <div className={`splash-overlay ${!showSplash ? 'hide' : ''}`}>
        <img src="/illust-hero2.png" alt="" className="animate-scale-in"
          style={{ width: 180, height: 180, borderRadius: 36, objectFit: 'cover', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', border: '4px solid white', marginBottom: 28 }} />
        <h1 className="gradient-text animate-fade-in" style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em' }}>멍냥로그</h1>
        <p className="animate-fade-in-1" style={{ fontSize: 14, color: '#9A9590', marginTop: 8, fontWeight: 500 }}>AI가 써주는 우리 아이 일기 🐾</p>
      </div>

      {/* ── Header ── */}
      <div className="app-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="badge badge-amber" style={{ marginBottom: 8, display: 'inline-flex' }}>{greeting.emoji} {greeting.text}</span>
              <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em' }}>멍냥로그</h1>
              <p style={{ fontSize: 13, color: '#8A7E74', marginTop: 4, fontWeight: 500 }}>
                {diaries.length > 0 ? `${diaries.length}개의 소중한 일기` : 'AI가 써주는 우리 아이 일기'}
              </p>
            </div>
            {petProfile.photo ? (
              <img src={petProfile.photo} alt={petProfile.name} style={{
                width: 56, height: 56, borderRadius: '50%', objectFit: 'cover',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)', border: '3px solid white',
              }} />
            ) : petProfile.name ? (
              <GradientAvatar name={petProfile.name} size={56} />
            ) : diaries.length > 0 ? (
              <div className="avatar-stack">
                {diaries.slice(0, 3).map((d) => (
                  <img key={d.id} src={d.imageData} alt={d.petName} />
                ))}
              </div>
            ) : (
              <img src="/illust-icon.png" alt="" style={{ width: 56, height: 56, borderRadius: 18, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} />
            )}
          </div>

          {/* Stats */}
          {diaries.length > 0 && (
            <div className="grid grid-cols-3 gap-3" style={{ marginTop: 20 }}>
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
                <div className="stat-number">{uniquePets.length}</div>
                <div className="stat-label">반려동물</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 pb-6">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
            {[0, 1].map(i => (
              <div key={i} className="loading-skeleton" style={{ height: 300, animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        ) : diaries.length === 0 ? (
          <div className="empty-state animate-fade-in" style={{ paddingTop: 36 }}>
            <div className="animate-float" style={{ marginBottom: 24 }}>
              <img src="/illust-empty.png" alt="" style={{ width: 200, height: 200, borderRadius: 36, margin: '0 auto', objectFit: 'cover', boxShadow: '0 8px 32px rgba(245,158,11,0.1)' }} />
            </div>
            <h3 className="gradient-text" style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>아직 일기가 없어요</h3>
            <p style={{ fontSize: 14, color: '#A39888', lineHeight: 1.8, marginBottom: 28 }}>
              반려동물 사진을 올리면<br/>AI가 귀여운 일기를 써드려요 ✨
            </p>
            <a href="/new" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', padding: '16px 44px', borderRadius: 20, fontSize: 15 }}>
              📸 첫 일기 쓰기
            </a>
          </div>
        ) : (
          <>
            {/* Weekly emotion stats card */}
            {sortedWeeklyMoods.length > 0 && (
              <div className="emotion-card animate-fade-in" style={{ marginTop: 20 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 16 }}>💕</span>
                    <span style={{ fontSize: 14, fontWeight: 800 }}>이번 주 감정</span>
                  </div>
                  <span className="badge badge-pink">{weeklyDiaries.length}개 일기</span>
                </div>
                {topMood && (
                  <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
                    <span style={{ fontSize: 32 }}>{moodEmojis[topMood[0]] || '🏷️'}</span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 800 }}>가장 많은 감정: {topMood[0]}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-light)' }}>{topMood[1]}회 기록됨</p>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sortedWeeklyMoods.slice(0, 4).map(([tag, count]) => (
                    <div key={tag} className="flex items-center gap-2">
                      <span style={{ fontSize: 14, width: 22, textAlign: 'center' }}>{moodEmojis[tag] || '🏷️'}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, width: 60, flexShrink: 0 }}>{tag}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--warm)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(count / maxMoodCount) * 100}%`, height: '100%', borderRadius: 3,
                          background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-light)', width: 20, textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search & Filter */}
            <div style={{ marginTop: 20 }}>
              <div className="search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-light)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  type="text"
                  placeholder="일기 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{
                    background: 'none', border: 'none', color: 'var(--text-light)',
                    cursor: 'pointer', fontSize: 16, padding: 0,
                  }}>×</button>
                )}
              </div>

              {/* Filter chips */}
              {(uniquePets.length > 1 || allMoodTags.length > 0) && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {uniquePets.length > 1 && uniquePets.map(pet => (
                    <button key={pet} onClick={() => setFilterPet(filterPet === pet ? '' : pet)}
                      className={`filter-chip ${filterPet === pet ? 'active' : ''}`}>
                      {pet}
                    </button>
                  ))}
                  {allMoodTags.map(tag => (
                    <button key={tag} onClick={() => setFilterMood(filterMood === tag ? '' : tag)}
                      className={`filter-chip ${filterMood === tag ? 'active' : ''}`}>
                      {moodEmojis[tag] || ''} {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between" style={{ marginTop: 20, marginBottom: 16 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 18 }}>📖</span>
                <h2 style={{ fontSize: 17, fontWeight: 800 }}>최근 일기</h2>
              </div>
              <span className="badge badge-pink">{filteredDiaries.length}개</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {filteredDiaries.map((entry, i) => (
                <div key={entry.id} className="diary-card animate-fade-in"
                  style={{ animationDelay: `${i * 0.08}s`, cursor: 'pointer' }}
                  onClick={() => router.push(`/diary/${entry.id}`)}>
                  <div className="photo-container">
                    <LazyImage src={entry.imageData} alt={entry.petName} />
                    <div className="photo-date">
                      {new Date(entry.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })}
                      {' · '}
                      {formatTime(entry.createdAt)}
                    </div>
                    <div className="photo-pet">
                      {entry.petType === 'cat' ? '🐱' : entry.petType === 'dog' ? '🐶' : '🐾'} {entry.petName}
                    </div>
                    {entry.extraImages && entry.extraImages.length > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 12, right: 12,
                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
                        color: 'white', padding: '4px 10px', borderRadius: 10,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        +{entry.extraImages.length}장
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '18px 20px 20px' }}>
                    {entry.healthAlerts && entry.healthAlerts.length > 0 && (
                      <div style={{
                        marginBottom: 14, padding: '10px 14px', borderRadius: 14,
                        background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                        border: '1px solid #FECACA',
                      }}>
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontSize: 13 }}>⚠️</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>건강 알림: {entry.healthAlerts[0]}</span>
                        </div>
                      </div>
                    )}

                    <div className="diary-content-box">
                      <p className="diary-text" style={{ whiteSpace: 'pre-wrap',
                        display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>{entry.diary}</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {entry.moodTags.map((tag) => (
                          <span key={tag} className={`mood-tag ${moodMap[tag] || ''}`}>{tag}</span>
                        ))}
                      </div>
                      <button onClick={(e) => handleDelete(e, entry.id)} className="delete-btn" aria-label="삭제">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
    </>
  );
}
