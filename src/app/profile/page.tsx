'use client';

import { useState, useEffect } from 'react';
import { getPetProfile, savePetProfile } from '@/lib/db';

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

  useEffect(() => {
    const p = getPetProfile();
    if (p.name) setName(p.name);
    if (p.type) setType(p.type);
    if (p.birthday) setBirthday(p.birthday);
  }, []);

  const handleSave = () => {
    savePetProfile({ name, type, birthday });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selected = petTypes.find(p => p.value === type) || petTypes[0];

  return (
    <div className="min-h-screen">
      <div className="app-header-alt" style={{ textAlign: 'center', paddingBottom: 48, borderRadius: '0 0 32px 32px' }}>
        <div className="avatar-ring" style={{ marginBottom: 16 }}>
          <div className="avatar-inner animate-breathe">{selected.emoji}</div>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>{name || '프로필 설정'}</h1>
        {name && <p style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>{selected.label}</p>}
      </div>

      <div className="px-5 -mt-4 relative pb-24 space-y-5" style={{ zIndex: 10 }}>
        <div className="card animate-fade-in" style={{ padding: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: 8 }}>이름</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="반려동물 이름" className="input-field" />
        </div>

        <div className="card animate-fade-in-1" style={{ padding: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: 12 }}>종류</label>
          <div className="grid grid-cols-3 gap-2">
            {petTypes.map(p => (
              <button key={p.value} onClick={() => setType(p.value)}
                className={`type-option ${type === p.value ? 'selected' : ''}`}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{p.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: type === p.value ? 700 : 500, color: type === p.value ? 'var(--primary-dark)' : 'var(--text-light)' }}>{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card animate-fade-in-2" style={{ padding: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', display: 'block', marginBottom: 8 }}>생일</label>
          <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)}
            className="input-field" />
        </div>

        {!saved ? (
          <button onClick={handleSave} className="btn-primary animate-fade-in-3" disabled={!name.trim()}>저장하기</button>
        ) : (
          <div className="text-center animate-scale-in" style={{ padding: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--primary)' }}>✓ 저장 완료</p>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: 12, color: '#C4C0BB', marginTop: 16 }}>
          모든 데이터는 이 기기에만 저장됩니다
        </p>
      </div>
    </div>
  );
}
