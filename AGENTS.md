# PHENOMENA — 開発規則

[Foundation共通規則](https://github.com/ShimaBell0619/web-app-foundation/blob/861a240fc6d344cfab654aaf93a922f1069f97aa/AGENTS.md) を取得して適用します。日本語標準、Chat-first、Workは明示指示のみ、承認・最小権限・品質境界を維持します。

- [PRODUCT.md](PRODUCT.md) は製品、[DESIGN.md](DESIGN.md) はUIの正本です。利用方法は [README.md](README.md)、証拠は [検証記録](docs/VERIFICATION.md) に記載します。
- 明示依頼なしにWAVES／MOTION、認証、backend、analytics、有料serviceを追加しません。
- 正確なmain SHAから短命branchを作り、PR・最終HEADのCI・自己レビューで作業します。直接mainへの通常書き込みやforce pushをしません。高リスクは可能な限り独立レビューを得ます。@codex reviewは毎回別の承認が必要で、自動reviewはOFFです。
- main保護／rulesetはOwner方針により必須にしません。Controlled Kitの安全条件を緩めません。
- React／TypeScript／Vite／npmを維持し、純粋なNewtonian solver、描画、cameraを分離します。cameraで物理状態を変えません。
- npm ci／check／typecheck／test／build／test:e2eを実行し、重要変更後は再検証します。アプリ固有の主要操作と320／390／1440pxを実Chromiumで確認します。
- 製品契約、認証・権限・秘密、課金、外部送信、公開URL、保存・不可逆動作・公開信頼境界の新しい変更には明示判断を得ます。承認済み範囲の判断を繰り返しません。
- ソース、CI、READY、HTTP、実ブラウザを区別し、未実施を成功としません。Public repo・Issue・PR・log・browser bundleへ秘密を置きません。
