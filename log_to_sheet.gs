/**
 * KOREC リサーチツール 利用ログ集約用 Apps Script
 *
 * 役割: ツール（HTML）から送信されてくる利用ログを、紐付けたスプレッドシートに1行ずつ追記する。
 *
 * デプロイ手順:
 *   1. 専用のGoogleスプレッドシートを新規作成（名前例: "KOREC_リサーチツール利用ログ"）
 *   2. メニュー: 拡張機能 → Apps Script を開く
 *   3. デフォルトの Code.gs を全削除し、このファイルの中身を全て貼り付け
 *   4. プロジェクト名を「KOREC Research Logger」等に変更（左上）
 *   5. 保存（💾アイコン or ⌘S）
 *   6. 右上「デプロイ」→「新しいデプロイ」
 *      - 種類: ウェブアプリ
 *      - 説明: KOREC research tool logger
 *      - 次のユーザーとして実行: 自分
 *      - アクセス: 全員（必須。これでないとHTMLから叩けない）
 *      - 「デプロイ」をクリック
 *   7. アクセス権限の確認（自分のGoogleアカウントで承認）
 *   8. デプロイ完了画面に表示される「ウェブアプリのURL」をコピー
 *      （https://script.google.com/macros/s/XXXXX.../exec の形）
 *   9. このURLをツールの設定画面「ログ送信先URL」に貼り付けてメンバーに配布
 *
 * 注意:
 *   - スプレッドシートを別シートに移動したい場合は、SHEET_NAME を該当シート名に変更
 *   - ヘッダ行は初回POST時に自動で作成される
 */

const SHEET_NAME = 'log'; // ログを書き込むシート名

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
        '実行日時(送信側)',
        'ユーザー',
        '企業名',
        '企業URL',
        '担当者役職',
        '担当者名',
        'リサーチ種別',
        'モデル',
        '成否',
        'エラーメッセージ',
        '結果文字数',
      ]);
      // ヘッダ装飾
      const headerRange = sheet.getRange(1, 1, 1, 12);
      headerRange.setBackground('#0071e3').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, 12);
    }

    sheet.appendRow([
      new Date(),
      data.timestamp || '',
      data.user || '',
      data.company || '',
      data.url || '',
      data.role || '',
      data.name || '',
      data.researchType || '',
      data.model || '',
      data.success ? 'OK' : 'FAIL',
      data.errorMsg || '',
      data.charsCount || 0,
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
    .createTextOutput('KOREC research logger is running. Use POST to log.')
    .setMimeType(ContentService.MimeType.TEXT);
}
