'use client';

import { useEffect, useState } from 'react';
import { getAllDiaries, deleteDiary, type DiaryEntry } from '@/lib/db';

const moodMap: Record<string, { className: string }> = {
  '#해피': { className: 'mood-happy' },
  '#졸림': { className: 'mood-sleepy' },
  '#배고픔': { className: 'mood-hungry' },
  '#신남': { className: 'mood-excited' },
  '#편안': { className: 'mood-relaxed' },
};

function getMoodClass(tag: string) {
  return moodMap[tag]?.className || 'mood-default';
}

export default function HomePage() {
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllDiaries().then((d) => {
      setDiaries(d);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('이 일기를 삭제할까요?')) return;
    await deleteDiary(id);
    setDiaries((prev) => prev.filter((d) => d.id !== id));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="empty-illustration animate-paw-bounce">
          🐾
        </div>
        <p className="text-gray-400 font-medium">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-header text-white px-6 pt-14 pb-12 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <span className="text-2xl">🐾</span>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">멍냥로그</h1>
              <p className="text-white/70 text-xs font-medium">우리 아이의 하루를 기록해요</p>
            </div>
          </div>

          {/* Stats */}
          {diaries.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              {[
                { num: diaries.length.toString(), label: '총 일기', icon: '📖' },
                { num: new Set(diaries.map(d => d.petName)).size.toString(), label: '반려동물', icon: '🐶' },
                { num: (() => { const today = new Date().toDateString(); return diaries.filter(d => new Date(d.createdAt).toDateString() === today).length.toString(); })(), label: '오늘', icon: '✨' },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 backdrop-blur-sm rounded-2xl py-3 px-2 text-center border border-white/20">
                  <div className="text-lg font-black">{s.num}</div>
                  <div className="text-[10px] text-white/70 font-medium">{s.icon} {s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating decorations */}
        <span className="paw-decoration animate-float" style={{ top: '15%', right: '8%', fontSize: '20px', opacity: 0.15, animationDelay: '0s' }}>🐾</span>
        <span className="paw-decoration animate-float" style={{ top: '60%', right: '15%', fontSize: '16px', opacity: 0.1, animationDelay: '1s' }}>✨</span>
        <span className="paw-decoration animate-float" style={{ top: '40%', left: '5%', fontSize: '14px', opacity: 0.1, animationDelay: '2s' }}>🐾</span>
      </div>

      {/* Content */}
      <div className="px-5 -mt-4 relative z-10 pb-6">
        {diaries.length === 0 ? (
          <div className="empty-state animate-fade-in">
            <div className="empty-illustration animate-float">
              😴
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">아직 일기가 없어요!</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              반려동물 사진을 올리면<br/>AI가 귀여운 일기를 써줘요 🐾
            </p>
            <a href="/new" className="btn-primary inline-flex !w-auto !px-8">
              ✍️ 첫 일기 쓰러가기
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {diaries.map((entry, i) => (
              <div
                key={entry.id}
                className="card-diary animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Photo */}
                <div className="photo-frame">
                  <img
                    src={entry.imageData}
                    alt="반려동물 사진"
                    className="w-full h-52 object-cover"
                  />
                  {/* Date ribbon */}
                  <div className="absolute top-4 left-0">
                    <div className="date-ribbon">
                      📅 {new Date(entry.createdAt).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Pet name + delete */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-amber">
                        🐾 {entry.petName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Diary text */}
                  <p className="text-gray-600 text-[14px] leading-[1.8] whitespace-pre-wrap">
                    {entry.diary}
                  </p>

                  {/* Mood tags */}
                  {entry.moodTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {entry.moodTags.map((tag) => (
                        <span key={tag} className={`badge ${getMoodClass(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
