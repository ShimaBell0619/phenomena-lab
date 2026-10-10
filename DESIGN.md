---
version: alpha
name: PHENOMENA
description: ブラウザで操作する物理実験室の表示と操作の設計。
---

# PHENOMENA — Design System

## Overview

方針：現代の博物館にある暗く精密な科学装置として、物理現象を中心に置きます。space shooterや汎用analytics画面にせず、Canvasを主役、操作は明確で控えめ、数値は信頼できる読み取りとして扱います。操作と物理結果の関係をすぐ読めるようにします。初版はGRAVITYだけで、WAVES／MOTIONを空の行先にしません。

第一に軌道と軌跡、次に短い操作案内、常に到達できる時間操作、その次に質量・位置・速度、最後にモデルの説明を置きます。実験の上にmarketing hero、等分KPI、装飾neon gradient、必須onboarding overlayを置きません。

## Colors

初版はdarkのみです。未検証light toggleを追加しません。

| Token | 値 | 用途 |
| --- | --- | --- |
| --background | #080D16 | 実験室の背景 |
| --surface | #111C2B | inspector・header・panel |
| --surface-raised | #1B2A3B | hover・選択・重なった操作 |
| --border | #354759 | 構造の境界と部品の輪郭 |
| --text | #F0F5F7 | 必須の文字 |
| --text-muted | #B4C4CF | 補助label・単位 |
| --accent | #78E6D1 | 選択・明示操作・軌跡強調 |
| --accent-secondary | #AC9BFF | 補助物体・軌跡 |
| --warm | #F2BB79 | 基準質量・軌道中心 |
| --danger | #FF9AA2 | 不正状態・破壊的操作の警告 |
| --focus | #FFE2A3 | keyboard focus |

実際の組合せでWCAG AAの通常文字4.5:1、必要な非文字UI3:1を確認します。全組合せの達成をtoken表だけから主張しません。errorと選択は文字・形でも伝えます。Canvasは濃紺と控えめなgrid（狭幅では既定非表示）、任意vectorはmint矢印、軌跡はcopper／mint／lilacと減衰opacity・制限履歴を使います。軌跡をglowで隠さず、物体IDと状態は文字でも読めます。

## Typography

UIは `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans JP", sans-serif`、数値は `ui-monospace, "SFMono-Regular", Consolas, monospace` とtabular numerals・一貫した符号／小数表示を使います。

主見出し20〜24px／weight650、section15〜17px／600、本文14〜16px、label・metadata12〜13pxを目安にし、必須操作を12px未満へ頼らせません。日本語labelと単位付き数値を使います（質量800［モデル単位］、速度vx +24.50／vy −6.10［単位/秒］）。brandingのPHENOMENA以外で不要な大文字microcopyを増やしません。

## Layout

| 幅 | 構成と優先順位 |
| --- | --- |
| desktop（約1024px以上） | 控えめなheader、68〜75%の主Canvas、300〜360pxのinspector、一貫した時間操作bar |
| 390／320px | compact header、約42〜52vhで可能なら最低240pxのCanvas、時間操作、通常scrollのinspector |

位置・速度・物体数・時刻の更新でpanel幅を揺らしません。選択は控えめなreticleで示します。mobileでも再生／停止・reset・追加・選択物体・数値編集を維持し、任意gridや装飾から減らします。Canvasだけに意図したtouch-actionを設定してpage scrollと区別します。グループの開閉は使えますが基本操作を全画面overlayへ閉じ込めません。320pxのtoolbarは2行へ折返し、横scrollを主操作にしません。

## Elevation & Depth

sceneは奥、inspectorは境界と少し異なる面で区別します。同時にtooltip／popover／確認は一つとし、modalは未保存状態の置換など必要な操作だけです。全体glassや強いblurでCanvas・文字のコントラストを下げません。

## Shapes

inputは6px、panel／dialogは10pxの角丸を基準にします。丸は物理物体や意味のあるtoggleだけに使います。物体半径は質量から決定的に制限付きで計算し、選択ring／crosshairで本体を隠しません。軌跡のjoinは丸め、alphaを減衰し、数値は安定した表示にします。

## Components

- 空きCanvasのpointer-down→初速矢印→releaseで発射します。ghostと破線vector、質量・概算速度は軌跡を隠さず関係を示します。
- click／tapの選択をinspectorと一覧へ反映します。停止中はdrag移動、再生中は選択だけで、hintでも区別します。
- 精度が必要な数値は単位・label付きフォームにし、sliderだけにしません。zoom／panはcameraだけで、全体表示で戻れます。preset切替でfitしても常時の再frameは避けます。
- 軌跡／vectorのlegendと非表示操作を提供し、物体は文字で区別します。
- 再生／停止buttonは動作と状態を文字でも示します。再生中のstepはdisabled、倍率の選択状態を示します。
- inputの範囲を制限し、inline errorを表示します。不正値はmodelを変更しません。save結果を確認し、load／resetは未保存置換を警告します。保存labelを人が読めるものにし、cloud同期と誤認させません。
- モデル説明には独自単位、積分、softening、合体を平易に記載します。errorは時間を止め、presetへ戻れる操作を示し、空画面や無言の再起動にしません。
- 必須物理motionは停止・倍率・stepで操作できます。UI motionは150ms以下を目安に控えめにし、prefers-reduced-motionで減らします。描画補間をsolverへ戻しません。
- Canvasのaccessible labelとkeyboard案内、構造化した物体一覧、label付き追加／編集フォーム、見えるfocus、名前、明確なdisabledを維持します。毎frameの座標をlive announcementしません。停止・reset・save・errorの離散結果は控えめに通知します。
- touch対象は約44×44pxを目安にし、標準zoom／文字拡大でinputを切りません。

## 描画の受け入れとQA

初回軌道、停止、数値追加、pointer／touch発射、選択、未保存reset、save／load、不正値、16体、破損保存を必要な範囲で実ブラウザ確認します。1440／390／320pxと低めのmobile高さ、Tab／Shift+Tab／Enter／Escape、accessible name、Canvasの代替操作、200%zoom、日本語の長いlabel・fallback・数値・error折返しを点検します。

画像／traceはcode SHA、URL、viewport、runと関連付けます。build、HTTP、READYとは区別します。代表物体数／軌跡数の性能を測り、計算基盤を増やす前に重い視覚効果を減らします。未実施条件は検証文書へ残します。

## Do's and Don'ts

現象と因果を優先し、再現preset、読める数値、主要操作、モデル限界を確認します。台本軌道を物理と呼ぶ、演出だけの3D、全面gradient／card、色だけの正誤、第二lab前の共通framework、未実装placeholder公開は行いません。
