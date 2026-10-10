import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App(): React.JSX.Element {
  return (
    <main className="layout">
      <header className="masthead">
        <div className="brand">PHENOMENA <span className="divider">/</span> GRAVITY</div>
        <span className="status">Phase 3 · foundation setup</span>
      </header>
      <section className="intro" aria-labelledby="page-title">
        <span className="eyebrow">INTERACTIVE PHYSICS LABORATORY</span>
        <h1 id="page-title">物理法則を、手で操る。</h1>
        <p>実験室の準備が整いました。重力シミュレーションは次の開発フェーズで実装します。</p>
        <p className="notice" role="status">現在の画面は開発基盤の確認用です。物理演算はまだ実行していません。</p>
      </section>
      <footer>Foundation v0.12.1 adoption starter · no external physics service</footer>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('missing application root');
createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
