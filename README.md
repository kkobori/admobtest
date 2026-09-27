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
node scripts/patch-admob-manifest.js
npx cap sync android
npx cap open android
```

Android Studio が開いたら「Build」→「Generate Signed Bundle / APK」で署名済みAPK/AABを生成できます。

## 方法C: コマンドラインだけでビルド

```
npm install
npx cap add android
node scripts/patch-admob-manifest.js
npx cap sync android
cd android
chmod +x gradlew
./gradlew assembleDebug     # APK (デバッグ)
./gradlew bundleRelease     # AAB (リリース・未署名)
```

## 重要: AdMob アプリIDの設定について

`npx cap add android` は android/ フォルダを毎回まっさらに作り直すため、
AndroidManifest.xml や strings.xml を直接手で編集しても次のビルドで消えてしまいます。
そのため `scripts/patch-admob-manifest.js` が admob-config.json の内容を毎回自動で
書き込む仕組みになっています（GitHub Actionsでも自動実行されます）。

- AdMobアプリIDは、生成前の設定画面の「AdMob アプリID」欄に入力してからZIPを
  作り直してください（`admob-config.json` に保存されます）。
- アプリIDが未入力のままだと、Google公式のサンプル用アプリID（テスト広告専用）が
  自動的に書き込まれます。この場合、アプリは正常動作しますが実際の広告（本番ID）は出ません。
- GitHub Actionsのビルドログで「Patch AdMob AndroidManifest.xml / strings.xml」の
  ステップに `[patch-admob] 完了: appId=...` と表示されていれば書き込み成功です。
