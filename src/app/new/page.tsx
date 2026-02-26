'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveDiary, getPetProfile } from '@/lib/db';

export default function NewDiaryPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
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
      setImageBase64(result.split(',')[1]);
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
        body: JSON.stringify({ imageBase64, mimeType, petName: pet.name, petType: pet.type }),
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

  const moodClassMap: Record<string, string> = {
    '#해피': 'mood-happy', '#졸림': 'mood-sleepy', '#배고픔': 'mood-hungry',
    '#신남': 'mood-excited', '#편안': 'mood-relaxed',
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="gradient-header text-white px-6 pt-14 pb-12 relative">
        <div className="relative z-10">
          <button onClick={() => router.back()} className="text-white/70 text-sm hover:text-white transition mb-3 block font-medium">← 뒤로</button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <span className="text-2xl">✍️</span>
            </div>
            <div>
              <h1 className="text-2xl font-black">새 일기</h1>
              <p className="text-white/70 text-xs">사진을 올리면 AI가 일기를 써줘요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-4 relative z-10 pb-8 space-y-5">
        {/* Upload area */}
        {!preview ? (
          <div className="animate-fade-in">
            <div className="upload-zone text-center" onClick={() => fileRef.current?.click()}>
              <div className="text-6xl mb-4 animate-float">📷</div>
              <p className="text-gray-500 text-sm font-medium mb-4">우리 아이 사진을 올려주세요!</p>
              <div className="flex gap-3 justify-center">
                <button onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }} className="btn-outline text-sm !py-3 !px-5">
                  📸 촬영
                </button>
                <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} className="btn-primary text-sm !py-3 !px-5 !w-auto">
                  🖼️ 갤러리
                </button>
              </div>
            </div>

            {/* Tips */}
            <div className="card mt-4">
              <div className="text-sm font-bold text-gray-600 mb-2">💡 일기가 더 재밌어지는 팁!</div>
              <div className="space-y-2 text-xs text-gray-400">
                <p>• 반려동물의 표정이 잘 보이는 사진이 좋아요</p>
                <p>• 재밌는 상황이나 포즈를 찍어보세요</p>
                <p>• 산책, 간식, 낮잠 등 일상을 기록해보세요</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-diary animate-scale-in">
            <div className="photo-frame">
              <img src={preview} alt="업로드된 사진" className="w-full h-64 object-cover" />
            </div>
            <div className="p-4 flex justify-between items-center">
              <span className="text-xs text-gray-400">사진이 선택되었어요! 🎉</span>
              <button onClick={() => { setPreview(null); setImageBase64(''); setDiary(''); setMoodTags([]); }}
                className="text-xs text-gray-400 hover:text-primary transition font-medium">다른 사진</button>
            </div>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

        {/* Generate button */}
        {preview && !diary && !generating && (
          <button onClick={handleGenerate} className="btn-primary animate-fade-in animate-pulse-soft">
            🐾 AI 일기 생성하기
          </button>
        )}

        {/* Loading */}
        {generating && (
          <div className="card text-center py-10 animate-fade-in">
            <div className="text-5xl mb-4 animate-wiggle">✏️</div>
            <p className="text-gray-600 font-bold mb-1">AI가 일기를 쓰고 있어요...</p>
            <p className="text-xs text-gray-400">잠시만 기다려주세요 🐾</p>
            <div className="flex justify-center gap-1 mt-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary animate-sparkle" style={{ animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Generated diary */}
        {diary && (
          <div className="card animate-slide-up space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">📝</span>
              <span className="font-bold text-gray-700">AI가 쓴 일기</span>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl p-5">
              <p className="text-gray-600 text-[14px] leading-[1.9] whitespace-pre-wrap">{diary}</p>
            </div>

            {moodTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {moodTags.map((tag) => (
                  <span key={tag} className={`badge ${moodClassMap[tag] || 'mood-default'}`}>{tag}</span>
                ))}
              </div>
            )}

            {!saved ? (
              <button onClick={handleSave} className="btn-primary">
                💾 일기 저장하기
              </button>
            ) : (
              <div className="text-center py-4 animate-scale-in">
                <span className="text-4xl">🎉</span>
                <p className="text-primary font-bold mt-2">저장 완료!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
