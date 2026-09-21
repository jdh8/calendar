# 日常・萬年曆

繁體中文、台灣時間、純靜態的萬年曆網站，可放在 GitHub Pages 的根目錄或專案子路徑。

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

- 西元 1801–2100 年西曆／農曆月曆，並列清朝／民國紀年與日本年號，含干支、生肖、閏月。
- 日期詳情、今天、年月即時跳轉（年份輸入有效時更新）、西曆查詢、農曆反查西曆。
- 二十四節氣時刻至分鐘，全年節氣表與資料來源。
- 精選 53 項台灣與世界節慶，含農曆節日、星期規則、復活節與聯合國國際日；分類可篩選。
- 手機版面、鍵盤方向鍵選日、Home/End 月初／月底、原生對話框、列印樣式。
- `?date=2026-09-25` 可分享指定日期，不需伺服器路由。

## 精度與來源

### 年號

月份副標與日期詳情並列中日紀年；同月跨年或改元時，副標列出前後紀年，全年節氣頁則列年初與年末紀年。1912 年以前使用清朝嘉慶、道光、咸豐、同治、光緒、宣統，年數依農曆年換算；自 1912-01-01 起使用民國紀年。這是紀年對照，不依台灣政權更替切換。清朝元年依[教育部中國歷代年號表](https://dict.revised.moe.edu.tw/appendix.jsp?ID=3&la=1&page=6&powerMode=0)。

日本年號沿用原生 `Intl.DateTimeFormat` 日本曆資料，保留日文字形，包含明治、大正、昭和、平成、令和及更早年號。[日本自 1873 年起採用西曆](https://www.ndl.go.jp/koyomi/chapter1/s2.html)；此前的顯示為延伸西曆對照，**未還原日本舊曆的年界及改元日**，介面標示「西曆推算」。近代改元日參考[福井大學附屬圖書館年表](https://www.flib.u-fukui.ac.jp/elib/kojima/nengo.html)；未來日期沿用執行環境最新已知年號，不預測改元。

### 農曆

使用 MIT 授權的 [lunar-javascript 1.7.7](https://github.com/6tail/lunar-javascript)，依 UTC+8 日界換算；干支年與生肖在農曆正月初一交接。本版固定使用 UTC+8，不還原歷史地方時或台灣夏令時間；西曆一律使用格里曆。反查容許農曆 1800 年，以覆蓋西曆 1801 年年初，但換算結果仍須落在西曆支援範圍。

1801–1900 年沿用套件推算，未逐年校對歷史頒行曆書。測試涵蓋這 100 年每個農曆月的首末日往返換算（含閏月），並以執行環境的 ICU 中國曆交叉核對 1801、1851 年的代表日期；這些檢查不等於所有歷史曆日均已核驗。

換算驗證參考[香港天文台公曆與農曆日期對照表](https://www.hko.gov.hk/en/gts/time/conversion.htm)。資料屬曆法推算，長期未來曆日仍可能因接近日界的天象預測修訂而調整。

### 節氣

- **1801–2100：** `src/official-terms.json` 收錄 300 年、7,200 筆節氣時刻，來源為[日本國立天文台「二十四節氣・雜節 長期版」](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi)。各年來源以 `?year=1801&lst=8` 等參數查閱；介面連結同樣設定為東八區。
- **直接取得來源的 UT+8 表**（`lst=8`），讓來源在取整前換算時區。保留表列日期與分鐘值，包括同日 `24:00`，不將節氣移至隔日，也不再對日本已取整的時間減一小時。只取二十四節氣，不收錄日本雜節；名稱轉為繁體中文。
- 七筆午夜邊界已用 DE440 獨立核對：三筆午夜前、四筆午夜後。1848 冬至、1923 雨水、1979 大寒保留前一日 `24:00`；詳見 [DE440 核對紀錄](docs/de440-method.md)。DE440 僅用於驗證，網站仍採日本資料。
- 引用日期：2026-09-21。資料依國立天文台當時的理論與參數推算；[來源使用規定](https://eco.mtk.nao.ac.jp/koyomi/site/)允許引用。資料隨專案打包，使用者不用連線查詢 API 或申請金鑰。
- 更新資料：執行 `node scripts/import-terms.mjs`。腳本以 EUC-JP 解碼來源，驗證時區、年份、節氣名稱、黃經順序與每年 24 筆，全部成功才寫入 JSON。
- 測試涵蓋全 300 年的節氣順序、日期與時間合法性、來源連結，以及午夜取整後的節氣歸日與冬至節慶；另保留臺北天文館代表時刻作獨立核對。

### 節慶

`src/festivals.js` 為資料與規則，每筆事件帶有來源網址。主要來源：[交通部觀光署](https://www.taiwan.net.tw/m1.aspx?sno=0001020)、[人事行政總處](https://www.dgpa.gov.tw/information?pid=12572&uid=55)、[聯合國國際日](https://www.un.org/en/observances/list-days-weeks)、[美國海軍天文台復活節算法](https://aa.usno.navy.mil/faq/easter)。

節慶不代表放假。本版不包含補班補假、全世界各宗教節曆或歷史法定假日重建。現代紀念日採已知起始年份限制；較早的名稱與日期變革未重建。農曆節日不在閏月重複；除夕為臘月最後一天，因此可以是廿九。

日期計算與節慶資料全部在本機執行，無後端。字型使用 Google Fonts 的 Noto Sans TC／Noto Serif TC，無法連線時回退系統字型；日曆功能不依賴外部網路。

## GitHub Pages

1. 將此目錄推到自己的 GitHub repository（預設分支 `main`）。
2. Repository → Settings → Pages → Build and deployment → Source 選 **GitHub Actions**。
3. `.github/workflows/pages.yml` 會在推送 `main` 時測試、建置並部署，也可手動執行。

建置使用相對資產路徑 `--base=./`，適用 `https://帳號.github.io/calendar/` 與自訂網域。本專案儲存庫為 [jdh8/calendar](https://github.com/jdh8/calendar)，部署網址為 [日常・萬年曆](https://jdh8.github.io/calendar/)。

## 檔案

- `src/calendar.js`：日期邊界、農曆換算、節氣來源與事件整合。
- `src/festivals.js`：節慶資料與移動日期規則。
- `src/official-terms.json`：日本國立天文台節氣分鐘表（來源 UT+8）。
- `scripts/import-terms.mjs`：下載並驗證 1801–2100 年日本節氣資料。
- `src/main.js`、`src/style.css`、`index.html`：原生 JavaScript 與響應式介面。
- `scripts/test-*.mjs`：Node 內建斷言檢查，不需要測試框架。

## 鳴謝

靈感來自陸拓資訊的線上萬年曆。本站為獨立實作，未使用其程式碼或資料，與陸拓資訊無隸屬關係。
