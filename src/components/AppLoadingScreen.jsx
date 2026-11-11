import { useEffect, useState } from 'react';
import { Image } from '@/components/ui/image';

const ICON = 'https://media.base44.com/images/public/6a94d0a4d41cd1f012a10c06/b60ae6e74_generated_image.png';

export default function AppLoadingScreen({ ready = false }) {
  const [minElapsed, setMinElapsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), 1100);
    return () => clearTimeout(t);
  }, []);

  const fadingOut = ready && minElapsed;

  useEffect(() => {
    if (!fadingOut) return;
    const t = setTimeout(() => setDismissed(true), 450);
    return () => clearTimeout(t);
  }, [fadingOut]);

  if (dismissed) return null;

  return (
    <>
      <style>{`
        .ls-pg{position:fixed;inset:0;z-index:9999;overflow:hidden;background:linear-gradient(180deg,#081B33 0%,#0a2a4d 55%,#0b3a66 100%);font-family:"Nunito","Quicksand","Varela Round","Trebuchet MS",ui-rounded,system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;box-sizing:border-box;transition:opacity .45s ease}
        .ls-pg.ls-fade{opacity:0;pointer-events:none}
        .ls-glow{position:absolute;top:-120px;left:50%;margin-left:-160px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.35),rgba(56,189,248,0) 70%);animation:ls-breathe 5s ease-in-out infinite}
        .ls-ray{position:absolute;top:0;width:90px;height:420px;background:linear-gradient(180deg,rgba(240,249,255,.10),rgba(240,249,255,0));transform-origin:top center}
        .ls-r1{left:calc(50% - 141px);transform:rotate(12deg);animation:ls-sway 7s ease-in-out infinite}
        .ls-r2{left:calc(50% + 9px);transform:rotate(-10deg);animation:ls-sway 9s ease-in-out infinite reverse}
        .ls-bub{position:absolute;border-radius:50%;border:1.5px solid rgba(240,249,255,.35);background:rgba(240,249,255,.08);animation:ls-rise 9s linear infinite;opacity:0}
        .ls-b1{width:10px;height:10px;left:calc(50% - 153px);bottom:200px}
        .ls-b2{width:16px;height:16px;left:calc(50% + 129px);bottom:180px;animation-delay:3s}
        .ls-b3{width:8px;height:8px;left:calc(50% + 79px);bottom:220px;animation-delay:6s}
        .ls-b4{width:12px;height:12px;left:calc(50% - 91px);bottom:190px;animation-delay:1.5s}
        .ls-main{position:relative;z-index:2;margin-top:218px;display:flex;flex-direction:column;align-items:center;padding:0 24px;animation:ls-enter 1.1s cubic-bezier(.2,.8,.2,1) both}
        .ls-logowrap{position:relative;width:96px;height:96px;animation:ls-bob 3.6s ease-in-out infinite}
        .ls-halo{position:absolute;inset:-6px;border-radius:34px;background:#38BDF8;opacity:.35;filter:blur(18px);animation:ls-breathe 3.6s ease-in-out infinite}
        .ls-logo{position:relative;display:block;width:96px;height:96px;border-radius:28px;border:1px solid rgba(240,249,255,.35);box-shadow:0 18px 40px rgba(2,12,27,.55)}
        .ls-ttl{margin:26px 0 0;font-size:22px;line-height:1.2;font-weight:800;color:#F0F9FF;letter-spacing:-.2px;text-align:center}
        .ls-sub{margin:6px 0 0;font-size:14px;font-weight:600;color:#38BDF8;text-align:center;letter-spacing:.4px}
        .ls-bar{margin-top:30px;width:160px;height:5px;border-radius:99px;background:rgba(240,249,255,.14);overflow:hidden}
        .ls-bar i{display:block;height:100%;width:34%;border-radius:99px;background:linear-gradient(90deg,#38BDF8,#0284C7);animation:ls-load 1.3s ease-in-out infinite}
        .ls-waves{position:absolute;left:0;right:0;bottom:0;width:100%;height:190px;z-index:1;overflow:hidden}
        .ls-wv{position:absolute;left:0;bottom:0;width:200%;min-width:804px;height:170px}
        .ls-w1{animation:ls-flow 9s linear infinite;opacity:.55}
        .ls-w2{animation:ls-flow 6.5s linear infinite reverse;opacity:.75;bottom:-8px}
        .ls-w3{animation:ls-flow 4.5s linear infinite;bottom:-16px}
        .ls-msg{position:absolute;z-index:3;left:0;right:0;bottom:30px;text-align:center;font-size:12px;font-weight:700;color:#F0F9FF;letter-spacing:.3px;animation:ls-breathe 2.4s ease-in-out infinite}
        @keyframes ls-flow{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes ls-bob{0%,100%{transform:translateY(0) rotate(-1.5deg)}50%{transform:translateY(-12px) rotate(1.5deg)}}
        @keyframes ls-breathe{0%,100%{opacity:.55}50%{opacity:1}}
        @keyframes ls-sway{0%,100%{opacity:.5;transform:rotate(12deg)}50%{opacity:1;transform:rotate(6deg)}}
        @keyframes ls-rise{0%{transform:translateY(0);opacity:0}15%{opacity:.9}100%{transform:translateY(-300px);opacity:0}}
        @keyframes ls-load{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}
        @keyframes ls-enter{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @media (max-height: 650px) { .ls-main { margin-top: 140px; } }
      `}</style>
      <div className={`ls-pg${fadingOut ? ' ls-fade' : ''}`}>
        <div className="ls-glow"></div>
        <div className="ls-ray ls-r1"></div>
        <div className="ls-ray ls-r2"></div>
        <span className="ls-bub ls-b1"></span>
        <span className="ls-bub ls-b2"></span>
        <span className="ls-bub ls-b3"></span>
        <span className="ls-bub ls-b4"></span>
        <div className="ls-main">
          <div className="ls-logowrap">
            <div className="ls-halo"></div>
            <Image className="ls-logo" src={ICON} alt="Escape Tsunami for Developers" />
          </div>
          <h1 className="ls-ttl">Escape Tsunami for Developers</h1>
          <p className="ls-sub">Member Portal</p>
          <div className="ls-bar"><i></i></div>
        </div>
        <div className="ls-waves">
          <svg className="ls-wv ls-w1" viewBox="0 0 804 170" preserveAspectRatio="none">
            <path d="M0 60 C67 20 134 20 201 60 S335 100 402 60 C469 20 536 20 603 60 S737 100 804 60 V170 H0Z" fill="#38BDF8" />
          </svg>
          <svg className="ls-wv ls-w2" viewBox="0 0 804 170" preserveAspectRatio="none">
            <path d="M0 70 C67 105 134 105 201 70 S335 35 402 70 C469 105 536 105 603 70 S737 35 804 70 V170 H0Z" fill="#0284C7" />
          </svg>
          <svg className="ls-wv ls-w3" viewBox="0 0 804 170" preserveAspectRatio="none">
            <path d="M0 85 C50 55 150 55 201 85 S352 115 402 85 C452 55 552 55 603 85 S754 115 804 85 V170 H0Z" fill="#075985" />
          </svg>
        </div>
        <div className="ls-msg">Loading your account…</div>
      </div>
    </>
  );
}