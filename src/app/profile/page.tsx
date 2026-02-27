'use client';

import { useState, useEffect, useRef } from 'react';
import { getPetProfile, savePetProfile, getAllDiaries, getMoodTrend, getWeeklyDiaries, type DiaryEntry } from '@/lib/db';

const petTypes = [
  { value: 'dog', emoji: '🐶', label: '강아지' },
  { value: 'cat', emoji: '🐱', label: '고양이' },
  { value: 'bird', emoji: '🐦', label: '새' },
  { value: 'hamster', emoji: '🐹', label: '햄스터' },
  { value: 'rabbit', emoji: '🐰', label: '토끼' },
  { value: 'other', emoji: '🐾', label: '기타' },
];

const personalities = [
  { value: '개구쟁이', emoji: '🤪', label: '개구쟁이' },
  { value: '도도한', emoji: '😎', label: '도도한' },
  { value: '애교쟁이', emoji: '🥰', label: '애교쟁이' },
  { value: '겁쟁이', emoji: '😰', label: '겁쟁이' },
  { value: '느긋한', emoji: '😴', label: '느긋한' },
];

const genders = [
  { value: '남아', emoji: '♂️', label: '남아' },
  { value: '여아', emoji: '♀️', label: '여아' },
];

const moodEmojis: Record<string, string> = {
  '#해피': '😊', '#졸림': '😴', '#배고픔': '🍖', '#신남': '🎉',
  '#편안': '☺️', '#궁금': '🧐', '#외로움': '🥺', '#장난꾸러기': '😝',
};

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('dog');
  const [birthday, setBirthday] = useState('');
  const [personality, setPersonality] = useState('');
  const [gender, setGender] = useState('');
  const [photo, setPhoto] = useState('');
  const [saved, setSaved] = useState(false);
  const [diaryCount, setDiaryCount] = useState(0);
  const [firstDate, setFirstDate] = useState('');
  const [moodTrend, setMoodTrend] = useState<Record<string, number>>({});
  const [weeklyCount, setWeeklyCount] = useState(0);
  const photoRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Resize to 256px for storage
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d')!;
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2, sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        setPhoto(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    const p = getPetProfile();
    if (p.name) setName(p.name);
    if (p.type) setType(p.type);
    if (p.birthday) setBirthday(p.birthday);
    if (p.personality) setPersonality(p.personality);
    if (p.gender) setGender(p.gender);
    if (p.photo) setPhoto(p.photo);
    getAllDiaries().then((d: DiaryEntry[]) => {
      setDiaryCount(d.length);
      setMoodTrend(getMoodTrend(d));
      setWeeklyCount(getWeeklyDiaries(d).length);
      if (d.length > 0) {
        const oldest = d.reduce((a, b) => a.createdAt < b.createdAt ? a : b);
        setFirstDate(new Date(oldest.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }));
      }
    });
  }, []);

  const handleSave = () => {
    savePetProfile({ name, type, birthday, personality, gender, photo });
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

  const sortedMoods = Object.entries(moodTrend).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxMood = sortedMoods.length > 0 ? sortedMoods[0][1] : 0;

  return (
    <>
      <div className="app-header-alt" style={{ textAlign: 'center', paddingBottom: 60, borderRadius: '0 0 36px 36px' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="avatar-ring animate-fade-in" style={{ marginBottom: 14, cursor: 'pointer' }}
            onClick={() => photoRef.current?.click()}>
            {photo ? (
              <img src={photo} alt={name} style={{
                width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
              }} />
            ) : name ? (
              <div className="avatar-inner" style={{
                background: 'linear-gradient(135deg, var(--primary), var(--secondary), var(--accent))',
                backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite',
                color: 'white', fontWeight: 900, fontSize: 36,
              }}>{name.charAt(0).toUpperCase()}</div>
            ) : (
              <div className="avatar-inner animate-breathe">{selected.emoji}</div>
            )}
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: 10,
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>📷</div>
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
          <h1 style={{ fontSize: 22, fontWeight: 900 }} className="animate-fade-in-1">
            {name || '프로필 설정'}
          </h1>
          {name && (
            <p className="animate-fade-in-2" style={{ fontSize: 13, opacity: 0.85, fontWeight: 500, marginTop: 6 }}>
              {selected.label}{gender ? ` · ${gender}` : ''}{personality ? ` · ${personality}` : ''}{age ? ` · ${age}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-6" style={{ marginTop: -24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stats */}
          {diaryCount > 0 && (
            <div className="grid grid-cols-3 gap-3 animate-fade-in">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>📝</div>
                <div className="stat-number">{diaryCount}</div>
                <div className="stat-label">총 일기</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(236,72,153,0.1)' }}>📅</div>
                <div className="stat-number">{weeklyCount}</div>
                <div className="stat-label">이번 주</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>🎭</div>
                <div className="stat-number">{Object.keys(moodTrend).length}</div>
                <div className="stat-label">감정 종류</div>
              </div>
            </div>
          )}

          {/* Mood Trend */}
          {sortedMoods.length > 0 && (
            <div className="card animate-fade-in" style={{ padding: '18px 20px' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 15 }}>📊</span>
                <label style={{ fontSize: 14, fontWeight: 800 }}>감정 트렌드</label>
                <span className="badge badge-amber" style={{ marginLeft: 'auto' }}>전체 기간</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedMoods.map(([tag, count]) => (
                  <div key={tag} className="flex items-center gap-3">
                    <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{moodEmojis[tag] || '🏷️'}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, width: 70, flexShrink: 0 }}>{tag}</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--warm)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${(count / maxMood) * 100}%`, height: '100%', borderRadius: 4,
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#A39888', width: 24, textAlign: 'right' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Name */}
          <div className="card animate-fade-in-1" style={{ padding: '18px 20px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 15 }}>✏️</span>
              <label style={{ fontSize: 14, fontWeight: 800 }}>이름</label>
            </div>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="우리 아이 이름" className="input-field" />
          </div>

          {/* Type */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 15 }}>🐾</span>
              <label style={{ fontSize: 14, fontWeight: 800 }}>종류</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {petTypes.map(p => (
                <button key={p.value} onClick={() => setType(p.value)}
                  className={`type-option ${type === p.value ? 'selected' : ''}`}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{p.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: type === p.value ? 800 : 500, color: type === p.value ? 'var(--primary-dark)' : '#A39888' }}>{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Gender */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 15 }}>⚧️</span>
              <label style={{ fontSize: 14, fontWeight: 800 }}>성별</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {genders.map(g => (
                <button key={g.value} onClick={() => setGender(g.value)}
                  className={`type-option ${gender === g.value ? 'selected' : ''}`}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{g.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: gender === g.value ? 800 : 500, color: gender === g.value ? 'var(--primary-dark)' : '#A39888' }}>{g.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 15 }}>🎭</span>
              <label style={{ fontSize: 14, fontWeight: 800 }}>성격</label>
            </div>
            <p style={{ fontSize: 11, color: '#C4C0BB', marginBottom: 12 }}>AI 일기 말투가 성격에 맞게 바뀌어요!</p>
            <div className="grid grid-cols-3 gap-3">
              {personalities.map(p => (
                <button key={p.value} onClick={() => setPersonality(p.value)}
                  className={`type-option ${personality === p.value ? 'selected' : ''}`}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{p.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: personality === p.value ? 800 : 500, color: personality === p.value ? 'var(--primary-dark)' : '#A39888' }}>{p.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Birthday */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 15 }}>🎂</span>
                <label style={{ fontSize: 14, fontWeight: 800 }}>생일</label>
              </div>
              {age && <span className="badge badge-pink">{age}</span>}
            </div>
            <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className="input-field" />
          </div>

          {/* Save */}
          {!saved ? (
            <button onClick={handleSave} className="btn-primary" disabled={!name.trim()} style={{ fontSize: 15 }}>
              💾 저장하기
            </button>
          ) : (
            <div className="save-confirm">
              <div className="checkmark">✓</div>
              <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--mint)' }}>저장 완료!</span>
            </div>
          )}

          <div style={{ textAlign: 'center', padding: '12px 0 0' }}>
            <p className="flex items-center justify-center gap-1.5" style={{ fontSize: 11, color: '#C4C0BB' }}>
              🔒 모든 데이터는 이 기기에만 저장됩니다
            </p>
            <p style={{ fontSize: 10, color: '#E0DCD6', marginTop: 6 }}>멍냥로그 v1.1 · LightOn Plus Lab</p>
          </div>
        </div>
      </div>
    </>
  );
}
