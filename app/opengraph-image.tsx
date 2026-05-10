import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Prasham // Batcomputer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0E12',
          color: '#E8EDF2',
          padding: '64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'monospace',
          backgroundImage:
            'linear-gradient(to right, #1F2A35 1px, transparent 1px), linear-gradient(to bottom, #1F2A35 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#6B7785', letterSpacing: 4 }}>
          <span>OPERATOR PROFILE //</span>
          <span style={{ color: '#FFB200' }}>SYS // NOMINAL</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 144, fontWeight: 700, lineHeight: 1, color: '#E8EDF2' }}>
            Prasham
          </div>
          <div style={{ marginTop: 24, fontSize: 28, color: '#FFB200', letterSpacing: 1 }}>
            B.Tech ICT @ DAU — VLSI testing, applied ML, computational finance
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, color: '#6B7785', letterSpacing: 4 }}>
          <span>BATCOMPUTER // v1.0</span>
          <span>github.com/Prasham27</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
