# 日常・萬年曆

向傳統線上萬年曆致意的獨立實作。繁體中文、台灣時間、純靜態網站，可放在 GitHub Pages 的根目錄或專案子路徑。

## 本機執行

需要 Node.js 22.12+（或 20.19+）。

```sh
npm ci
npm run dev
```

```sh
npm test
npm run build
npm run preview
```

## 功能

- 西元 1801–2100 年西曆／農曆月曆，含民國年、干支、生肖、閏月。
- 日期詳情、今天、年月跳轉、西曆查詢、農曆反查西曆。
- 二十四節氣時刻至分鐘，全年節氣表與資料來源。
- 精選 53 項台灣與世界節慶，含農曆節日、星期規則、復活節與聯合國國際日；分類可篩選。
- 手機版面、鍵盤方向鍵選日、Home/End 月初／月底、原生對話框、列印樣式。
- `?date=2026-09-25` 可分享指定日期，不需伺服器路由。

## 精度與來源

### 農曆

使用 MIT 授權的 [lunar-javascript 1.7.7](https://github.com/6tail/lunar-javascript)，依 UTC+8 日界換算；干支年與生肖在農曆正月初一交接。本版固定使用 UTC+8，不還原歷史地方時或台灣夏令時間；西曆一律使用格里曆。反查容許農曆 1800 年，以覆蓋西曆 1801 年年初，但換算結果仍須落在西曆支援範圍。

1801–1900 年沿用套件推算，未逐年校對歷史頒行曆書。測試涵蓋這 100 年每個農曆月的首末日往返換算（含閏月），並以執行環境的 ICU 中國曆交叉核對 1801、1851 年的代表日期；這些檢查不等於所有歷史曆日均已核驗。

換算驗證參考[香港天文台公曆與農曆日期對照表](https://www.hko.gov.hk/en/gts/time/conversion.htm)。資料屬曆法推算，長期未來曆日仍可能因接近日界的天象預測修訂而調整。

### 節氣

- **2021–2030：** `src/official-terms.json` 的 240 個時刻直接取自[臺北市立天文科學教育館《2021–2030 簡易曆象表》](https://www-ws.gov.taipei/001/Upload/439/relfile/47557/7970699/11519980-d0a1-4547-a2ea-b86d6ad06fea.pdf)，每年的第一頁（PDF 第 1、3、…、19 頁）。取月、日、時、分，不以套件秒值覆蓋官方分鐘值。來源表的東經 120 度平均太陽時按 UTC+8 使用。
- **其他支援年份：** lunar-javascript 天文算法，秒值四捨五入到分鐘，UI 標示「推算」。沒有逐年官方核驗，不能把顯示到分鐘視為整個 300 年區間均已驗證在一分鐘內；歷史與遠期 ΔT／地球自轉存在估算不確定性。
- 引用日期：2026-09-21。官方資料隨專案打包，使用者不用連線查詢 API 或申請金鑰。
- 測試包含官方代表時刻，以及全 300 年節氣數量、名稱順序、日期與時間合法性。完整名稱排序能捕捉套件的跨年冬至別名問題。

### 節慶

`src/festivals.js` 為資料與規則，每筆事件帶有來源網址。主要來源：[交通部觀光署](https://www.taiwan.net.tw/m1.aspx?sno=0001020)、[人事行政總處](https://www.dgpa.gov.tw/information?pid=12572&uid=55)、[聯合國國際日](https://www.un.org/en/observances/list-days-weeks)、[美國海軍天文台復活節算法](https://aa.usno.navy.mil/faq/easter)。

節慶不代表放假。本版不包含補班補假、全世界各宗教節曆或歷史法定假日重建。現代紀念日採已知起始年份限制；較早的名稱與日期變革未重建。農曆節日不在閏月重複；除夕為臘月最後一天，因此可以是廿九。

日期計算與節慶資料全部在本機執行，無後端。字型使用 Google Fonts 的 Noto Sans TC／Noto Serif TC，無法連線時回退系統字型；日曆功能不依賴外部網路。

## GitHub Pages

1. 將此目錄推到自己的 GitHub repository（預設分支 `main`）。
2. Repository → Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
3. `.github/workflows/pages.yml` 會在推送 `main` 時測試、建置並部署，也可手動執行。

建置使用相對資產路徑 `--base=./`，適用 `https://帳號.github.io/calendar/` 與自訂網域。此初始版本只在本機實作；尚未建立遠端 repository、推送或發布。

## 檔案

- `src/calendar.js`：日期邊界、農曆換算、節氣來源與事件整合。
- `src/festivals.js`：節慶資料與移動日期規則。
- `src/official-terms.json`：官方節氣分鐘表。
- `src/main.js`、`src/style.css`、`index.html`：原生 JavaScript 與響應式介面。
- `scripts/test-*.mjs`：Node 內建斷言檢查，不需要測試框架。
