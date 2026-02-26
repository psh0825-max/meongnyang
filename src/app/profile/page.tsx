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

  const selectedPet = petTypes.find(p => p.value === type) || petTypes[0];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-header text-white px-6 pt-14 pb-16 relative text-center">
        <div className="relative z-10">
          <div className="profile-avatar mb-4 animate-float">
            {selectedPet.emoji}
          </div>
          <h1 className="text-2xl font-black">{name || '우리 아이'}</h1>
          <p className="text-white/70 text-sm mt-1">{name ? `${selectedPet.label} · ${name}` : '프로필을 등록해주세요'}</p>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 pb-8 space-y-5">
        {/* Name */}
        <div className="card animate-fade-in">
          <label className="block text-sm font-bold text-gray-600 mb-2">🏷️ 이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="반려동물 이름을 입력해주세요"
            className="input-cute"
          />
        </div>

        {/* Type */}
        <div className="card animate-fade-in-1">
          <label className="block text-sm font-bold text-gray-600 mb-3">🐾 종류</label>
          <div className="grid grid-cols-3 gap-2">
            {petTypes.map((p) => (
              <button
                key={p.value}
                onClick={() => setType(p.value)}
                className={`py-3 px-2 rounded-2xl text-center transition-all ${
                  type === p.value
                    ? 'bg-gradient-to-br from-amber-100 to-pink-100 border-2 border-primary shadow-md scale-105'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className="text-2xl mb-1">{p.emoji}</div>
                <div className={`text-xs font-bold ${type === p.value ? 'text-primary' : 'text-gray-500'}`}>{p.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Birthday */}
        <div className="card animate-fade-in-2">
          <label className="block text-sm font-bold text-gray-600 mb-2">🎂 생일</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="input-cute"
          />
        </div>

        {/* Save */}
        {!saved ? (
          <button onClick={handleSave} className="btn-primary animate-fade-in-3" disabled={!name.trim()}>
            💾 저장하기
          </button>
        ) : (
          <div className="text-center py-4 animate-scale-in">
            <span className="text-4xl">🎉</span>
            <p className="text-primary font-bold mt-2">저장 완료!</p>
          </div>
        )}

        {/* Info */}
        <div className="text-center text-xs text-gray-300 mt-4 space-y-1">
          <p>🔒 모든 데이터는 이 기기에만 저장됩니다</p>
          <p>© 2026 LightOn Plus Lab</p>
        </div>
      </div>
    </div>
  );
}
