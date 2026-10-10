# PHENOMENA — 検証記録

GRAVITYの初回実証と、今回のFoundation構成更新を分けて記録します。

## 初回実証（2026-10-10）

| 証拠 | 状態 |
| --- | --- |
| Public repo・Foundation v0.12.1 | [PR #2](https://github.com/ShimaBell0619/phenomena-lab/pull/2)。採用元とCIはb97a0d93cb9f7cedf2c534f1478de95729d6090f |
| 実lockfile | [npm生成run38038122384](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38038122384) |
| 物理・機能 | [PR #4](https://github.com/ShimaBell0619/phenomena-lab/pull/4)、[CI38039425007](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38039425007)。velocity Verlet、1/120s、G=1000、epsilon=4、preset、合体・mass／momentum、snapshot検査 |
| 操作・3画面幅 | [Chromium38039807198](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38039807198)。停止・step・preset・pointer追加・フォーム・編集・save／reload、[Artifact11665476215](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38039807198/artifacts/11665476215) |
| 数値表示・camera fit | [PR #8](https://github.com/ShimaBell0619/phenomena-lab/pull/8)、[Chromium38040040620](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38040040620)。320px画像の目視確認 |
| 初回公開版 | dpl_CM2QeqzM3kotfkGe3ACFbs9joNnu、main5f3965572d8253b4e097451cfa5e00450abaa398。当時の証拠であり最新構成の証拠ではない |
| 公開Chromium | [run38040311778](https://github.com/ShimaBell0619/phenomena-lab/actions/runs/38040311778)。HTTP200、認証wallなし、描画・step・uncaught errorなし |

## Foundation構成更新

| 項目 | 状態 |
| --- | --- |
| 共通規則採用元とCI参照SHA | 861a240fc6d344cfab654aaf93a922f1069f97aa |
| 変更 | 日本語文書、Simple main限定、実lockfileのPlaywright、CI一つで標準ゲート＋E2E |
| 対象・最終CI・画像・自己レビュー | [PR #13](https://github.com/ShimaBell0619/phenomena-lab/pull/13) の最終HEADとrunで記録。変更前のrunを流用しない |
| 公開project | prj_uYjOavIjEJE0T8URagoJLmL2eQBV |
| 公開URL | https://phenomena-lab.vercel.app |
| 更新版のDeployment／source SHA／READY／alias／ブラウザ | PR #13のmain d4e2297ea8eb7015d449abdd373b393f6d188658、Deployment dpl_G5nWw8p1KC8X7g1bmv2NJLRn9JZJのREADY・alias一致を確認。公開ブラウザで停止／step成功後、既存物体の数値適用がstep制約に止まる問題を再現 |

E2Eはアプリ固有のselectorと条件待機を使い、停止の観測区間はブラウザ時計で制御します。公開テストはプロバイダー確認済みDeployment IDとsource SHAを記録します。CIのGITHUB_SHAを公開SHAと推測しません。

## 未実施・保留

16体mobile性能、複数browserのhidden-tab、touch実機、screen reader、一部negative／破損storageの実ブラウザ条件は未実証です。model-level単体testとは区別します。

Ownerはmain保護を希望していません。特権Preview／Staging Kitは未導入で、P-11／P-12は未達です。安全条件を緩めません。WAVES／MOTION、license、backend、AI、cloud、telemetry、有料基盤を追加しません。ソース、CI、READY、HTTP、実ブラウザを別々に扱います。

## 公開後に検出した数値入力の修正

[Issue #14](https://github.com/ShimaBell0619/phenomena-lab/issues/14)：停止した軌道の3桁小数座標とHTMLのstep=0.1が合わず、質量だけの適用も止まりました。これはアプリ固有の入力制約の問題です。stepによる余計な量子化を除き、有限値・min／max・solver検証を維持します。移動中の既存物体を停止して質量を適用する実Chromium回帰を追加します。

最終HEAD、CI run、Production source／Deployment／READY／alias、公開フォームの再検証はIssue #14に紐づく修正PRへ記録します。PR #13の証拠だけでこの修正を成功扱いにしません。
