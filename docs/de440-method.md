# DE440 午夜節氣核對（1801–2100）

2026-09-21 核對：日本時間取整後為 `01:00`、原匯入資料轉成東八區 `00:00` 的七筆，實際上有 **三筆在午夜前、四筆在午夜後**。先前只列出日期有差異的三筆，容易讓人誤以為全部都應是 `24:00`。

以下以完整 JPL DE440、Skyfield 1.55 計算節氣瞬間，再使用各年 NAOJ 查詢頁顯示的 ΔT 換成 **UT+8**，以便在相同時間尺度下比較。秒數是計算值，並非 NAOJ 提供的秒級資料，也不代表外部準確度達到毫秒。

| 節氣 | DE440，UT+8（採 NAOJ ΔT） | NAOJ 直接輸出 UT+8 | ΔT（秒） |
| --- | --- | --- | ---: |
| 1848 冬至 | 1848-12-21 23:59:35.142 | [12/21 24:00](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi?year=1848&lst=8) | 8.847207644 |
| 1881 冬至 | 1881-12-22 00:00:29.093 | [12/22 00:00](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi?year=1881&lst=8) | -3.520211344 |
| 1911 立夏 | 1911-05-07 00:00:16.444 | [05/07 00:00](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi?year=1911&lst=8) | 12.455076416 |
| 1923 雨水 | 1923-02-19 23:59:40.376 | [02/19 24:00](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi?year=1923&lst=8) | 23.133377344 |
| 1951 冬至 | 1951-12-23 00:00:01.895 | [12/23 00:00](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi?year=1951&lst=8) | 29.3220207478519 |
| 1979 大寒 | 1979-01-20 23:59:55.609 | [01/20 24:00](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi?year=1979&lst=8) | 49 |
| 2084 春分 | 2084-03-20 00:00:26.814 | [03/20 00:00](https://eco.mtk.nao.ac.jp/cgi-bin/koyomi/cande/phenomena_sy.cgi?year=2084&lst=8) | 89.4532180897396 |

七筆皆支持 NAOJ 原日期。匯入已改用 NAOJ 的 `lst=8` 結果並保留 `24:00`；修正的三個案例是 **1848 冬至、1923 雨水、1979 大寒**；其餘四筆保留次日 `00:00`。這是七筆午夜邊界的核對，沒有宣稱已用 DE440 重算全部 7,200 筆。

## 天文定義與計算

現行定氣法以太陽視黃經每跨越 15° 定義節氣。[NAOJ 定義](https://eco.mtk.nao.ac.jp/koyomi/wiki/B5A8C0E12FC6F3BDBDBBCDC0E1B5A4A4CEC4EAA4E1CAFD.html)

Skyfield 的 `almanac_east_asia.solar_terms()` 使用地心觀測太陽、光行時及視位置修正，取當日黃道座標：`earth.at(t).observe(sun).apparent().ecliptic_latlon('date')`。該函式設定 IAU 2000B 章動並將黃經分為 24 區，再由 `find_discrete()` 搜尋跨區時刻；不使用地表觀測者，也不使用固定 J2000 黃經。[Skyfield 1.55 原始碼](https://github.com/skyfielders/python-skyfield/blob/1.55/skyfield/almanac_east_asia.py#L114-L140)、[官方用法](https://rhodesmill.org/skyfield/almanac.html#solar-terms)

本次另以完整 IAU 2000A 章動及 `frame_latlon(ecliptic_frame)` 重新求七個根，與上述算法相差均不超過 0.0211 秒，日期全部相同；最接近午夜的 1951 冬至變為 00:00:01.901。

本次使用 [JPL 完整 de440.bsp](https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de440.bsp)。DE440 涵蓋 1550–2650，足以包含專案所需 1801–2100。[JPL DE440 說明](https://ssd.jpl.nasa.gov/doc/de440_de441.html)

## UT、UTC 與日期取整

NAOJ 查詢結果標示 `UT+8`，另列 ΔT。應先用 `UT = TT − ΔT` 換算，再加八小時；NAOJ 說明 ΔT 為 TT−UT1，且年表的預測值為方便使用會在全年採同一值。因此用相同 ΔT 比較，才能避免把地球自轉模型的差異誤判為 DE440 或日期取整的差異。[NAOJ ΔT 說明](https://eco.mtk.nao.ac.jp/koyomi/wiki/A6A4A3D42FCDBDC2AC.html)

Skyfield 的 UTC 轉換使用閏秒表；在 1.55 內建資料中，1972 年之前沿用固定 TAI−UTC=10 秒，最後一個已知閏秒之後沿用 37 秒。這不是歷史 UT，也不是 2084 年 UTC 的預報。不能直接把全部七筆 `utc_datetime()` 加八小時當作 NAOJ 對照；這樣會把 1881、1911、1951 三筆錯放在前一天。[Skyfield 1.55 時間轉換原始碼](https://github.com/skyfielders/python-skyfield/blob/1.55/skyfield/timelib.py)、[時間尺度說明](https://rhodesmill.org/skyfield/time.html#ut1-and-downloading-iers-data)

1979 大寒可另外用已知的 UTC 核對：DE440 為 **1979-01-20 23:59:54.425 UTC+8**，仍在午夜前。它與表中的 UT+8 差 1.184 秒，來自當時 TT−UTC=50.184 秒與 NAOJ 全年 ΔT=49 秒之差。

改用 Skyfield 內建 ΔT 再算一次，七筆日期仍全部相同。1951 冬至為 00:00:01.528，2084 春分為 00:00:30.902；2084 的分鐘四捨五入會變成 00:01，但日期不變。這表示 DE440 足以獨立核對這次的日期問題，輸出到分鐘時仍須記錄採用的 ΔT。

資料應保留**取整前事件所屬日期**，再將時刻取整到分鐘：23:59:35 可寫為同日 24:00，00:00:16 則寫為當日 00:00。僅將已取整的日本 01:00 減一小時，無法重建午夜兩側的日期。Skyfield 的 `strftime` 分鐘格式也會自動取整，因此核對時須保留秒，不能只比對格式化後的 `00:00`。[Skyfield 取整說明](https://rhodesmill.org/skyfield/almanac.html#rounding-time-to-the-nearest-minute)

## 重現

安裝 Skyfield 1.55，下載完整 `de440.bsp` 後執行：

```sh
python scripts/check-de440.py /tmp/calendar-de440.bsp
```

七筆 NAOJ 查詢結果及 ΔT 固定於檢查腳本，以免網站日後更新理論或參數時，靜默改變這次核對的基準。本次完整核心檔的 SHA-256 為 `a4ce9bf9b3282becc9f4b2ac3cebe03a2ae7599981aabd7265fd8482fff7c4b5`。
