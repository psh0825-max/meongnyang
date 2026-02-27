'use client';

import { useState, useEffect } from 'react';
import { getPetProfile, savePetProfile, getAllDiaries, type DiaryEntry } from '@/lib/db';

const petTypes = [
  { value: 'dog', emoji: '🐶', label: '강아지' },
  { value: 'cat', emoji: '🐱', label: '고양이' },
  { value: 'bird', emoji: '🐦', label: '새' },
  { value: 'hamster', emoji: '🐹', label: '햄스터' },
  { value: 'rabbit', emoji: '🐰', label: '토끼' },
  { value: 'other', emoji: '🐾', label: '기타' },
];

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('dog');
  const [birthday, setBirthday] = useState('');
  const [saved, setSaved] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);
  const [firstDate, setFirstDate] = useState('');

  useEffect(() => {
    const p = getPetProfile();
    if (p.name) setName(p.name);
    if (p.type) setType(p.type);
    if (p.birthday) setBirthday(p.birthday);
    getAllDiaries().then((d: DiaryEntry[]) => {
      setDiaryCount(d.length);
      if (d.length > 0) {
        const oldest = d.reduce((a, b) => a.createdAt < b.createdAt ? a : b);
        setFirstDate(new Date(oldest.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }));
      }
    });
  }, []);

  const handleSave = () => {
    savePetProfile({ name, type, birthday });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const selected = petTypes.find(p => p.value === type) || petTypes[0];
  const age = birthday ? (() => {
    const diff = Date.now() - new Date(birthday).getTime();
    const years = Math.floor(diff / 31557600000);
    const months = Math.floor((diff % 31557600000) / 2629800000);
    if (years > 0) return `${years}살 ${months}개월`;
    return `${months}개월`;
  })() : null;

  return (
    <div className="min-h-screen">
      {/* Header with avatar */}
      <div className="app-header-alt" style={{ textAlign: 'center', paddingBottom: 56, borderRadius: '0 0 36px 36px' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="avatar-ring animate-fade-in" style={{ marginBottom: 16 }}>
            <div className="avatar-inner animate-breathe">{selected.emoji}</div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900 }} className="animate-fade-in-1">
            {name || '프로필 설정'}
          </h1>
          {name && (
            <div className="animate-fade-in-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 500 }}>{selected.label}</span>
              {age && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ fontSize: 13, opacity: 0.85, fontWeight: 500 }}>{age}</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="px-5 pb-28" style={{ marginTop: -20, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Stats row (if has diaries) */}
          {diaryCount > 0 && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>📝</div>
                <div className="stat-number">{diaryCount}</div>
                <div className="stat-label">총 일기</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.1)' }}>📅</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mid)', marginTop: 4 }}>{firstDate || '-'}</div>
                <div className="stat-label" style={{ marginTop: 4 }}>첫 일기</div>
              </div>
            </div>
          )}

          {/* Name */}
          <div className="card animate-fade-in-1" style={{ padding: 22 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>✏️</span>
              <label style={{ fontSize: 14, fontWeight: 800 }}>이름</label>
            </div>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="우리 아이 이름을 알려주세요" className="input-field" />
          </div>

          {/* Type */}
          <div className="card animate-fade-in-2" style={{ padding: 22 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🐾</span>
              <label style={{ fontSize: 14, fontWeight: 800 }}>종류</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {petTypes.map(p => (
                <button key={p.value} onClick={() => setType(p.value)}
                  className={`type-option ${type === p.value ? 'selected' : ''}`}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>{p.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: type === p.value ? 800 : 500, color: type === p.value ? 'var(--primary-dark)' : 'var(--text-light)' }}>{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Birthday */}
          <div className="card animate-fade-in-3" style={{ padding: 22 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🎂</span>
              <label style={{ fontSize: 14, fontWeight: 800 }}>생일</label>
              {age && <span className="badge badge-pink" style={{ marginLeft: 'auto' }}>{age}</span>}
            </div>
            <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
              className="input-field" />
          </div>

          {/* Save */}
          {!saved ? (
            <button onClick={handleSave} className="btn-primary animate-fade-in-4" disabled={!name.trim()} style={{ fontSize: 16 }}>
              <span style={{ fontSize: 18 }}>💾</span>
              저장하기
            </button>
          ) : (
            <div className="save-confirm">
              <div className="checkmark">✓</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--mint)' }}>저장 완료!</span>
            </div>
          )}

          {/* Footer info */}
          <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
            <div className="flex items-center justify-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>🔒</span>
              <span style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>모든 데이터는 이 기기에만 저장됩니다</span>
            </div>
            <p style={{ fontSize: 11, color: '#D4D0CB' }}>멍냥로그 v1.0</p>
          </div>

        </div>
      </div>
    </div>
  );
}
