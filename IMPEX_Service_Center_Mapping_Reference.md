# IMPEX — Canonical Service Center Mapping (HBA Table)

This is the single source of truth for province/city → service center resolution. Any workflow that needs this mapping (`impex-cities`, `impex-resolve-sc`, `impex-register-check`, `impex-location-parse`) should copy the JS object below verbatim rather than retyping it, to avoid drift between copies.

## Province-level rule (used for service center resolution)

| Province | Service Center |
|---|---|
| Al-Jouf Province | Jeddah Service Center |
| Riyadh Province | Riyadh Service Center |
| Al-Qassim Province | Riyadh Service Center |
| Makkah Province | Jeddah Service Center *(except Al-Qunfudhah → Darb)* |
| Tabuk Province | Jeddah Service Center |
| Eastern Province | Dammam Service Center |
| Madinah Province | Madeena Service Center |
| Hail Province | Madeena Service Center |
| Al-Baha Province | Darb Service Center |
| Jazan Province | Darb Service Center |
| Asir Province | Darb Service Center |
| Najran Province | Darb Service Center |
| Northern Borders Province | Jeddah Service Center |

**Only one city-level exception exists in the entire table: Al-Qunfudhah (under Makkah Province) routes to Darb instead of Jeddah.** Every other place name in the full HBA table maps to whatever its province maps to — there is no other city-level override anywhere in the data.

## Canonical JS object (copy this into any workflow needing province → SC resolution)

```javascript
const SC_MAP = {
  "Riyadh Province":           "Riyadh Service Center",
  "Al-Qassim Province":        "Riyadh Service Center",
  "Eastern Province":          "Dammam Service Center",
  "Madinah Province":          "Madeena Service Center",
  "Hail Province":             "Madeena Service Center",
  "Makkah Province":           "Jeddah Service Center",
  "Tabuk Province":            "Jeddah Service Center",
  "Al-Jouf Province":          "Jeddah Service Center",
  "Northern Borders Province": "Jeddah Service Center",
  "Asir Province":             "Darb Service Center",
  "Jazan Province":            "Darb Service Center",
  "Najran Province":           "Darb Service Center",
  "Al-Baha Province":          "Darb Service Center"
};

// Only exception in the whole table:
// Makkah Province + Al-Qunfudhah -> Darb (not Jeddah)
if (region === "Makkah Province" && subregion.toLowerCase().includes("qunfudhah")) {
  servicecenter = "Darb Service Center";
}
```

## Full place-level table (for reference / audit — not needed for resolution logic, since province-level + the one exception above is sufficient)

| Province | Place | Service Center |
|---|---|---|
| Al-Jouf Province | AL JOUF | Jeddah |
| Riyadh Province | MURABBA | Riyadh |
| Riyadh Province | AZEESIYA | Riyadh |
| Riyadh Province | BATHA | Riyadh |
| Riyadh Province | BURAIDAH | Riyadh |
| Riyadh Province | DILAM | Riyadh |
| Riyadh Province | EXIT 14 | Riyadh |
| Riyadh Province | HARRA | Riyadh |
| Riyadh Province | HARRAJ | Riyadh |
| Riyadh Province | HARRAJ KARJ ROAD | Riyadh |
| Riyadh Province | KARJ | Riyadh |
| Riyadh Province | KHURAISE | Riyadh |
| Riyadh Province | MALAS | Riyadh |
| Riyadh Province | MUROOJ | Riyadh |
| Riyadh Province | NASEEM | Riyadh |
| Riyadh Province | OLAYA | Riyadh |
| Riyadh Province | QASSIM | Riyadh |
| Riyadh Province | RAWABHI | Riyadh |
| Riyadh Province | RIYAD | Riyadh |
| Riyadh Province | ROWDHA | Riyadh |
| Riyadh Province | SAHAFA | Riyadh |
| Riyadh Province | SANAYA 2 | Riyadh |
| Riyadh Province | SHIFA | Riyadh |
| Riyadh Province | SHIMERCY | Riyadh |
| Riyadh Province | SUBRA | Riyadh |
| Riyadh Province | SULAIMANIA | Riyadh |
| Riyadh Province | SULAY | Riyadh |
| Al-Qassim Province | UNAIZHA | Riyadh |
| Riyadh Province | MAJMA | Riyadh |
| Riyadh Province | ARTHWYA | Riyadh |
| Riyadh Province | SAJIR | Riyadh |
| Riyadh Province | SULFI | Riyadh |
| Riyadh Province | KIBBA | Riyadh |
| Al-Qassim Province | AL RASS | Riyadh |
| Al-Qassim Province | MIDNABB | Riyadh |
| Riyadh Province | HOTHA SUDAIR | Riyadh |
| Riyadh Province | HOTHA BIN THAMIM | Riyadh |
| Riyadh Province | AFLAJ | Riyadh |
| Riyadh Province | SHAQRA | Riyadh |
| Riyadh Province | WADI AL DAWASIR | Riyadh |
| Al-Qassim Province | BADAYEA | Riyadh |
| Al-Qassim Province | Al-Bukairiyah | Riyadh |
| Makkah Province | AL SALAMA | Jeddah |
| Makkah Province | AL SAMIR | Jeddah |
| Makkah Province | Balad | Jeddah |
| Makkah Province | Harraj | Jeddah |
| Makkah Province | AL ROWDA | Jeddah |
| Makkah Province | AL SAFA | Jeddah |
| Makkah Province | Ameer Favaz | Jeddah |
| Makkah Province | Amir Mathab | Jeddah |
| Makkah Province | Bab Makkah | Jeddah |
| Makkah Province | Badar | Jeddah |
| Makkah Province | Bahra | Jeddah |
| Makkah Province | Banimalik | Jeddah |
| Makkah Province | BAWADI | Jeddah |
| Makkah Province | BURAIMAN | Jeddah |
| Makkah Province | COMPUTER CITY | Jeddah |
| Makkah Province | Dahban | Jeddah |
| Makkah Province | FAISALIYA | Jeddah |
| Makkah Province | Firoosiya | Jeddah |
| Makkah Province | GULAIL | Jeddah |
| Makkah Province | HAMDANIYA | Jeddah |
| Makkah Province | HARASATH | Jeddah |
| Makkah Province | Hera Street | Jeddah |
| Makkah Province | HINDABIYA | Jeddah |
| Makkah Province | Hindawiyya | Jeddah |
| Makkah Province | JAMIA | Jeddah |
| Makkah Province | JUMOOM | Jeddah |
| Makkah Province | Junubiya | Jeddah |
| Makkah Province | KAKKIYA | Jeddah |
| Makkah Province | Kandhara | Jeddah |
| Makkah Province | Khalid Ibn Waleed | Jeddah |
| Makkah Province | KILO 7 | Jeddah |
| Makkah Province | Kilo2 | Jeddah |
| Makkah Province | KUMRAH | Jeddah |
| Makkah Province | Mahjar | Jeddah |
| Makkah Province | Makkah | Jeddah |
| Makkah Province | MAKRONA | Jeddah |
| Makkah Province | MARWA | Jeddah |
| Makkah Province | Mathar Gadeem | Jeddah |
| Makkah Province | NAVVARIYA | Jeddah |
| Makkah Province | Obhur | Jeddah |
| Makkah Province | Palestheen Street | Jeddah |
| Makkah Province | Rabigh | Jeddah |
| Makkah Province | Raheli | Jeddah |
| Makkah Province | Ruwais | Jeddah |
| Makkah Province | SANABIL | Jeddah |
| Makkah Province | SHARA 60 | Jeddah |
| Makkah Province | Sharafiya | Jeddah |
| Makkah Province | SHARRAYA | Jeddah |
| Makkah Province | SOUK MANARA | Jeddah |
| Makkah Province | SOUK SHIMAL | Jeddah |
| Makkah Province | Souk Ul Khaima | Jeddah |
| Tabuk Province | TABUK | Jeddah |
| Makkah Province | TAIF | Jeddah |
| Makkah Province | Thuwal | Jeddah |
| Makkah Province | Turubah | Jeddah |
| Makkah Province | Al-Lith | Jeddah |
| **Makkah Province** | **Al-Qunfudhah** | **Darb ← exception** |
| Eastern Province | 91th Street Dammam | Dammam |
| Eastern Province | Abqeaq | Dammam |
| Eastern Province | AL HASSA | Dammam |
| Eastern Province | Al Khobar | Dammam |
| Eastern Province | Dammam | Dammam |
| Eastern Province | Hofuf | Dammam |
| Eastern Province | Jubail | Dammam |
| Eastern Province | Mahboobiya | Dammam |
| Eastern Province | MENA PORT | Dammam |
| Eastern Province | Qatif | Dammam |
| Eastern Province | Rabakh | Dammam |
| Eastern Province | Rastanuara | Dammam |
| Eastern Province | RASTANURA | Dammam |
| Eastern Province | Safwa | Dammam |
| Eastern Province | Seiko | Dammam |
| Eastern Province | Thuqba | Dammam |
| Eastern Province | Al-Ahsa | Dammam |
| Eastern Province | Dhahran | Dammam |
| Eastern Province | Hafar Al-Batin | Dammam |
| Eastern Province | Khafji | Dammam |
| Eastern Province | Abqaiq | Dammam |
| Tabuk Province | Duba | Jeddah |
| Tabuk Province | Al-Wajh | Jeddah |
| Tabuk Province | Tayma | Jeddah |
| Madinah Province | Umluj | Madeena |
| Tabuk Province | Sharma | Jeddah |
| Tabuk Province | NEOM area | Jeddah |
| Madinah Province | Al Aziziyyah | Madeena |
| Madinah Province | Al Faisaliah | Madeena |
| Madinah Province | Al Hadiqah | Madeena |
| Madinah Province | Al Iskan | Madeena |
| Madinah Province | Al Jamiah | Madeena |
| Madinah Province | Al Khalidiyyah | Madeena |
| Madinah Province | AL ULA | Madeena |
| Madinah Province | Badar | Madeena |
| Hail Province | HAIL | Madeena |
| Madinah Province | Hanakiya | Madeena |
| Madinah Province | Haraj | Madeena |
| Madinah Province | JURFF | Madeena |
| Madinah Province | Khaybar | Madeena |
| Madinah Province | Madeena | Madeena |
| Madinah Province | Mahd | Madeena |
| Madinah Province | MAHD | Madeena |
| Madinah Province | Qiblatayn | Madeena |
| Madinah Province | Shuran | Madeena |
| Madinah Province | Tayba | Madeena |
| Madinah Province | Yanbu | Madeena |
| Hail Province | Baqaa | Madeena |
| Hail Province | Al-Ghazalah | Madeena |
| Hail Province | Ash-Shinan | Madeena |
| Al-Baha Province | ABAHA | Darb |
| Jazan Province | ABU ARISH | Darb |
| Asir Province | AHAD RAFIDAH | Darb |
| Jazan Province | AHD ALMASRA | Darb |
| Al-Baha Province | AL GURAIA | Darb |
| Al-Baha Province | AL QUSE | Darb |
| Al-Baha Province | ALBAHA | Darb |
| Al-Baha Province | AQUEEK | Darb |
| Jazan Province | BAISH | Darb |
| Al-Baha Province | BALJURUSSI | Darb |
| Al-Baha Province | BIRK | Darb |
| Asir Province | Bisha | Darb |
| Najran Province | DAHARANJUNOOB | Darb |
| Jazan Province | Dahir | Darb |
| Jazan Province | DARB | Darb |
| Jazan Province | JIZAN | Darb |
| Asir Province | KALMA | Darb |
| Asir Province | Khamis Mushaith | Darb |
| Asir Province | KHAMIS WAREHOUSE | Darb |
| Jazan Province | MADAYA | Darb |
| Asir Province | MAJARIDA | Darb |
| Al-Baha Province | MIKWA | Darb |
| Al-Baha Province | MOHAYIL | Darb |
| Najran Province | NAJRAN | Darb |
| Asir Province | NAMAS | Darb |
| Al-Baha Province | NIMRA | Darb |
| Jazan Province | SABAYA | Darb |
| Al-Baha Province | SABTH ALAYA | Darb |
| Jazan Province | SAMTHA | Darb |
| Jazan Province | SHEKQUE | Darb |
| Asir Province | THANOOMA | Darb |
| Asir Province | THATHALEETH | Darb |
| Asir Province | THENDAHA | Darb |
| Asir Province | Bareq | Darb |
| Jazan Province | Farasan Islands | Darb |
| Al-Jouf Province | Al-Qurayyat | Jeddah |
| Al-Jouf Province | Dumat al-Jandal | Jeddah |
| Al-Jouf Province | Tubarjal | Jeddah |
| Northern Borders Province | ARAR | Jeddah |
| Northern Borders Province | Rafha | Jeddah |
| Northern Borders Province | Turaif | Jeddah |

## Note on duplicate place names across provinces

Some place names appear more than once with different provinces (e.g. **"Badar"** exists under both Makkah Province and Madinah Province). This is expected — Saudi place names aren't globally unique. Because of this, city-level lookups in this system are always done **within** a selected province (the dealer picks their province first, then their city from that province's list) — never as a bare city-name search across all provinces. This is already how `impex-cities`, `impex-register-check`, and `impex-resolve-sc` are built, so no change is needed there; this note is just to explain why the lookup is always scoped by province.

## Verification against existing workflows

This table was checked against the province → service center logic already present in `impex-cities`, `impex-resolve-sc`, `impex-register-check`, and `impex-location-parse`'s `Resolve Service Center` node — **all of them already match this table exactly, including the single Al-Qunfudhah exception.** No changes were needed to those four workflows.
