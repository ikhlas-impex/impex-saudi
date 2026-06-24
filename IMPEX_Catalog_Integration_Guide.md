# IMPEX Product Catalog — Integration Guide
## For AI Code Editor (Cursor / GitHub Copilot / Claude Code)

---

## What this guide does

1. **Google Sheets** — import ProductCatalog.csv into your sheet as a new tab
2. **index.html** (dealer pickup web app) — replace the CATALOG constant with the correct data
3. **admin/index.html** — sync catalog tab with same data

---

## Step 1 — Import into Google Sheets

**Sheet ID:** `1VvDVd_2KlC1TL3blZOSn2ISrgXi2VSqE4SM9H4rx4Zo`

1. Open the sheet: https://docs.google.com/spreadsheets/d/1VvDVd_2KlC1TL3blZOSn2ISrgXi2VSqE4SM9H4rx4Zo
2. Click the **+** button at the bottom to add a new tab
3. Rename the tab to exactly: `ProductCatalog`
4. In that tab, go to **File → Import → Upload** and select `ProductCatalog_GoogleSheets.csv`
5. Choose **Replace current sheet** and **Comma** as separator
6. Click **Import data**

The tab must have exactly these columns in row 1:
```
category | model
```

---

## Step 2 — Update `index.html` (dealer pickup web app)

Find this line in `index.html`:
```javascript
const CATALOG = ...;
```

Replace the entire CATALOG constant with this exact value:

```javascript
const CATALOG = {"2.0 Computer Speaker":["BLUEBLAST","BTS2011","BTS2012","BTS2013","BTS2014","BTS2015","BTS2016","BTS2020","Gear2","Molto","SB402","SB1401","Gear3","Thunder-T1Plus"],"2.1 Multimedia Speaker":["BeatBeamSB6000","HT2112","HT2114","MaestroJunior","MicroR1","MiniBangHT2116","MiniRock","MusicR","OHT201R","PianoBL","SB6000","Spinto-HT2104","Spinto-HT2111"],"3.1 Home Theatre":["HT3101"],"5.1 Home Theatre":["Bang-HT-5106","BEATB2","BEATB3","BLUEROCKHT5103","BravoHT5107","Bravo-HT5101","FXMS-513","HT5105","HT5107BRAVO","MAGNETO[HT5104]"],"Air Conditioner":["SplitAC1.5ton","WindowAC1.5ton","SplitAC2ton","WindowAC2ton"],"Air Cooler":["FREEZO19","FREEZO22","FREEZO25","FREEZO55","Storm100"],"Air Fryer":["AF4301","AF4302","AF4303","AF4304","AF4305","AF4306","AF4307","AF4308","AF4309","AF4310","AF4500"],"Bread Toaster":["BD3702"],"Ceiling Lamp":["GL36A","Glare33","Glare34","Glare36"],"Chopper":["FC3202","FC3203","FC3204B","FC3205","FC3206","FC3222","MS400","MS900"],"Coffe Maker":["CGR3001","CGR3002","CM1912","CM1915","ECM1916","IECM2001","IECM2002","IECM2003","TCM1002","TCM1001"],"Cookware":["ABP32HE","ACS10HE","ACS12M","ACS8HE","ADPC3E","ADPC5E","AFP28GE","APF2620","APTR35GE","ASP26IE","ASP32GE","DFP2428W","DGDNMP16M","DSK5W","DSK9W","DTKP32","KUK7","KUK9","NCB7101","NCB7104","NCB7108","NCB7110","NCS8G"],"Deep Fryer":["IDF1003"],"Digital Video Broadcast":["IXHDR101","IXHDR102"],"Dish Washer":["IDW13PS","IDW15PS"],"Electric Cooker":["EP3","EP3C5","EPC10","EPC12","EPC15","EPC17","EPC5","EPC6","EPC8"],"Electric Iron Box":["Flexi","IB191","IB200","IB201","IB21","IB211","IBD501","IBS401","IBS402","IBS403","IBS404","OIB601H","SHOWY"],"Garment Steamer":["GSM6010","GSM6011","GSM6012","GSM6013","GSM6014","GSM6015","GSM6016","GSM6017"],"Electric Kettle":["GST1501","GST1802","GST1803","GST1805","GST2002","GST2001","OKL1800","OKL1803","Steamer1803","Steamer1804","Steamer1805","Steamer2002","Steamer2003","Steamer1501","Steamer1801","Steamer1802","Steamer1808","Steamer2001"],"ELECTRIC OVEN":["OV2900","OV2901","OV2902","OV2903","OV2904","OV2905","OV2906","OV2907"],"Emergency Light":["CB2283","CB2284","CB2285","CB2286","Glare36","IL678","IL680","IL683","IL685","IL686","IL687","IL688","IL689","IL692","IL693","IL694","IL695","IL696","IL697","IL698","IL700","IL701","IL702","IL703","OL888+","SHINE L","TL600"],"FLASH LIGHT COMBO":["CB2222","CB2223","CB2224","CB2225","CB2226","CB2227","CB2229","CB2230","CB2232","CB2233","CB5555","OBLCB5506","OFLCB5502","OFLCB5505"],"GAS STOVE":["IGS11","IGS121","IGS1212","IGS1213","IGS1214","IGS1222","IGS1233","IGS124","IGS125","SPARCKLE2","Specta2B","Specta3B"],"Grinder":["CG3401","CG3403","MG3801","MG3807"],"HEATER":["CH125","HCB120","HF90","HQ80","HQ81","HR91","HR92","HR93","OH13","OHF13"],"Hot Plate":["HP102","HP100","HP101","HP201","HP202"],"Induction Cooker":["IC2601","IC2602"],"INFRARED COOKTOP":["IR2701","IR2705","IR2702","IR2703","IR2704"],"Insect Killer":["IK4602","IK4604","IK4605","IK4606","IK4601","IKB01"],"JUICER BLENDER":["BL1002","BL1004","BL313","BL319","BL320","BL322","BL3500","BL3501","BL3502","BL3503","BL3507","BL3508","BL3509","BL3511","BL3533","BL390","BL315","BL316","BL318","EZMXZJ500LB","FP313","GSM3309","HB3201","HB3206","HB3207","HM3201","HM3301","HM3302","HM3304","JB101","JB414","JB415","JR13","JR3504","JR3505","JR3506","JR3510","JR3511","OB414","OBL1002","OBL5201","OBL5202","PBL01","PBL02","SB1500","SM3303","SM3305","SM3306","SM3307","SM3308"],"Karaoke Wireless Microphone":["KM1301","KM1302"],"Kitchen Hob":["BIHG5","BIHS4","BIHS5"],"KITCHEN SCALE":["KS01"],"LED LAMP FLASH LIGHT COMBO":["CB2287","CB2288","OBLCB5583"],"TV":["LED TV 100 INCH","LED TV 24 INCH","LED TV 32 INCH","LED TV 40 INCH","LED TV 42 INCH","LED TV 43 INCH","LED TV 45 INCH","LED TV 50 INCH","LED TV 55 INCH","LED TV 58 INCH","LED TV 60 INCH","LED TV 65 INCH","LED TV 70 INCH","LED TV 75 INCH","LED TV 85 INCH"],"Massager Gun":["PMG8"],"Micro Waveoven":["MO8101","MO8102","MO8125DGB","MO8142DGB"],"Pedestal and Table Fan":["BF7510","BF7512","CF01","CF02","PF01","PF7501","PF7502","PF7504","TF7505","TF7506","TWISTER36","TwisterPro","WF7503"],"PERSONAL CARE":["FS1401","GK401","GK402","GK403","HD1K2","HD1K3","HD1K4","HD1K5","HD1K6","HD1K7","HS301","HS302","HS303","HS304","HS305","HS306","HS307","HSK101","IHC3","IHC5","IHC7","IHC8","IHC9","ISV2","ISV3","ISV4","OGK301","OGK302","OGK402","OHC01","OHC03","TIDY111","TIDY221","TIDY220"],"PERSONAL SCALE":["PS01","PS02","PS03"],"Portable Speaker":["GTS25B","OTS35","P10","TS1104","TS1105","TS1106","TS1107","TS1108","TS1109","TS25B","TS4001","TS4002","TS8001","TS81"],"POWER SOCKET":["PS7402","PS7403","PS7404","PS7405","PS7406"],"Power Station":["IP12001"],"Pressure Cooker":["5C3","ADPC10E","AIPC3","AIPC5","DAPC10","DAPC11","DAPC5","DAPC7","DAPC9","DPC7G","DPC9A","ECO3","EPC3E","IFC235","IPC501","IPC503","NORMA3","NORMA5","Prima3","SPC5E","TDPC5M","TPC5"],"RADIO":["MELODY","MELODYPLUS","MELODYPRO","MELODYPRO RD 1201"],"Recharge Fan":["Breeze C1","Breeze D1","Breeze D2","Breeze D3","Breeze D4","Breeze D6","Breeze D7","Breeze D9","Breeze D5","Breeze D8","HF01","HF02"],"Refrigerator":["IMBC100","IMCF100","IMCF150","IMCF200","IMRF140","IMSC300W","IMSC400B","IRF138","IRF200","IRF220","IRF250","IRF290","IRF335","IRF420","IRF46","IRF470","IRF520SS","IRF550SBSS"],"RICE COOKER":["MAGICPAN WS18","RC2801","RC2802","RC2803","RC2804","RC2805"],"Roti Maker":["BM3010"],"Sandwich Maker":["BQ6110","BQ6111","SW3601","SW3603","SW3604","SW3605","SW3606","SW3607"],"Stage Speaker":["ST80A"],"Torch Light":["BEAMQ2","BEAMQ21","G22B","G23B","Glister20","Glister22","Glister23","HL2201","HL2202","HL2203","HunterH1","HunterZ0","HunterZ1Plus","HunterZ1","HunterZ2","HunterZ3","HunterZ4","HunterZ5","HunterZ6","HunterZ7","HunterZ8","KL200","LeaderL2","LeaderP2","LEADER PLUSP 1","LEADER PLUSP 2","LuminC2","LuminC3","LuminX0","LuminX10","LuminX2","LuminX21","LuminX3","LuminX4","LuminX40","LuminX6","Lumin-A4","LuminX1","OFLCB5503","Radian24","UltraX20","UltraX40"],"TROLLEY SPEAKER":["OTS85","ST80AN","TS1103","TS1104","TS1110B","TS25B","TS25C","TS4002","TS81"],"Vaccum Flask":["DSFK750","VF4801","VF4802","VF4803","VF4804","VF4806"],"VACUUM CLEANER":["OVC5301","OVC5304","VC4701","VC4702","VC4703","VC4704","VC4705","VC4706","VC4707","VC4708","VC4709","VC4721T"],"Washing Mechine":["WM0500TPW","WM0600FW","WM0700TMG","WM0700TPW","WM0750FS","WM0800FS","WM0800TMG","WM1000FS","WM1000TMG","WM1000TPW","WM1200TMG","WM1400TWG","WM4202","WM4203","WM4204","WM4205","WM4214","WM4215","WM4218"],"WATER DISPENSER":["WD3901","WD3902","WD3903","WD3904","WD3905","WD3906 BLW"],"Wireless Head phone":["EP1601"]};
```

**Total: 58 categories, 566 models**

---

## Step 3 — Update `admin/index.html` (catalog tab)

In the admin dashboard catalog tab, find where the catalog data is defined and replace it with the same CATALOG object above.

The admin catalog tab should:
1. Read from the `CATALOG` constant (same data as dealer app)
2. Allow editing locally
3. Show an "Export CSV" button that downloads the edited catalog
4. After downloading, admin manually imports the CSV into Google Sheets (Tab: ProductCatalog)

The export function should generate CSV like:
```javascript
function exportCatalog(catalog) {
  let csv = 'category,model\n';
  for (const [cat, models] of Object.entries(catalog)) {
    for (const model of models) {
      const c = cat.includes(',') ? `"${cat}"` : cat;
      const m = model.includes(',') ? `"${model}"` : model;
      csv += `${c},${m}\n`;
    }
  }
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'ProductCatalog.csv';
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## Step 4 — Verify n8n reads the sheet correctly

After importing the CSV into Google Sheets, test the model lookup by running:

```
POST https://n8n.srv1623198.hstgr.cloud/webhook/impex-get-models
Content-Type: application/json

{ "category": "Refrigerator", "phone": "" }
```

Expected response:
```json
{
  "success": true,
  "category": "Refrigerator",
  "found": true,
  "total": 18,
  "models": ["IRF138", "IRF170", "IRF200", ...]
}
```

---

## Category List (58 total)

| # | Category | Models |
|---|---|---|
| 1 | 2.0 Computer Speaker | 14 |
| 2 | 2.1 Multimedia Speaker | 13 |
| 3 | 3.1 Home Theatre | 1 |
| 4 | 5.1 Home Theatre | 10 |
| 5 | Air Conditioner | 4 |
| 6 | Air Cooler | 5 |
| 7 | Air Fryer | 11 |
| 8 | Bread Toaster | 1 |
| 9 | Ceiling Lamp | 4 |
| 10 | Chopper | 8 |
| 11 | Coffe Maker | 10 |
| 12 | Cookware | 23 |
| 13 | Deep Fryer | 1 |
| 14 | Digital Video Broadcast | 2 |
| 15 | Dish Washer | 2 |
| 16 | ELECTRIC OVEN | 8 |
| 17 | Electric Cooker | 9 |
| 18 | Electric Iron Box | 13 |
| 19 | Electric Kettle | 18 |
| 20 | Emergency Light | 27 |
| 21 | FLASH LIGHT COMBO | 14 |
| 22 | GAS STOVE | 12 |
| 23 | Garment Steamer | 8 |
| 24 | Grinder | 4 |
| 25 | HEATER | 10 |
| 26 | Hot Plate | 5 |
| 27 | INFRARED COOKTOP | 5 |
| 28 | Induction Cooker | 2 |
| 29 | Insect Killer | 6 |
| 30 | JUICER BLENDER | 50 |
| 31 | KITCHEN SCALE | 1 |
| 32 | Karaoke Wireless Microphone | 2 |
| 33 | Kitchen Hob | 3 |
| 34 | LED LAMP FLASH LIGHT COMBO | 3 |
| 35 | Massager Gun | 1 |
| 36 | Micro Waveoven | 4 |
| 37 | PERSONAL CARE | 34 |
| 38 | PERSONAL SCALE | 3 |
| 39 | POWER SOCKET | 5 |
| 40 | Pedestal and Table Fan | 13 |
| 41 | Portable Speaker | 14 |
| 42 | Power Station | 1 |
| 43 | Pressure Cooker | 22 |
| 44 | RADIO | 4 |
| 45 | RICE COOKER | 6 |
| 46 | Recharge Fan | 12 |
| 47 | Refrigerator | 18 |
| 48 | Roti Maker | 1 |
| 49 | Sandwich Maker | 8 |
| 50 | Stage Speaker | 1 |
| 51 | TROLLEY SPEAKER | 9 |
| 52 | TV | 15 |
| 53 | Torch Light | 42 |
| 54 | VACUUM CLEANER | 12 |
| 55 | Vaccum Flask | 6 |
| 56 | WATER DISPENSER | 6 |
| 57 | Washing Mechine | 19 |
| 58 | Wireless Head phone | 1 |

---

## Files in this package

| File | Purpose |
|---|---|
| `ProductCatalog_GoogleSheets.csv` | Import into Google Sheets → ProductCatalog tab |
| `catalog.json` | Full catalog as JSON (reference) |
| `catalog.js` | JS constant — paste into index.html and admin/index.html |

---

## Notes for AI code editor

- The CATALOG object uses category names as keys and arrays of model strings as values
- Category names are case-sensitive and must match exactly between the web app and Google Sheets
- The dealer pickup form reads CATALOG directly from JS (no API call needed for categories/models)
- n8n `impex-get-models` webhook reads from Google Sheets live — so Google Sheets is the source of truth
- If you add a new model in Google Sheets, it appears in n8n responses immediately
- If you add a new model in the web app CATALOG constant, you must also add it to Google Sheets
- Keep both in sync by using the Export CSV feature in the admin catalog tab
