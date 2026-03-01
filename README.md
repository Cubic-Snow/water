# 水電行資料庫（GitHub Pages）

這是一個**純靜態** GitHub Pages 網站：
- `data/shops.csv`：你的爬蟲資料（已整理成乾淨欄位）
- `index.html`：總覽 + 搜尋/篩選
- `store.html?id=1`：單筆頁面（可分享連結）

## GitHub Pages 開啟方式
1. 進入你的 Repo → **Settings** → **Pages**
2. Source 選 **Deploy from a branch**
3. Branch：`main`，Folder：`/(root)`
4. Save，等待 1~2 分鐘

## 更新資料
把新的 CSV 覆蓋 `data/shops.csv` 後 Commit，Pages 會自動更新（可能需要稍等快取）。

> 如果你的爬蟲還有第二個 CSV（例如更多欄位），你也可以放在 `data/` 下面，然後我再幫你把前端頁面加上更多欄位顯示。
