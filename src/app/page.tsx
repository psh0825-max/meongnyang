'use client';

import { useEffect, useState } from 'react';
import { getAllDiaries, deleteDiary, type DiaryEntry } from '@/lib/db';

const moodColors: Record<string, string> = {
  '#해피': 'bg-yellow-100 text-yellow-700',
  '#졸림': 'bg-blue-100 text-blue-700',
  '#배고픔': 'bg-orange-100 text-orange-700',
  '#신남': 'bg-pink-100 text-pink-700',
  '#편안': 'bg-green-100 text-green-700',
};

function getMoodColor(tag: string) {
  return moodColors[tag] || 'bg-purple-100 text-purple-700';
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
        <span className="text-4xl animate-paw-bounce">🐾</span>
        <p className="text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="gradient-header text-white px-6 pt-12 pb-8 rounded-b-[32px]">
        <h1 className="text-2xl font-bold">멍냥로그 🐾</h1>
        <p className="text-white/80 text-sm mt-1">우리 아이의 하루를 기록해요</p>
      </div>

      {/* Content */}
      <div className="px-4 mt-6 space-y-4">
        {diaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-6xl">🐾</span>
            <p className="text-gray-400 text-center">
              아직 일기가 없어요!
              <br />
              <span className="text-primary font-medium">첫 일기를 써보세요 ✨</span>
            </p>
          </div>
        ) : (
          diaries.map((entry, i) => (
            <div
              key={entry.id}
              className="bg-white rounded-card shadow-soft p-4 card-hover animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Image */}
              <div className="rounded-2xl overflow-hidden mb-3">
                <img
                  src={entry.imageData}
                  alt="반려동물 사진"
                  className="w-full h-48 object-cover"
                />
              </div>

              {/* Date & Pet */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {new Date(entry.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-xs bg-cream px-2 py-0.5 rounded-full text-primary font-medium">
                    {entry.petName}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-gray-300 hover:text-red-400 text-sm transition-colors"
                >
                  🗑️
                </button>
              </div>

              {/* Diary text */}
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {entry.diary}
              </p>

              {/* Mood tags */}
              {entry.moodTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {entry.moodTags.map((tag) => (
                    <span key={tag} className={`mood-badge ${getMoodColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
