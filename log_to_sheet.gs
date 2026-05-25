/**
 * KOREC リサーチツール 利用ログ集約用 Apps Script
 *
 * 役割: ツールで「全て実行」が押されたタイミングで送信されてくるログを
 *       紐付けたスプレッドシートに1行ずつ追記する。
 *
 * 記録される項目: 受信日時 / 企業名 / 企業URL / 商談相手・役職 / 商談相手・名前
 *
 * デプロイ手順:
 *   1. ターゲットのスプレッドシートを開く
 *      https://docs.google.com/spreadsheets/d/1FF7n6Y177NkeA_xobRHk9UNk36dwXMMXAwRJ1yVJzOg/edit
 *   2. メニュー: 拡張機能 → Apps Script を開く
 *   3. デフォルトの Code.gs を全削除し、このファイルの中身を全て貼り付け
 *   4. プロジェクト名を「KOREC Research Logger」に変更（左上）
 *   5. 保存（💾アイコン or ⌘S）
 *   6. 右上「デプロイ」→「新しいデプロイ」
 *      - 種類（歯車アイコン）: ウェブアプリ
 *      - 説明: KOREC research tool logger
 *      - 次のユーザーとして実行: 自分
 *      - アクセスできるユーザー: 全員（必須）
 *      - 「デプロイ」をクリック
 *   7. アクセス権限の確認（自分のGoogleアカウントで承認）
 *   8. デプロイ完了画面に表示される「ウェブアプリのURL」をコピー
 *      （https://script.google.com/macros/s/XXXXX.../exec の形）
 *   9. このURLを HTML 内の LOG_ENDPOINT 定数に貼り付ける
 *
 * 補足: 既存シートに書き込みたい場合は SHEET_NAME を該当シート名に変更
 */

const SHEET_NAME = 'log'; // ログを書き込むシート名（無ければ自動作成）

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // ヘッダ行（初回のみ追加）
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        '受信日時(JST)',
        '企業名',
        '企業URL',
        '商談相手・役職',
        '商談相手・名前',
      ]);
      // ヘッダ装飾
      const headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setBackground('#0071e3').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 5);
    }

    sheet.appendRow([
      new Date(),
      data.company || '',
      data.url || '',
      data.role || '',
      data.name || '',
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GETで動作確認できるようにする
function doGet(e) {
  return ContentService
    .createTextOutput('KOREC research logger is running. POST only.')
    .setMimeType(ContentService.MimeType.TEXT);
}
