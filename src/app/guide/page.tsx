'use client';

export default function GuidePage() {
  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <div className="app-header-alt" style={{ borderRadius: '0 0 32px 32px', paddingBottom: 40, textAlign: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <img src="/illust-icon.png" alt="" style={{ width: 72, height: 72, borderRadius: 20, margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }} />
          <h1 style={{ fontSize: 24, fontWeight: 900 }}>사용 가이드</h1>
          <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>멍냥로그 100% 활용법 🐾</p>
        </div>
      </div>

      <div className="px-5 pb-10" style={{ marginTop: -12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1 */}
          <div className="card animate-fade-in" style={{ padding: 20 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), #F97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 900, flexShrink: 0 }}>1</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>프로필 등록</h3>
                <p style={{ fontSize: 12, color: '#A39888' }}>우리 아이 정보를 입력해요</p>
              </div>
            </div>
            <div style={{ background: 'var(--warm)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>하단 <b>프로필</b> 탭을 탭하세요</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>이름, 종류(강아지/고양이 등), 생일 입력</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span><b>저장하기</b> 버튼을 눌러주세요</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: '#C4C0BB', marginTop: 8 }}>
              💡 프로필이 없으면 일기 생성이 안 돼요!
            </p>
          </div>

          {/* Step 2 */}
          <div className="card animate-fade-in-1" style={{ padding: 20 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, var(--secondary), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 900, flexShrink: 0 }}>2</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>사진 올리기</h3>
                <p style={{ fontSize: 12, color: '#A39888' }}>오늘의 사진 한 장이면 충분해요</p>
              </div>
            </div>
            <div style={{ background: 'var(--warm)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>하단 중앙 <b>+ 버튼</b>을 탭하세요</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span><b>촬영</b> 또는 <b>갤러리</b>에서 사진 선택</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>얼굴이 잘 보이는 사진이 좋아요!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="card animate-fade-in-2" style={{ padding: 20 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #34D399, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 900, flexShrink: 0 }}>3</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>AI 일기 생성</h3>
                <p style={{ fontSize: 12, color: '#A39888' }}>✨ 버튼 하나로 자동 완성</p>
              </div>
            </div>
            <div style={{ background: 'var(--warm)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span><b>AI 일기 생성하기</b> 버튼 탭</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>10~20초 후 일기가 자동 생성돼요</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>감정 태그(#해피, #졸림 등)도 자동 분석</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span><b>저장하기</b>를 눌러 일기를 기록하세요</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="card animate-fade-in-3" style={{ padding: 20 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #38BDF8, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 15, fontWeight: 900, flexShrink: 0 }}>4</div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>일기 모아보기</h3>
                <p style={{ fontSize: 12, color: '#A39888' }}>홈에서 타임라인 확인</p>
              </div>
            </div>
            <div style={{ background: 'var(--warm)', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>홈 화면에서 모든 일기를 볼 수 있어요</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>연속 기록일수와 통계도 확인 가능</span>
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: '#6B5E52' }}>
                  <span>👉</span> <span>삭제는 일기 카드 우측 하단 🗑 아이콘</span>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="card animate-fade-in-4" style={{ padding: 20 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>❓</span>
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>자주 묻는 질문</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { q: '사진이 서버에 저장되나요?', a: '아니요! 모든 데이터는 기기 내 IndexedDB에만 저장됩니다. 서버로 전송되지 않아요.' },
                { q: '여러 반려동물도 가능한가요?', a: '현재는 하나의 프로필만 지원합니다. 추후 업데이트에서 다중 프로필을 지원할 예정이에요.' },
                { q: '인터넷 없이도 되나요?', a: 'AI 일기 생성에는 인터넷이 필요하지만, 기존 일기 보기는 오프라인에서도 가능해요.' },
                { q: '무료인가요?', a: '네! 완전 무료이며 회원가입도 필요 없어요.' },
                { q: '홈 화면에 추가할 수 있나요?', a: '네! 브라우저 메뉴에서 "홈 화면에 추가"를 선택하면 앱처럼 사용할 수 있어요.' },
              ].map((faq, i) => (
                <div key={i}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>Q. {faq.q}</p>
                  <p style={{ fontSize: 13, color: '#8A7E74', lineHeight: 1.6 }}>A. {faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PWA Install */}
          <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, var(--warm), rgba(249,168,212,0.1))' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>📱</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>앱처럼 사용하기</h3>
                <p style={{ fontSize: 12, color: '#A39888' }}>홈 화면에 추가하세요</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 13, color: '#6B5E52' }}>
                <b>Android:</b> Chrome → ⋮ 메뉴 → "홈 화면에 추가"
              </div>
              <div style={{ fontSize: 13, color: '#6B5E52' }}>
                <b>iPhone:</b> Safari → 공유 버튼(↑) → "홈 화면에 추가"
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <a href="/" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
              ← 홈으로 돌아가기
            </a>
            <p style={{ fontSize: 10, color: '#E0DCD6', marginTop: 12 }}>멍냥로그 v1.0 · LightOn Plus Lab</p>
          </div>
        </div>
      </div>
    </div>
  );
}
