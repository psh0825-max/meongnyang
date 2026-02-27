'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDiaryById, updateDiary, deleteDiary, type DiaryEntry } from '@/lib/db';

const moodMap: Record<string, string> = {
  '#해피': 'mood-happy', '#졸림': 'mood-sleepy', '#배고픔': 'mood-hungry',
  '#신남': 'mood-excited', '#편안': 'mood-relaxed',
};

export default function DiaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDiaryById(id).then((d) => {
      if (d) { setEntry(d); setEditText(d.diary); }
      setLoading(false);
    });
  }, [id]);

  const allImages = entry ? [entry.imageData, ...(entry.extraImages || [])] : [];

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentSlide(idx);
  }, []);

  const handleSaveEdit = async () => {
    if (!entry || !editText.trim()) return;
    setSaving(true);
    await updateDiary(entry.id, { diary: editText });
    setEntry({ ...entry, diary: editText });
    setEditing(false);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!entry || !confirm('이 일기를 삭제할까요?')) return;
    await deleteDiary(entry.id);
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => <div key={i} className="loading-dot" style={{ animationDelay: `${i * 0.2}s` }} />)}
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-mid)' }}>일기를 찾을 수 없어요</h3>
        <button onClick={() => router.push('/')} className="btn-primary" style={{ marginTop: 20, width: 'auto', padding: '12px 32px' }}>
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const dateStr = new Date(entry.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });
  const timeStr = new Date(entry.createdAt).toLocaleTimeString('ko-KR', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Back button overlay */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
      }}>
        <button onClick={() => router.back()} style={{
          width: 40, height: 40, borderRadius: 14,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      {/* Photo swipe area */}
      <div style={{ position: 'relative' }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="photo-swipe-container"
        >
          {allImages.map((img, i) => (
            <div key={i} className="photo-swipe-slide">
              <img src={img} alt="" style={{ width: '100%', display: 'block', minHeight: 300, objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        {allImages.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 6,
          }}>
            {allImages.map((_, i) => (
              <div key={i} style={{
                width: currentSlide === i ? 20 : 8, height: 8, borderRadius: 4,
                background: currentSlide === i ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            ))}
          </div>
        )}

        {/* Pet badge */}
        <div className="photo-pet" style={{ position: 'absolute', top: 16, right: 16 }}>
          {entry.petType === 'cat' ? '🐱' : entry.petType === 'dog' ? '🐶' : '🐾'} {entry.petName}
        </div>
      </div>

      {/* Content */}
      <div className="px-5" style={{ marginTop: 20 }}>
        {/* Date & time */}
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800 }}>{dateStr}</p>
            <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>{timeStr}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} style={{
              padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: editing ? 'rgba(245,158,11,0.15)' : 'var(--warm)',
              color: editing ? 'var(--primary-dark)' : 'var(--text-mid)',
              fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
            }}>
              {editing ? '취소' : '✏️ 편집'}
            </button>
            <button onClick={handleDelete} className="delete-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Health alerts */}
        {entry.healthAlerts && entry.healthAlerts.length > 0 && (
          <div style={{
            marginBottom: 16, padding: '14px 18px', borderRadius: 16,
            background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
            border: '1px solid #FECACA',
          }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 15 }}>⚠️</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#DC2626' }}>건강 알림</span>
            </div>
            {entry.healthAlerts.map((alert, i) => (
              <p key={i} style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.6 }}>· {alert}</p>
            ))}
          </div>
        )}

        {/* Diary text or edit */}
        {editing ? (
          <div className="animate-fade-in">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="input-field"
              style={{
                minHeight: 200, resize: 'vertical', lineHeight: 1.9,
                fontSize: 14.5, fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSaveEdit}
              disabled={saving || !editText.trim()}
              className="btn-primary"
              style={{ marginTop: 12 }}
            >
              {saving ? '저장 중...' : '💾 저장하기'}
            </button>
          </div>
        ) : (
          <div className="diary-content-box animate-fade-in">
            <p className="diary-text" style={{ whiteSpace: 'pre-wrap' }}>{entry.diary}</p>
          </div>
        )}

        {/* Mood tags */}
        {entry.moodTags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {entry.moodTags.map((tag) => (
              <span key={tag} className={`mood-tag ${moodMap[tag] || ''}`}>{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
