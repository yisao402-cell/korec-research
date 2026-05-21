# KOREC 初回商談前リサーチツール

KOREC RA メンバー向けの商談前リサーチツール。Claude API + Web検索で企業情報を自動収集します。

## 使い方

1. ページを開く
2. 初回のみ：⚙️ 設定 → Anthropic API key を入力して保存
   - API key は [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys) で発行
   - API key はブラウザの localStorage に保存（外部送信なし）
3. 企業名・URL・担当者を入力して「全て実行」

## 出力内容

1. **基本リサーチ** — 企業概要・ニュース・採用状況（中途／新卒分離）・経営層・刺さる切り口
2. **採用課題の深掘り** — 中途／新卒それぞれの課題・KOREC強み領域・初回質問リスト
3. **担当者リサーチ** — 経歴・発信内容・関心領域・話題作り素材・地雷ワード
4. **競合・代替手段** — 中途／新卒の使用媒体・KORECの隙間・他社じゃダメな理由

## コスト目安

- Sonnet 4.6 + Web検索：1企業あたり概ね $0.1〜0.3
- Opus 4.7：その3〜4倍

## 注意

- API key は各メンバー個別に発行してください（共有不可）
- 共有PCでは使わないでください（localStorage に key が残るため）
