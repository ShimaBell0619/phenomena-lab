# PHENOMENA — 製品契約

状態：GRAVITYの製品契約（2026-10-10）。今回のFoundation採用更新で物理モデル・機能を変更しません。

## 1. 目的

ブラウザで初期条件を変え、その結果の運動を発見できる物理実験室です。結果を台本で選ぶアプリではありません。モデルは単純化した再現可能な近似であり、科学的予測や実際の太陽系モデルを提供しません。最初の成果物は2次元重力実験GRAVITYです。WAVES／MOTIONは将来構想で、動かないタブとして表示しません。

## 2. 利用者と作業

初めて訪れる人はすぐ軌道を見て条件変更の効果を理解できます。探索する人はpointer／touchで物体を作り、初期条件・時間・再試行を操作します。学習する人は質量・位置・速度・軌跡を調べ、同じ初期状態を比較します。keyboard利用者はCanvasのドラッグに依存せず追加・選択・編集・再生・resetできます。必須のtutorial、account、長い準備は不要です。

## 3. GRAVITYの範囲

### 初回表示とプリセット

- Single Orbitを初回から動かします。Single Orbit／Binary Dance／Three-Bodyは固定・版管理されたデータです。Three-Bodyの安定軌道は保証しません。resetは元の数値へ戻します。
- 空き領域をドラッグして物体を発射できる案内を示し、実験をmodal tutorialで隠しません。
- Single Orbitは質量800と5、距離160の独自単位を使います。相対円軌道速度は `v = sqrt(G × (800 + 5) × 160² / (160² + epsilon²)^(3/2))`。静止重心の周囲へ位置と逆向き接線速度を配分します。再現用fixtureであり厳密な解析軌道の保証ではありません。
- 再生／停止、停止中の1物理step、0.5×／1×／2×、選択presetのresetを提供します。

### 直接操作と編集

空き領域のpointer-downで追加位置を決め、dragで初速の矢印、releaseで発射します。初速はworld座標から計算し、zoomで物理量を変えません。click／tapで物体を選び、label付きフォームで質量・位置・速度を調べて編集できます。停止中のdragは位置移動、再生中は選択だけです。keyboard／touch用の追加フォームはx／y／vx／vy／massを扱います。

1〜16体に対応し、上限超過を部分変更せず説明します。重なった物体も一貫したpickingと一覧から選べます。変更済み実験のreset／保存済み実験のload前に、未保存状態を置き換えることを明示します。

### 物理契約

- 質量・距離に基づく2D Newtonian N-bodyの対相互作用です。近接時をsofteningで有限に保ちます。単位は実験室独自で、kg・現実の天文距離・SI測定値として表示しません。
- `G = 1000`、`epsilon = 4`、`dt = 1/120` 秒、**velocity Verlet**を正本とします。定数変更には製品判断とtestが必要です。camera座標変換は積分から独立します。
- 円が重なると合体し、全質量・線形運動量を保存し、重心位置へ移します。半径は `min(30, 2 + 0.5 × sqrt(mass))`。実際の惑星サイズではなく単純化したモデルです。衝突時のenergy保存は保証しません。
- 動きは計算し、同じ直列化初期条件・定数・step数は同じ実装／runtimeで同じ状態を再現します。testでは必要な数値許容差を使います。
- fixed stepと描画を分離します。非表示tabや大きなframe間隔から復帰しても大量の追いつき計算をせず、1frameのstepを制限します。
- 非有限値などの不正状態は停止し、復帰可能なエラーを表示します。不正軌跡を描画・保存しません。

### 観察と保存

軌跡は履歴を制限し、軌跡／速度vectorの表示変更は物理状態を変えません。時刻・物体数・選択物体を文字で表示します。pan／zoomはcameraだけを変え、全体表示で復帰できます。説明には独自単位、近接・合体・有限stepの近似を記載します。

account、cloud DB、tracking、外部物理APIは不要です。LocalStorageに名前付き実験を一つ保存し、step境界の物理状態・設定・preset・schema版を含めます。loadはsnapshot、resetはpreset初期値を復元します。load時はschemaと数値範囲を検査し、欠落・破損・未対応旧版から短いエラーと新presetへ復帰できます。save／loadはnetworkを使わず、別端末への同期やstorage削除後の保持は保証しません。

## 4. 制約

- Public GitHub repositoryとVercelを使い、password・token・private dataを置きません。
- React／TypeScript／Vite／npm、Canvas 2DとアクセシブルなHTML操作です。MVPではbackend、認証、有料engine、WebGL、Web Workerは不要です。
- Owner方針により、この非クリティカルなPublicアプリでmain保護／rulesetを必須にしません。PR・CI・最小権限で作業します。通常PRを自動配備せず、Simple標準Git連携のProductionはmainだけです。GitHub CI成功を待つ保証はありません。保護済みmainを必要とする特権Hosted Review Kitは未導入です。
- 動作中の主要simulationは同梱コード・assetだけで動きます。完全offline／PWAは約束しません。
- 主要操作はkeyboardとaccessible labelに対応し、Canvasと同等の一覧・数値編集を提供します。不要なUI motionはreduced-motionを尊重し、必要な物理motionは停止できます。
- 320／390／1440pxで必須操作を隠しません。最大16体、軌跡は目安240 samples／体までに制限します。実FPS・memoryはブラウザで測定し、全端末の一定FPSを約束しません。

## 5. 非対象

WAVES／MOTIONの実装、機械joint・rigid-body積層、現実の軌道暦・相対論・科学研究精度、変形衝突・流体・3D、multiplayer、account、共有link、community、cloud save、import／export、telemetry／analytics、AI解説、有料API、backend／DB／native app、将来用の大きな物理frameworkは対象外です。

将来のWAVESは2点源と周波数／波長／位相による2D干渉を、明示した解析モデルから始めます。未実装PDE解法を主張しません。MOTIONは振り子かspring-mass、減衰・外力・時間操作を別途選びます。共通操作の共有は実際の必要性が生まれた後に行い、無関係なsolverを先に抽象化しません。

## 6. 受け入れ条件

| ID | 条件 |
| --- | --- |
| P-01 | 初回Single Orbitがdesktop／mobile実ブラウザで描画・運動する |
| P-02 | pointer／touch発射とkeyboardフォームが同じworld座標で同じ状態を作る |
| P-03 | 対力・反作用・再現軌道・fixed-step決定性・有限値を単体testする |
| P-04 | 合体の質量・線形運動量を許容差内で保存し、resetで元を再現する |
| P-05 | 停止で時刻固定、1stepは正確なdt、倍率は時間率だけ変更、非表示復帰で飛ばない |
| P-06 | 16体上限、不正数値、近接・重複選択でcrash／NaN保存しない |
| P-07 | save→reload→load、破損復帰、snapshotとpresetの区別を確認する |
| P-08 | keyboard追加／編集／選択／reset／再生、見えるfocus、label・error・停止を確認する |
| P-09 | 320／390／1440pxで横overflow・必須操作の欠落がなく、touch対象が使える |
| P-10 | branch／PR、正確なSHA、実npm ci／check／typecheck／test／build／代表E2Eの証拠 |
| P-11 | Preview／Stagingは別途安全な方式を設計するまで未達。未保護mainで特権Kitを起動しない |
| P-12 | P-11に関するnegative CI/CDは保留。通常PR CIと不要branch配備禁止は確認する |
| P-13 | CI後のmainマージ、Production配備、公開版の実ブラウザを確認する |

CI成功、HTTP、READY、実画面は別の証拠です。未実施の性能・端末・外部環境検査を単体testから推測しません。

## 7. 変更の規則

現在の製品動作はこの文書、UIはDESIGN、開発はAGENTSを正本とします。MVPはGRAVITYと上記検査です。将来labには固有モデル・精度・受け入れ条件が必要です。定数、合体、保存互換性、外部動作変更は判断とtestを必要とします。版付きGitHub Releaseは明示依頼時だけ実施し、Productionだけで版付きrelease完了とは扱いません。
