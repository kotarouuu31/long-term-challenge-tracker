# LongTermChallengeTracker

長期的なチャレンジの進捗を管理するためのReact Nativeアプリケーション。

## 管理するチャレンジ

1. 筋トレ（ワンパンマントレーニング）- 3年間継続目標
2. ピアノ練習 - 3年間継続目標
3. ストレッチ - 3年間継続目標
4. DJ練習 - 10000時間達成目標

## 機能

- 4つのチャレンジを表示するホーム画面
- 各チャレンジの「今日実行した」を記録するボタン
- 各チャレンジの継続日数表示
- 明るく前向きな色使いのUI
- React Navigation基本設定

## 技術スタック

- React Native (Expo)
- TypeScript
- React Navigation
- AsyncStorage (データ保存)

## 実行方法

```bash
# 依存関係のインストール
npm install

# iOSシミュレーターで実行
npm run ios

# Androidエミュレーターで実行
npm run android

# Expoを使って開発サーバーを起動
npm start
```

## プロジェクト構造

```
LongTermChallengeTracker/
├── App.tsx              # メインアプリケーションコンポーネント
├── src/
│   ├── components/      # 再利用可能なコンポーネント
│   │   └── ChallengeCard.tsx
│   ├── screens/         # 画面コンポーネント
│   │   └── HomeScreen.tsx
│   ├── types/           # TypeScript型定義
│   │   └── index.ts
│   └── utils/           # ユーティリティ関数
│       └── challengeData.ts
├── assets/              # 画像やフォントなどのアセット
└── package.json         # プロジェクト依存関係
```
