'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveDiary, getPetProfile } from '@/lib/db';

export default function NewDiaryPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string>('');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [generating, setGenerating] = useState(false);
  const [diary, setDiary] = useState<string>('');
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      // Extract base64 without prefix
      const base64 = result.split(',')[1];
      setImageBase64(base64);
      setDiary('');
      setMoodTags([]);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64) return;

    const pet = getPetProfile();
    if (!pet.name) {
      alert('먼저 프로필에서 반려동물 정보를 등록해주세요! 🐾');
      router.push('/profile');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          petName: pet.name,
          petType: pet.type,
        }),
      });

      if (!res.ok) throw new Error('생성 실패');

      const data = await res.json();
      setDiary(data.diary);
      setMoodTags(data.moodTags || []);
    } catch {
      alert('일기 생성에 실패했어요 😢 다시 시도해주세요.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!diary || !preview) return;

    const pet = getPetProfile();
    await saveDiary({
      id: crypto.randomUUID(),
      imageData: preview,
      diary,
      moodTags,
      createdAt: new Date().toISOString(),
      petName: pet.name,
      petType: pet.type,
    });

    setSaved(true);
    setTimeout(() => router.push('/'), 1000);
  };

  return (
    <div>
      {/* Header */}
      <div className="gradient-header text-white px-6 pt-12 pb-8 rounded-b-[32px]">
        <h1 className="text-2xl font-bold">새 일기 ✍️</h1>
        <p className="text-white/80 text-sm mt-1">사진을 올리면 AI가 일기를 써줘요</p>
      </div>

      <div className="px-4 mt-6 space-y-4">
        {/* Upload area */}
        {!preview ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full bg-white rounded-card shadow-soft p-8 flex flex-col items-center gap-3 card-hover border-2 border-dashed border-primary/30"
          >
            <span className="text-5xl">📷</span>
            <p className="text-gray-500 text-sm">사진을 선택하거나 촬영해주세요</p>
            <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              사진 선택하기
            </span>
          </button>
        ) : (
          <div className="bg-white rounded-card shadow-soft overflow-hidden">
            <img src={preview} alt="업로드된 사진" className="w-full h-64 object-cover" />
            <div className="p-3 flex justify-between">
              <button
                onClick={() => {
                  setPreview(null);
                  setImageBase64('');
                  setDiary('');
                  setMoodTags([]);
                }}
                className="text-gray-400 text-sm"
              >
                다른 사진 선택
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFile}
          className="hidden"
        />

        {/* Generate button */}
        {preview && !diary && !generating && (
          <button
            onClick={handleGenerate}
            className="w-full gradient-header text-white py-4 rounded-card font-bold text-lg shadow-soft card-hover"
          >
            🐾 AI 일기 생성하기
          </button>
        )}

        {/* Loading */}
        {generating && (
          <div className="bg-white rounded-card shadow-soft p-8 flex flex-col items-center gap-3">
            <span className="text-4xl animate-paw-bounce">🐾</span>
            <p className="text-gray-500 text-sm">AI가 일기를 쓰고 있어요...</p>
          </div>
        )}

        {/* Generated diary */}
        {diary && (
          <div className="bg-white rounded-card shadow-soft p-5 animate-fade-in space-y-3">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{diary}</p>
            {moodTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {moodTags.map((tag) => (
                  <span
                    key={tag}
                    className="mood-badge bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {!saved ? (
              <button
                onClick={handleSave}
                className="w-full bg-primary text-white py-3 rounded-2xl font-bold shadow-soft card-hover"
              >
                💾 일기 저장하기
              </button>
            ) : (
              <div className="text-center text-primary font-bold py-3 animate-fade-in">
                ✅ 저장 완료!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
