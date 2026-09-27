#!/usr/bin/env node
// scripts/patch-admob-manifest.js
//
// 【なぜこのスクリプトが必要か】
// @capacitor-community/admob は capacitor.config.json 経由の自動設定に対応しておらず、
// android/app/src/main/AndroidManifest.xml と strings.xml に AdMob の
// アプリID(APPLICATION_ID)を手動で追記する必要がある（公式手順）。
//
// しかし本プロジェクトは `npx cap add android` を毎回のビルドで実行しており、
// android/ フォルダはそのたびにまっさらな状態から作り直される(.gitignoreにも含まれる)。
// そのため一度だけ手で編集しても次のビルドで消えてしまい、AdMobの初期化が
// 常に失敗する（＝広告が絶対に表示されない）原因になっていた。
//
// このスクリプトを `npx cap add android` の直後・ビルドの前に必ず実行することで、
// admob-config.json に保存された値を毎回自動的に書き込む。

const fs = require('fs');
const path = require('path');

// AdMobの公式サンプルアプリID（テスト用）。
// アプリIDが未設定のままビルドされて『空文字列』が書き込まれるのを防ぐための保険。
const GOOGLE_SAMPLE_APP_ID = 'ca-app-pub-3940256099942544~3347511713';

function readAdMobAppId() {
  const cfgPath = path.join(__dirname, '..', 'admob-config.json');
  try {
    const raw = fs.readFileSync(cfgPath, 'utf8');
    const cfg = JSON.parse(raw);
    return (cfg && cfg.adMobAppId) ? String(cfg.adMobAppId).trim() : '';
  } catch (e) {
    console.warn('[patch-admob] admob-config.json の読み込みに失敗: ' + e.message);
    return '';
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function patchStringsXml(appId) {
  const p = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
  if (!fs.existsSync(p)) {
    console.error('[patch-admob] strings.xml が見つかりません: ' + p);
    console.error('[patch-admob] → このスクリプトは `npx cap add android` の後に実行してください。');
    return false;
  }
  let xml = fs.readFileSync(p, 'utf8');
  const line = '    <string name="admob_app_id">' + escapeXml(appId) + '</string>';

  if (/<string\s+name="admob_app_id">[^<]*<\/string>/.test(xml)) {
    xml = xml.replace(/<string\s+name="admob_app_id">[^<]*<\/string>/, line.trim());
  } else if (xml.indexOf('</resources>') !== -1) {
    xml = xml.replace('</resources>', line + '\n</resources>');
  } else {
    console.error('[patch-admob] strings.xml に </resources> が見つかりません。');
    return false;
  }
  fs.writeFileSync(p, xml, 'utf8');
  return true;
}

function patchAndroidManifest() {
  const p = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!fs.existsSync(p)) {
    console.error('[patch-admob] AndroidManifest.xml が見つかりません: ' + p);
    console.error('[patch-admob] → このスクリプトは `npx cap add android` の後に実行してください。');
    return false;
  }
  let xml = fs.readFileSync(p, 'utf8');

  if (xml.indexOf('com.google.android.gms.ads.APPLICATION_ID') !== -1) {
    console.log('[patch-admob] AndroidManifest.xml には既にAPPLICATION_IDのmeta-dataがあります。スキップします。');
    return true;
  }
  const metaTag = '        <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="@string/admob_app_id"/>';
  if (xml.indexOf('</application>') === -1) {
    console.error('[patch-admob] AndroidManifest.xml に </application> が見つかりません。');
    return false;
  }
  xml = xml.replace('</application>', metaTag + '\n    </application>');
  fs.writeFileSync(p, xml, 'utf8');
  return true;
}

function main() {
  const appId = readAdMobAppId();
  if (!appId) {
    console.warn('[patch-admob] AdMobアプリIDが未設定です（admob-config.json の adMobAppId が空）。');
    console.warn('[patch-admob] Googleのサンプル用アプリID(テスト表示専用)を代わりに書き込みます。');
    console.warn('[patch-admob] 実際に広告を出すには、設定画面でAdMobアプリIDを入力してZIPを作り直してください。');
  }
  const okStrings = patchStringsXml(appId || GOOGLE_SAMPLE_APP_ID);
  const okManifest = patchAndroidManifest();

  if (okStrings && okManifest) {
    console.log('[patch-admob] 完了: appId=' + (appId || '(未設定・サンプルIDを使用)'));
  } else {
    console.error('[patch-admob] AdMob設定の自動書き込みに失敗しました。上のログを確認してください。');
    process.exit(1);
  }
}

main();
