'use client';

import { useState, useEffect } from 'react';
import { getPetProfile, savePetProfile } from '@/lib/db';

const petTypes = ['🐶 강아지', '🐱 고양이', '🐰 토끼', '🐹 햄스터', '🐦 새', '🐢 기타'];

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [birthday, setBirthday] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = getPetProfile();
    setName(p.name);
    setType(p.type);
    setBirthday(p.birthday);
  }, []);

  const handleSave = () => {
    savePetProfile({ name, type, birthday });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="gradient-header text-white px-6 pt-12 pb-8 rounded-b-[32px]">
        <h1 className="text-2xl font-bold">반려동물 프로필 🐾</h1>
        <p className="text-white/80 text-sm mt-1">우리 아이 정보를 등록해주세요</p>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Name */}
        <div className="bg-white rounded-card shadow-soft p-5 space-y-3">
          <label className="text-sm font-medium text-gray-600">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 뽀삐, 나비, 초코"
            className="w-full px-4 py-3 rounded-2xl bg-cream border-0 outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {/* Type */}
        <div className="bg-white rounded-card shadow-soft p-5 space-y-3">
          <label className="text-sm font-medium text-gray-600">종류</label>
          <div className="grid grid-cols-3 gap-2">
            {petTypes.map((t) => {
              const typeValue = t.split(' ')[1];
              return (
                <button
                  key={t}
                  onClick={() => setType(typeValue)}
                  className={`py-3 rounded-2xl text-sm font-medium transition-all ${
                    type === typeValue
                      ? 'bg-primary text-white shadow-soft'
                      : 'bg-cream text-gray-600 hover:bg-primary/10'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Birthday */}
        <div className="bg-white rounded-card shadow-soft p-5 space-y-3">
          <label className="text-sm font-medium text-gray-600">생일</label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-cream border-0 outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!name || !type}
          className="w-full gradient-header text-white py-4 rounded-card font-bold text-lg shadow-soft card-hover disabled:opacity-40"
        >
          {saved ? '✅ 저장 완료!' : '💾 저장하기'}
        </button>
      </div>
    </div>
  );
}
