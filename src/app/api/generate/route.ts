import { NextRequest, NextResponse } from 'next/server';

const PERSONALITY_PROMPTS: Record<string, string> = {
  '개구쟁이': '장난기 가득하고 에너지 넘치는 말투 (예: "히히 또 사고쳤다!", "놀자놀자!!")',
  '도도한': '쿨하고 시크한 말투 (예: "흥, 집사가 또 귀찮게 하네.", "...관심 없다냥")',
  '애교쟁이': '애교 넘치고 달콤한 말투 (예: "집사~ 사랑해요♡", "안아줘~ 응응?")',
  '겁쟁이': '소심하고 걱정 많은 말투 (예: "으... 무서워...", "혼자 있기 싫어...")',
  '느긋한': '여유롭고 편안한 말투 (예: "음~ 오늘도 평화롭다~", "낮잠이 최고야...")',
};

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, extraImages, petName, petType, personality, gender } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const personalityGuide = personality && PERSONALITY_PROMPTS[personality]
      ? `- 성격: ${personality} → ${PERSONALITY_PROMPTS[personality]}`
      : '- 귀엽고 천진난만한 말투';

    const genderNote = gender ? `- 성별: ${gender}` : '';
    const photoCount = 1 + (extraImages?.length || 0);
    const multiPhotoNote = photoCount > 1
      ? `- ${photoCount}장의 사진이 주어졌습니다. 모든 사진의 상황을 종합해서 일기를 써주세요.`
      : '';

    const prompt = `당신은 귀여운 반려동물입니다. 사진을 보고 반려동물의 시점에서 오늘의 일기를 써주세요.

규칙:
- 1인칭(나, 나는)으로 작성
- 반려동물 이름: ${petName || '멍멍이'} (${petType || '강아지'})
${genderNote}
${personalityGuide}
${multiPhotoNote}
- 사진 속 상황을 관찰해서 구체적으로 묘사
- 감정 표현 풍부하게
- 이모지 적절히 사용
- 200~300자 분량
- 건강 이상이 보이면 자연스럽게 언급 (절뚝거림, 기운 없음, 기침 등)
- 마지막에 기분 태그: #해피 #졸림 #배고픔 #신남 #편안 #궁금 #외로움 #장난꾸러기 등에서 1~3개 선택

일기만 작성하세요. 다른 설명은 필요 없습니다.`;

    // Build image parts
    const imageParts: Array<{ inlineData: { mimeType: string; data: string } }> = [
      { inlineData: { mimeType: mimeType || 'image/jpeg', data: imageBase64 } },
    ];

    // Add extra images
    if (extraImages && Array.isArray(extraImages)) {
      for (const img of extraImages.slice(0, 3)) {
        if (img.base64 && img.mimeType) {
          imageParts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
        }
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [...imageParts, { text: prompt }],
          }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'AI 생성 실패' }, { status: 500 });
    }

    const data = await response.json();
    const candidates = data.candidates;
    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ error: 'AI 응답 없음' }, { status: 500 });
    }

    const parts = candidates[0].content?.parts || [];
    let diaryText = '';
    for (const part of parts) {
      if (part.text && !part.thought) {
        diaryText = part.text;
      }
    }

    if (!diaryText) {
      return NextResponse.json({ error: 'AI 텍스트 응답 없음' }, { status: 500 });
    }

    const tagMatch = diaryText.match(/#\S+/g) || [];
    const moodTags = tagMatch.map((t: string) => t);

    return NextResponse.json({ diary: diaryText.trim(), moodTags });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
