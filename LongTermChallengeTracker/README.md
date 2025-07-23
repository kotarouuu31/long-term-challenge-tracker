# LongTermChallengeTracker

# 🏆 LongTermChallengeTracker

長期的な習慣形成をサポートする、モチベーション維持に特化したReact Nativeアプリケーション。

![App Preview](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.74-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Expo](https://img.shields.io/badge/Expo-53.0-black)

## 🎯 管理するチャレンジ

| チャレンジ | 目標 | アイコン |
|-----------|------|----------|
| **筋トレ** | ワンパンマントレーニング - 3年間継続 | 💪 |
| **ピアノ練習** | 毎日のピアノ練習 - 3年間継続 | 🎹 |
| **ストレッチ** | 毎日のストレッチ - 3年間継続 | 🧘 |
| **DJ練習** | DJスキルの向上 - 継続的な練習 | 🎧 |

## ✨ 主要機能

### 🏠 **シンプルなホーム画面**
- 4つのチャレンジの今日の達成状況（✅/⬜）
- 累計ポイント表示
- 次の報酬までの進捗バー
- 各チャレンジの詳細画面へのナビゲーション

### 🎁 **カスタマイズ可能な報酬システム**
- **100ptごとの報酬設定**: 自由にタイトル・説明を設定
- **1000pt以降の無制限追加**: 好きなポイント数で報酬を追加・削除
- **動的表示**: 現在のポイント以降の報酬のみ表示
- **重複チェック**: 既存報酬との重複を防止
- **プログレスバー**: 次の報酬までの進捗を視覚化

### 📊 **各チャレンジ画面**
- 総完了日数・現在のストリーク表示
- 「今日完了」ボタンで簡単記録
- 報酬達成時の祝福メッセージ
- シンプルで使いやすいUI

### 💾 **データ永続化**
- AsyncStorageによる完全なローカルデータ保存
- 完了状況・ポイント・報酬データの永続化
- オフライン対応

## 🚀 技術スタック

### **フロントエンド**
- **React Native** (0.74) - クロスプラットフォーム開発
- **TypeScript** (5.0) - 型安全性とコード品質向上
- **Expo** (53.0) - 開発・ビルド・デプロイの効率化

### **ナビゲーション**
- **React Navigation** (6.x) - ネイティブスタックナビゲーション
- **Bottom Tabs Navigator** - タブベースのナビゲーション

### **データ管理**
- **AsyncStorage** - ローカルデータの永続化
- **TypeScript型定義** - 型安全なデータ管理

### **UI/UX**
- **React Native Components** - ネイティブUI要素
- **カスタムスタイリング** - 美しく直感的なデザイン
- **プログレスバー** - 視覚的フィードバック

## 📱 インストール・使用方法

### **前提条件**
- Node.js (18.x以上)
- npm または yarn
- Expo CLI

### **セットアップ**
```bash
# リポジトリをクローン
git clone https://github.com/your-username/long-term-challenge-tracker.git
cd long-term-challenge-tracker/LongTermChallengeTracker

# 依存関係をインストール
npm install

# 開発サーバーを起動
npx expo start
```

### **使用方法**

#### **Web版（推奨）**
```bash
# Web版で起動
npx expo start --web

# ブラウザで http://localhost:8083 にアクセス
```

#### **モバイル版**
```bash
# 開発サーバー起動
npx expo start

# Expo Goアプリでスキャン、または
# iOS Simulator / Android Emulator で起動
```

#### **PWA（ホーム画面追加）**
1. スマホのブラウザで `http://[YOUR_IP]:8083` にアクセス
2. **iPhone**: 共有ボタン → 「ホーム画面に追加」
3. **Android**: メニュー → 「ホーム画面に追加」

## 🎮 使い方

### **基本的な流れ**
1. **ホーム画面**: 今日の達成状況と累計ポイントを確認
2. **チャレンジ実行**: 各チャレンジを完了したら「今日完了」ボタンをタップ
3. **報酬設定**: 「報酬設定」ボタンから自分だけの報酬を設定
4. **報酬達成**: 100ptごとに設定した報酬の祝福メッセージが表示
5. **継続**: 毎日の習慣として継続し、長期目標を達成

### **報酬システムの活用**
- **100pt〜1000pt**: デフォルト報酬を編集してカスタマイズ
- **1000pt以降**: 無制限に新しい報酬を追加・削除可能
- **例**: 1150pt「好きなケーキを買う」、1300pt「映画を見る」など

## 🏗️ プロジェクト構造

```
LongTermChallengeTracker/
├── src/
│   ├── components/          # 再利用可能なコンポーネント
│   ├── screens/            # 画面コンポーネント
│   │   ├── HomeScreen.tsx  # メイン画面
│   │   ├── RewardsScreen.tsx # 報酬設定画面
│   │   ├── WorkoutScreen.tsx # 筋トレ画面
│   │   ├── PianoScreen.tsx   # ピアノ画面
│   │   ├── StretchScreen.tsx # ストレッチ画面
│   │   └── DjScreen.tsx      # DJ練習画面
│   ├── types/              # TypeScript型定義
│   │   └── index.ts        # 共通型定義
│   └── utils/              # ユーティリティ関数
├── App.tsx                 # アプリのエントリーポイント
├── package.json           # 依存関係とスクリプト
└── README.md              # このファイル
```

## 🎯 主要な設計思想

### **シンプルさ重視**
- 複雑な機能を排除し、本質的な習慣形成に集中
- 直感的で迷わないUI/UX
- 最小限のタップで完了記録

### **モチベーション維持**
- カスタマイズ可能な報酬システム
- 視覚的な進捗フィードバック
- 達成時の祝福演出

### **長期継続性**
- オフライン対応でいつでも使用可能
- データの永続化で記録が失われない
- PWA対応でアプリのような使用感

## 🔧 カスタマイズ

### **新しいチャレンジの追加**
1. `src/types/index.ts` にチャレンジタイプを追加
2. `src/screens/HomeScreen.tsx` のチャレンジリストに追加
3. 新しいチャレンジ画面を作成
4. `App.tsx` にナビゲーションを追加

### **報酬システムの拡張**
- `src/screens/RewardsScreen.tsx` で報酬ロジックをカスタマイズ
- AsyncStorageキーを変更してデータ構造を拡張

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- **React Native Community** - 素晴らしいフレームワークとエコシステム
- **Expo Team** - 開発体験の向上
- **長期習慣形成を目指すすべての人** - このアプリの存在意義

---

**🎯 長期的な目標達成に向けて、一歩ずつ前進しましょう！**

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
