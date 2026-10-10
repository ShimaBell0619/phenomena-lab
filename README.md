# PHENOMENA — 触って学ぶ物理実験室

[公開GRAVITY](https://phenomena-lab.vercel.app) は、初期条件を変えて運動を観察する2D Newtonian N-body実験です。WAVES／MOTIONは将来構想です。

Single Orbit／Binary Dance／Three-Bodyを観察し、停止・1/120秒のstep・速度倍率・reset・全体表示を操作できます。空き領域のdragまたは数値フォームで物体を追加し、停止中に選択・編集・位置移動できます。Shift+dragでpan、wheelでzoom、軌跡・速度vectorを切り替え、実験をこのブラウザへ一つ保存／復元できます。

独自単位の近似モデルであり、天文予測ではありません。近接はsoftening、接触は質量・線形運動量を保存した合体です。衝突時のenergyは保存しません。

## 開発

.node-versionのNode 24.20.0とnpmを使います。

```bash
npm ci
npm run check
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run dev
```

実npmのlockfileをコミットします。[CI](.github/workflows/ci.yml) 一つで標準ゲートとアプリ固有Chromium E2Eを実行します。320／390／1440pxと主要操作・keyboard・ブラウザエラーを確認し、成功画像と失敗traceを7日Artifactに残します。OS依存の準備が制限される環境では、準備済み環境か同じCIを利用します。

## 正本と証拠

[PRODUCT.md](PRODUCT.md) は物理・機能・非対象・受け入れ条件、[DESIGN.md](DESIGN.md) はUI、[AGENTS.md](AGENTS.md) は開発、[検証記録](docs/VERIFICATION.md) は実証と未実施項目です。

## 公開と安全性

Publicの [GitHub repository](https://github.com/ShimaBell0619/phenomena-lab) とVercel Hobbyを使います。ライセンスは別途選ぶまで付与しません。Simple標準Git連携のProductionはmainだけです。GitHub CI成功を待つ保証はありません。Owner方針でmain保護を必須にせず、PRとCIを通常手順として使います。

特権Preview／Staging Kitは未導入です。backend、認証、analytics、cloud DB、project secret、有料物理APIは追加しません。公開版はVercelのsource SHA／Deployment／READY／aliasを照合してから実ブラウザを検証します。CIのGITHUB_SHAを公開版SHAへ無条件に転用しません。
