/**
 * ==============================================================================
 * APLIKASI 7 KEBIASAAN ANAK INDONESIA HEBAT (BACKEND GOOGLE APPS SCRIPT)
 * Role: Anak (Siswa), Guru Wali, Admin
 * Fitur: 
 * - Database Google Sheets & Foto Google Drive
 * - Kompresi Foto Otomatis
 * - Validasi & Rekap Siswa Belum Lapor untuk Guru Wali
 * - Monitoring Shalat 5 Waktu & Kebiasaan Bangun Pagi / Tidur Malam
 * ==============================================================================
 */

// Konstanta Nama Sheet
const SHEET_CONFIG = "CONFIG";
const SHEET_USERS = "USERS";
const SHEET_LAPORAN = "LAPORAN";
const FOLDER_FOTO_NAME = "Foto_7Kebiasaan_Anak_Hebat";

/**
 * Inisialisasi awal struktur Sheet dan Google Drive
 */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Setup Folder Google Drive untuk Foto
  let folderId = "";
  const existingFolders = DriveApp.getFoldersByName(FOLDER_FOTO_NAME);
  let folder;
  if (existingFolders.hasNext()) {
    folder = existingFolders.next();
    folderId = folder.getId();
  } else {
    folder = DriveApp.createFolder(FOLDER_FOTO_NAME);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    folderId = folder.getId();
  }

  // 2. Setup Sheet CONFIG
  let sheetConfig = ss.getSheetByName(SHEET_CONFIG);
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet(SHEET_CONFIG);
  }
  sheetConfig.clear();
  sheetConfig.getRange("A1:B1").setValues([["KEY", "VALUE"]]).setFontWeight("bold").setBackground("#e2e8f0");
  sheetConfig.getRange("A2:B3").setValues([
    ["DRIVE_FOLDER_ID", folderId],
    ["APP_NAME", "7 Kebiasaan Anak Indonesia Hebat"]
  ]);

  // 3. Setup Sheet USERS (dengan kolom NO_WA untuk pengingat)
  let sheetUsers = ss.getSheetByName(SHEET_USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEET_USERS);
  }
  sheetUsers.clear();
  const userHeaders = [
    "ID_USER", "NAMA", "ROLE", "KELAS", "GURU_WALI_ID", "GURU_WALI_NAMA", "PIN", "NO_WA", "STATUS"
  ];
  sheetUsers.getRange(1, 1, 1, userHeaders.length).setValues([userHeaders]).setFontWeight("bold").setBackground("#bfdbfe");

  // Sample data awal
  const sampleUsers = [
    ["ADM01", "Administrator Sekolah", "ADMIN", "-", "-", "-", "1234", "081234567890", "AKTIF"],
    ["GW01", "Ustadz / Bpk. Ahmad Hidayat, S.Pd.", "GURU_WALI", "Semua Binaan", "-", "-", "1234", "081234567891", "AKTIF"],
    ["GW02", "Ustadzah / Ibu Siti Nurhaliza, M.Pd.", "GURU_WALI", "Semua Binaan", "-", "-", "1234", "081234567892", "AKTIF"],
    ["SIS001", "Muhammad Rizky Pratama", "ANAK", "7-A", "GW01", "Ustadz / Bpk. Ahmad Hidayat, S.Pd.", "1234", "081298765431", "AKTIF"],
    ["SIS002", "Aisyah Putri Azzahra", "ANAK", "7-A", "GW02", "Ustadzah / Ibu Siti Nurhaliza, M.Pd.", "1234", "081298765432", "AKTIF"],
    ["SIS003", "Budi Santoso", "ANAK", "7-B", "GW01", "Ustadz / Bpk. Ahmad Hidayat, S.Pd.", "1234", "081298765433", "AKTIF"],
    ["SIS004", "Fatimah Azzahro", "ANAK", "7-B", "GW02", "Ustadzah / Ibu Siti Nurhaliza, M.Pd.", "1234", "081298765434", "AKTIF"],
    ["SIS005", "Daffa Al-Faruq", "ANAK", "7-A", "GW01", "Ustadz / Bpk. Ahmad Hidayat, S.Pd.", "1234", "081298765435", "AKTIF"]
  ];
  sheetUsers.getRange(2, 1, sampleUsers.length, userHeaders.length).setValues(sampleUsers);

  // 4. Setup Sheet LAPORAN
  let sheetLaporan = ss.getSheetByName(SHEET_LAPORAN);
  if (!sheetLaporan) {
    sheetLaporan = ss.insertSheet(SHEET_LAPORAN);
  }
  sheetLaporan.clear();
  const laporanHeaders = [
    "LAPORAN_ID", "TANGGAL", "SISWA_ID", "SISWA_NAMA", "KELAS", 
    "GURU_WALI_ID", "GURU_WALI_NAMA", 
    "K1_BANGUN_PAGI", "K2_BERIBADAH", "K3_BEROLAHRAGA", "K4_MAKAN_SEHAT", 
    "K5_GEMAR_BELAJAR", "K6_BERMASYARAKAT", "K7_TIDUR_CEPAT", 
    "DETAIL_JSON", "FOTO_DRIVE_URL", "STATUS_VALIDASI", "CATATAN_GURU_WALI", 
    "WAKTU_INPUT", "WAKTU_VALIDASI"
  ];
  sheetLaporan.getRange(1, 1, 1, laporanHeaders.length).setValues([laporanHeaders]).setFontWeight("bold").setBackground("#bbf7d0");

  SpreadsheetApp.flush();
  Logger.log("Inisialisasi selesai! Folder Drive ID: " + folderId);
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Jika URL dibuka langsung di browser tanpa parameter action
    if (!action || action === "ping") {
      try {
        // Jika pengguna juga menyalin file index.html ke Apps Script, tampilkan langsung web-nya!
        return HtmlService.createHtmlOutputFromFile('index')
          .setTitle("7 Kebiasaan Anak Indonesia Hebat")
          .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
      } catch (errHtml) {
        // Jika hanya memasang Code.gs saja, berikan konfirmasi status aktif
        return responseJSON({ 
          success: true, 
          status: "ONLINE",
          message: "Alhamdulillah! Backend Google Apps Script 7 Kebiasaan Anak Indonesia Hebat sudah AKTIF dan siap digunakan."
        });
      }
    }

    if (action === "getInitialData") {
      const sheetUsers = ss.getSheetByName(SHEET_USERS);
      const rows = sheetUsers.getDataRange().getValues().slice(1);
      
      const listSiswa = [];
      const listGuruWali = [];

      rows.forEach(r => {
        if (r[8] === "AKTIF") {
          if (r[2] === "ANAK") {
            listSiswa.push({
              id: String(r[0]),
              nama: String(r[1]),
              kelas: String(r[3]),
              guruWaliId: String(r[4]),
              guruWaliNama: String(r[5]),
              noWa: String(r[7] || "")
            });
          } else if (r[2] === "GURU_WALI") {
            listGuruWali.push({
              id: String(r[0]),
              nama: String(r[1]),
              noWa: String(r[7] || "")
            });
          }
        }
      });

      return responseJSON({
        success: true,
        data: {
          siswa: listSiswa,
          guruWali: listGuruWali
        }
      });
    }

    if (action === "login") {
      const username = (params.username || "").trim();
      const pin = (params.pin || "").trim();
      const sheetUsers = ss.getSheetByName(SHEET_USERS);
      const rows = sheetUsers.getDataRange().getValues().slice(1);

      const user = rows.find(r => 
        String(r[0]).toLowerCase() === username.toLowerCase() && 
        String(r[6]) === pin && 
        r[8] === "AKTIF"
      );

      if (user) {
        return responseJSON({
          success: true,
          user: {
            id: String(user[0]),
            nama: String(user[1]),
            role: String(user[2]),
            kelas: String(user[3]),
            guruWaliId: String(user[4]),
            guruWaliNama: String(user[5]),
            noWa: String(user[7] || "")
          }
        });
      } else {
        return responseJSON({ success: false, message: "ID Pengguna atau PIN salah!" });
      }
    }

    if (action === "getReportsForStudent") {
      const siswaId = (params.siswaId || "").trim();
      const sheetLaporan = ss.getSheetByName(SHEET_LAPORAN);
      const rows = sheetLaporan.getDataRange().getValues().slice(1);

      const reports = rows
        .filter(r => String(r[2]) === siswaId)
        .map(mapLaporanRow)
        .reverse();

      return responseJSON({ success: true, reports: reports });
    }

    // Mendapatkan laporan dan daftar siswa yang BELUM melapor untuk Guru Wali
    if (action === "getReportsForGuruWali") {
      const guruWaliId = (params.guruWaliId || "").trim();
      const tanggal = (params.tanggal || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd")).trim();
      
      const sheetUsers = ss.getSheetByName(SHEET_USERS);
      const userRows = sheetUsers.getDataRange().getValues().slice(1);
      
      // Ambil seluruh siswa binaan guru wali ini
      const siswaBinaan = userRows
        .filter(r => String(r[2]) === "ANAK" && String(r[4]) === guruWaliId && r[8] === "AKTIF")
        .map(r => ({
          id: String(r[0]),
          nama: String(r[1]),
          kelas: String(r[3]),
          guruWaliId: String(r[4]),
          guruWaliNama: String(r[5]),
          noWa: String(r[7] || "")
        }));

      // Ambil laporan
      const sheetLaporan = ss.getSheetByName(SHEET_LAPORAN);
      const laporanRows = sheetLaporan.getDataRange().getValues().slice(1);

      const reportsHariIni = laporanRows
        .filter(r => String(r[5]) === guruWaliId && String(r[1]) === tanggal)
        .map(mapLaporanRow);

      const idSiswaSudahLapor = reportsHariIni.map(r => r.siswaId);
      
      // Siswa yang BELUM lapor pada tanggal ini
      const belumLapor = siswaBinaan.filter(s => !idSiswaSudahLapor.includes(s.id));

      return responseJSON({
        success: true,
        tanggal: tanggal,
        totalBinaan: siswaBinaan.length,
        reports: reportsHariIni.reverse(),
        belumLapor: belumLapor
      });
    }

    if (action === "getAllReportsAdmin") {
      const sheetLaporan = ss.getSheetByName(SHEET_LAPORAN);
      const rows = sheetLaporan.getDataRange().getValues().slice(1);
      const reports = rows.map(mapLaporanRow).reverse();
      return responseJSON({ success: true, reports: reports });
    }

    return responseJSON({ success: false, message: "Aksi tidak dikenali: " + action });
  } catch (err) {
    return responseJSON({ success: false, message: err.toString() });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. Simpan Laporan Harian Anak
    if (action === "simpanLaporan") {
      const sheetLaporan = ss.getSheetByName(SHEET_LAPORAN);
      const tanggal = payload.tanggal || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
      const siswaId = String(payload.siswaId);
      
      const rows = sheetLaporan.getDataRange().getValues().slice(1);
      let existingRowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][1]) === tanggal && String(rows[i][2]) === siswaId) {
          existingRowIndex = i + 2;
          break;
        }
      }

      // Upload Foto Kamera jika ada
      let fotoUrl = payload.fotoUrl || "";
      if (payload.fotoBase64) {
        fotoUrl = simpanFotoKeDrive(payload.fotoBase64, siswaId, tanggal);
      }

      const laporanId = existingRowIndex > 0 ? rows[existingRowIndex - 2][0] : "LAP-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMMdd-HHmmss") + "-" + Math.floor(Math.random() * 1000);
      const waktuSekarang = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

      const rowData = [
        laporanId,
        tanggal,
        siswaId,
        payload.siswaNama || "",
        payload.kelas || "",
        payload.guruWaliId || "",
        payload.guruWaliNama || "",
        payload.k1 ? "YA" : "TIDAK",
        payload.k2 ? "YA" : "TIDAK",
        payload.k3 ? "YA" : "TIDAK",
        payload.k4 ? "YA" : "TIDAK",
        payload.k5 ? "YA" : "TIDAK",
        payload.k6 ? "YA" : "TIDAK",
        payload.k7 ? "YA" : "TIDAK",
        JSON.stringify(payload.detail || {}),
        fotoUrl,
        "MENUNGGU",
        "",
        waktuSekarang,
        ""
      ];

      if (existingRowIndex > 0) {
        if (!fotoUrl && rows[existingRowIndex - 2][15]) {
          rowData[15] = rows[existingRowIndex - 2][15];
        }
        sheetLaporan.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheetLaporan.appendRow(rowData);
      }

      return responseJSON({ 
        success: true, 
        message: "Laporan 7 Kebiasaan berhasil disimpan dan diteruskan ke Guru Wali!",
        fotoUrl: fotoUrl 
      });
    }

    // 2. Validasi Laporan oleh Guru Wali
    if (action === "validasiLaporan") {
      const laporanId = payload.laporanId;
      const status = payload.status;
      const catatan = payload.catatan || "";
      const sheetLaporan = ss.getSheetByName(SHEET_LAPORAN);
      const rows = sheetLaporan.getDataRange().getValues().slice(1);

      let targetRowIndex = -1;
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === String(laporanId)) {
          targetRowIndex = i + 2;
          break;
        }
      }

      if (targetRowIndex > 0) {
        const waktuValidasi = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
        sheetLaporan.getRange(targetRowIndex, 17).setValue(status);
        sheetLaporan.getRange(targetRowIndex, 18).setValue(catatan);
        sheetLaporan.getRange(targetRowIndex, 20).setValue(waktuValidasi);
        return responseJSON({ success: true, message: "Laporan berhasil divalidasi oleh Guru Wali!" });
      } else {
        return responseJSON({ success: false, message: "Data laporan tidak ditemukan!" });
      }
    }

    // 3. Simpan User (Admin)
    if (action === "simpanUser") {
      const sheetUsers = ss.getSheetByName(SHEET_USERS);
      const rows = sheetUsers.getDataRange().getValues().slice(1);
      const idUser = payload.id;

      let targetRow = -1;
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === String(idUser)) {
          targetRow = i + 2;
          break;
        }
      }

      const userData = [
        idUser,
        payload.nama,
        payload.role,
        payload.kelas || "-",
        payload.guruWaliId || "-",
        payload.guruWaliNama || "-",
        payload.pin || "1234",
        payload.noWa || "-",
        payload.status || "AKTIF"
      ];

      if (targetRow > 0) {
        sheetUsers.getRange(targetRow, 1, 1, userData.length).setValues([userData]);
      } else {
        sheetUsers.appendRow(userData);
      }

      return responseJSON({ success: true, message: "Data pengguna berhasil disimpan!" });
    }

    return responseJSON({ success: false, message: "Aksi POST tidak valid." });
  } catch (err) {
    return responseJSON({ success: false, message: err.toString() });
  }
}

/**
 * Simpan Foto Terkompresi Kamera Langsung ke Google Drive
 */
function simpanFotoKeDrive(base64Data, siswaId, tanggal) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetConfig = ss.getSheetByName(SHEET_CONFIG);
    let folderId = "";
    
    if (sheetConfig) {
      const configs = sheetConfig.getDataRange().getValues();
      for (let i = 1; i < configs.length; i++) {
        if (configs[i][0] === "DRIVE_FOLDER_ID") {
          folderId = configs[i][1];
          break;
        }
      }
    }

    let folder;
    if (folderId) {
      try {
        folder = DriveApp.getFolderById(folderId);
      } catch (e) {
        folder = null;
      }
    }

    if (!folder) {
      const existing = DriveApp.getFoldersByName(FOLDER_FOTO_NAME);
      if (existing.hasNext()) {
        folder = existing.next();
      } else {
        folder = DriveApp.createFolder(FOLDER_FOTO_NAME);
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
    }

    const cleanBase64 = base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
    const decodedBlob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), "image/jpeg", "FotoLive_" + siswaId + "_" + tanggal + ".jpg");
    
    const file = folder.createFile(decodedBlob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return "https://lh3.googleusercontent.com/d/" + file.getId();
  } catch (e) {
    Logger.log("Error upload foto: " + e.toString());
    return "";
  }
}

/**
 * Helper Map Row Laporan
 */
function mapLaporanRow(r) {
  let detailObj = {};
  try {
    detailObj = JSON.parse(r[14] || "{}");
  } catch(e) {}

  return {
    laporanId: String(r[0]),
    tanggal: Utilities.formatDate(new Date(r[1]), "Asia/Jakarta", "yyyy-MM-dd"),
    siswaId: String(r[2]),
    siswaNama: String(r[3]),
    kelas: String(r[4]),
    guruWaliId: String(r[5]),
    guruWaliNama: String(r[6]),
    k1: r[7] === "YA",
    k2: r[8] === "YA",
    k3: r[9] === "YA",
    k4: r[10] === "YA",
    k5: r[11] === "YA",
    k6: r[12] === "YA",
    k7: r[13] === "YA",
    detail: detailObj,
    fotoUrl: String(r[15] || ""),
    statusValidasi: String(r[16] || "MENUNGGU"),
    catatanGuruWali: String(r[17] || ""),
    waktuInput: String(r[18] || ""),
    waktuValidasi: String(r[19] || "")
  };
}

/**
 * Helper Response JSON
 */
function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
