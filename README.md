# admobtest — Android APK/AAB ビルド手順

このプロジェクトは、HSPミニインタプリタから自動生成された Capacitor プロジェクトです。

## 方法A: GitHub Actions でクラウドビルド（おすすめ・ローカル環境不要）

1. GitHub で新規リポジトリを作成（Public / Private どちらでも可）
2. このフォルダの中身をすべて push する
3. GitHub の「Actions」タブを開くと、自動的にビルドが始まります
4. 完了後、ビルド結果のページ下部「Artifacts」から以下をダウンロードできます
   - app-debug-apk … デバッグ用APK（実機テスト用・署名不要）
   - app-release-aab-unsigned … リリース用AAB（要署名）

## 方法B: ローカルで Android Studio を使う

```
npm install
npx cap add android
npx cap sync android
npx cap open android
```

Android Studio が開いたら「Build」→「Generate Signed Bundle / APK」で署名済みAPK/AABを生成できます。

## 方法C: コマンドラインだけでビルド

```
npm install
npx cap add android
npx cap sync android
cd android
chmod +x gradlew
./gradlew assembleDebug     # APK (デバッグ)
./gradlew bundleRelease     # AAB (リリース・未署名)
```

## 重要: AdMob アプリIDの設定

AdMob を使う場合、android/app/src/main/res/values/strings.xml を開いて
次の1行を追記してください（初回の npx cap add android 後）。

  <string name="admob_app_id">ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>

その後 npx cap sync android を再実行してください。
