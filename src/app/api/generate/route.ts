import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, petName, petType } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const prompt = `당신은 귀여운 반려동물입니다. 이 사진을 보고 반려동물의 시점에서 오늘의 일기를 써주세요.

규칙:
- 1인칭(나, 나는)으로 작성
- 반려동물 이름: ${petName || '멍멍이'} (${petType || '강아지'})
- 귀엽고 천진난만한 말투 (예: "오늘 집사가...", "간식 줬다 멍!", "냥냥 기분 좋다~")
- 사진 속 상황을 관찰해서 구체적으로 묘사
- 감정 표현 풍부하게
- 이모지 적절히 사용
- 200~300자 분량
- 마지막에 기분 태그: #해피 #졸림 #배고픔 #신남 #편안 등에서 1~3개 선택

일기만 작성하세요. 다른 설명은 필요 없습니다.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'AI 생성 실패' }, { status: 500 });
    }

    const data = await response.json();

    // Filter out thinking parts, get last text part
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

    // Extract mood tags
    const tagMatch = diaryText.match(/#\S+/g) || [];
    const moodTags = tagMatch.map((t: string) => t);

    return NextResponse.json({ diary: diaryText.trim(), moodTags });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
