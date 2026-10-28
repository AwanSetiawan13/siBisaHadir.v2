(function () {
  'use strict';

  const CAMPAIGN_STORAGE_KEY = 'bisa_campaign_list_v14';
  const NOTIFICATION_STORAGE_KEY = 'bisa_notifikasi_campaign_v1';
  const CATEGORY_STORAGE_KEY = 'spv_kategori_produk_v1';
  const MAX_NOTIFICATIONS = 100;

  const FIELD_LABELS = {
    idCampaign: 'ID Campaign',
    brand: 'Brand / Seller',
    pid: 'PID',
    kategori: 'Kategori',
    jenis: 'Jenis Campaign',
    tanggalMulai: 'Tanggal Mulai',
    tanggalSelesai: 'Tanggal Selesai',
    statusCampaign: 'Status Campaign',
    jenisKolaborasi: 'Jenis Kolaborasi',
    adsSupport: 'Ads Support',
    adsHandling: 'Ads Handling',
    adsOperating: 'Ads Operating',
    priority: 'Priority',
    targetGmv: 'Target GMV',
    pic: 'PIC',
    linkReport: 'Link Report',
    statusSampel: 'Status Sampel'
  };

  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (error) {
      return fallback;
    }
  }

  function cleanText(value) {
    return String(value == null ? '' : value).trim();
  }

  function cleanKey(value) {
    return cleanText(value).toLowerCase();
  }

  function normalizeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function loadCampaigns() {
    const data = safeParse(CAMPAIGN_STORAGE_KEY, []);
    return Array.isArray(data) ? data : [];
  }

  function saveCampaigns(list) {
    localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  }

  function getRole() {
    return cleanText(localStorage.getItem('user_role'));
  }

  function getCurrentUser() {
    const role = getRole();
    const fallbackName = role === 'spv_kol' ? 'SPV KOL' : (role === 'admin' ? 'Admin' : 'Staff KOL');
    return {
      role: role,
      name: cleanText(localStorage.getItem('user_name')) || fallbackName,
      pic: role === 'staff_kol' ? cleanText(localStorage.getItem('user_pic')) : ''
    };
  }

  function isStaffKol() {
    return getRole() === 'staff_kol';
  }

  function getCurrentPic() {
    return isStaffKol() ? cleanText(localStorage.getItem('user_pic')) : '';
  }

  function isStaffPicRestricted() {
    return isStaffKol() && getCurrentPic() !== '';
  }

  function getCategoryMaster() {
    const saved = safeParse(CATEGORY_STORAGE_KEY, []);
    if (Array.isArray(saved) && saved.length > 0) return saved;
    return [
      { kategori: 'Fashion Muslim', pic: 'Setiawan' },
      { kategori: 'Beauty & Care', pic: 'Amanda' },
      { kategori: 'Food & Beverage', pic: 'Dimas' },
      { kategori: 'Mom & Baby', pic: 'Clarissa' },
      { kategori: 'Otomotif', pic: 'Dimas' }
    ];
  }

  function getPicForCategory(categoryName) {
    const category = cleanKey(categoryName);
    if (!category) return '';
    const match = getCategoryMaster().find(function (item) {
      const name = cleanKey(item.kategori || item.namaKategori);
      return name && (name === category || category.includes(name) || name.includes(category));
    });
    return match ? cleanText(match.pic) : '';
  }

  function getCampaignPic(campaign) {
    if (!campaign || typeof campaign !== 'object') return '';
    return cleanText(campaign.pic) || getPicForCategory(campaign.kategori);
  }

  function getCreatorPicKeys(creator) {
    if (!creator || typeof creator !== 'object') return [];
    const explicit = [creator.pic1, creator.pic2, creator.pic3, creator.pic]
      .map(cleanKey)
      .filter(Boolean);
    const categories = normalizeArray(creator.categories);
    if (categories.length === 0 && creator.category) categories.push(creator.category);
    if (creator.kategori1 && creator.kategori1 !== '-') categories.push(creator.kategori1);
    if (creator.kategori2 && creator.kategori2 !== '-') categories.push(creator.kategori2);
    if (creator.kategori3 && creator.kategori3 !== '-') categories.push(creator.kategori3);
    if (creator.kategori && creator.kategori !== '-') {
      creator.kategori.split(',').forEach(function (c) {
        const clean = c.trim();
        if (clean && clean !== '-') categories.push(clean);
      });
    }
    const fromCategories = categories.map(getPicForCategory).map(cleanKey).filter(Boolean);
    return Array.from(new Set(explicit.concat(fromCategories)));
  }

  function getCreatorCategoriesForPic(creator, targetPic) {
    if (!creator || typeof creator !== 'object') return [];
    const picKey = cleanKey(targetPic);
    if (!picKey) return [];

    const result = [];
    const checkCat = function (catName, explicitPic) {
      if (!catName || catName === '-') return;
      const cleanName = cleanText(catName);
      const pic = cleanKey(explicitPic) || cleanKey(getPicForCategory(cleanName));
      if (pic === picKey && !result.includes(cleanName)) {
        result.push(cleanName);
      }
    };

    if (creator.kategori1) checkCat(creator.kategori1, creator.pic1);
    if (creator.kategori2) checkCat(creator.kategori2, creator.pic2);
    if (creator.kategori3) checkCat(creator.kategori3, creator.pic3);

    const categories = normalizeArray(creator.categories);
    categories.forEach(function (c) { checkCat(c, ''); });

    if (creator.kategori && creator.kategori !== '-') {
      creator.kategori.split(',').forEach(function (c) { checkCat(c.trim(), ''); });
    }
    if (creator.category) checkCat(creator.category, '');

    return result;
  }

  function isCreatorAllowedForPic(creator, pic) {
    const targetPic = cleanKey(pic);
    if (!targetPic) return true;
    return getCreatorPicKeys(creator).includes(targetPic);
  }

  function canViewCampaign(campaign) {
    if (!isStaffPicRestricted()) return true;
    return cleanKey(getCampaignPic(campaign)) === cleanKey(getCurrentPic());
  }

  function canManageCampaign(campaign) {
    if (!isStaffKol()) return true;
    if (!isStaffPicRestricted()) return false;
    return cleanKey(getCampaignPic(campaign)) === cleanKey(getCurrentPic());
  }

  function getScopedCampaigns(list) {
    if (!isStaffPicRestricted()) return normalizeArray(list);
    return normalizeArray(list).filter(canViewCampaign);
  }

  function roleLabel(role) {
    if (role === 'spv_kol') return 'SPV KOL';
    if (role === 'staff_kol') return 'Staff KOL';
    if (role === 'admin') return 'Admin';
    return cleanText(role) || 'Pengguna';
  }

  function formatDateTime(value) {
    const date = value ? new Date(value) : new Date();
    const safeDate = isNaN(date.getTime()) ? new Date() : date;
    try {
      const text = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }).format(safeDate);
      return text.replace(/\./g, ':') + ' WIB';
    } catch (error) {
      return safeDate.toLocaleString('id-ID');
    }
  }

  function displayValue(value) {
    const text = cleanText(value);
    return text || '-';
  }

  function diffCampaign(before, after) {
    const source = before && typeof before === 'object' ? before : {};
    const target = after && typeof after === 'object' ? after : {};
    return Object.keys(FIELD_LABELS).reduce(function (rows, field) {
      const oldValue = displayValue(source[field]);
      const newValue = displayValue(target[field]);
      if (oldValue !== newValue) {
        rows.push({ field: field, label: FIELD_LABELS[field], dari: oldValue, ke: newValue });
      }
      return rows;
    }, []);
  }

  function creatorKey(creator) {
    if (!creator || typeof creator !== 'object') return '';
    return cleanText(creator.id) || cleanKey(creator.name || creator.username);
  }

  function creatorName(creator) {
    if (!creator || typeof creator !== 'object') return 'Kreator';
    return cleanText(creator.name || creator.username) || 'Kreator';
  }

  function diffCreators(beforeList, afterList) {
    const before = normalizeArray(beforeList);
    const after = normalizeArray(afterList);
    const beforeMap = new Map(before.map(function (item) { return [creatorKey(item), creatorName(item)]; }));
    const afterMap = new Map(after.map(function (item) { return [creatorKey(item), creatorName(item)]; }));
    const ditambah = [];
    const dikeluarkan = [];
    afterMap.forEach(function (name, key) {
      if (!beforeMap.has(key)) ditambah.push(name);
    });
    beforeMap.forEach(function (name, key) {
      if (!afterMap.has(key)) dikeluarkan.push(name);
    });
    return { ditambah: ditambah, dikeluarkan: dikeluarkan };
  }

  function ensureCampaignHistory(campaign) {
    if (!campaign || typeof campaign !== 'object') return [];
    if (!Array.isArray(campaign.riwayatPerubahan)) campaign.riwayatPerubahan = [];
    return campaign.riwayatPerubahan;
  }

  function getNotifications() {
    const data = safeParse(NOTIFICATION_STORAGE_KEY, []);
    return Array.isArray(data) ? data : [];
  }

  function saveNotifications(list) {
    const safeList = normalizeArray(list)
      .sort(function (a, b) { return (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0); })
      .slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(safeList));
  }

  function pushNotification(campaign, entry) {
    const user = getCurrentUser();
    if (user.role !== 'staff_kol' || !campaign || !entry) return null;
    const notifications = getNotifications();
    const title = entry.tipe === 'keluarkan_kreator'
      ? 'Kreator Campaign Dikeluarkan'
      : (entry.kreator && entry.kreator.ditambah && entry.kreator.ditambah.length > 0
        ? 'Kreator Campaign Ditambahkan'
        : 'Campaign Diperbarui');
    const campaignLabel = cleanText(campaign.idCampaign || campaign.id) || 'Campaign';
    const brandLabel = cleanText(campaign.brand) || campaignLabel;
    const notification = {
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      targetRole: 'spv_kol',
      pic: cleanText(campaign.pic) || user.pic,
      campaignDbId: campaign.id || '',
      campaignId: campaignLabel,
      brand: brandLabel,
      tipe: entry.tipe,
      judul: title,
      pesan: roleLabel(user.role) + ' ' + user.name + ' ' + entry.ringkasan + ' pada ' + brandLabel + ' (' + campaignLabel + ').',
      timestamp: entry.timestamp,
      tanggal: entry.tanggal,
      dibaca: false
    };
    notifications.unshift(notification);
    saveNotifications(notifications);
    return notification;
  }

  function buildChangeEntry(campaign, payload) {
    const user = getCurrentUser();
    const timestamp = Date.now();
    return {
      id: 'chg_' + timestamp + '_' + Math.random().toString(36).slice(2, 7),
      timestamp: timestamp,
      tanggal: formatDateTime(timestamp),
      oleh: user.name,
      role: user.role,
      roleLabel: roleLabel(user.role),
      pic: cleanText(campaign && campaign.pic) || user.pic,
      tipe: payload.tipe || 'edit_campaign',
      ringkasan: cleanText(payload.ringkasan) || 'Mengubah campaign',
      perubahan: normalizeArray(payload.perubahan),
      kreator: {
        ditambah: normalizeArray(payload.ditambah),
        dikeluarkan: normalizeArray(payload.dikeluarkan)
      },
      catatan: cleanText(payload.catatan)
    };
  }

  function summarizeChanges(changes, ditambah, dikeluarkan) {
    const parts = [];
    if (changes.length > 0) {
      parts.push('mengubah ' + changes.length + ' data campaign');
    }
    if (ditambah.length > 0) {
      parts.push('menambahkan ' + ditambah.length + ' kreator');
    }
    if (dikeluarkan.length > 0) {
      parts.push('mengeluarkan ' + dikeluarkan.length + ' kreator');
    }
    return parts.length > 0 ? parts.join(', ') : 'memperbarui campaign';
  }

  function recordCampaignEdit(campaign, before, after, options) {
    if (!campaign || typeof campaign !== 'object') return null;
    const changes = diffCampaign(before, after);
    const creatorDiff = diffCreators(
      before && before.kreatorDetails,
      after && after.kreatorDetails
    );
    if (changes.length === 0 && creatorDiff.ditambah.length === 0 && creatorDiff.dikeluarkan.length === 0) {
      return null;
    }
    const payload = {
      tipe: 'edit_campaign',
      ringkasan: summarizeChanges(changes, creatorDiff.ditambah, creatorDiff.dikeluarkan),
      perubahan: changes,
      ditambah: creatorDiff.ditambah,
      dikeluarkan: creatorDiff.dikeluarkan
    };
    const entry = buildChangeEntry(campaign, payload);
    ensureCampaignHistory(campaign).unshift(entry);
    if (!options || options.notify !== false) pushNotification(campaign, entry);
    return entry;
  }

  function recordCreatorRemoval(campaign, creator, reason) {
    if (!campaign || typeof campaign !== 'object') return null;
    const name = creatorName(creator);
    const catatan = cleanText(reason);
    const entry = buildChangeEntry(campaign, {
      tipe: 'keluarkan_kreator',
      ringkasan: 'mengeluarkan kreator ' + name,
      perubahan: [],
      ditambah: [],
      dikeluarkan: [name],
      catatan: catatan
    });
    ensureCampaignHistory(campaign).unshift(entry);
    pushNotification(campaign, entry);
    return entry;
  }

  function markNotificationRead(id) {
    const notifications = getNotifications();
    let changed = false;
    notifications.forEach(function (item) {
      if (String(item.id) === String(id) && !item.dibaca) {
        item.dibaca = true;
        changed = true;
      }
    });
    if (changed) saveNotifications(notifications);
    return changed;
  }

  function markAllNotificationsRead(role) {
    const targetRole = role || 'spv_kol';
    const notifications = getNotifications();
    let changed = false;
    notifications.forEach(function (item) {
      if (item.targetRole === targetRole && !item.dibaca) {
        item.dibaca = true;
        changed = true;
      }
    });
    if (changed) saveNotifications(notifications);
    return changed;
  }

  window.BMCampaignShared = {
    CAMPAIGN_STORAGE_KEY: CAMPAIGN_STORAGE_KEY,
    NOTIFICATION_STORAGE_KEY: NOTIFICATION_STORAGE_KEY,
    FIELD_LABELS: FIELD_LABELS,
    safeParse: safeParse,
    cleanText: cleanText,
    cleanKey: cleanKey,
    loadCampaigns: loadCampaigns,
    saveCampaigns: saveCampaigns,
    getCurrentUser: getCurrentUser,
    isStaffKol: isStaffKol,
    isStaffPicRestricted: isStaffPicRestricted,
    getCurrentPic: getCurrentPic,
    getCategoryMaster: getCategoryMaster,
    getPicForCategory: getPicForCategory,
    getCampaignPic: getCampaignPic,
    getCreatorPicKeys: getCreatorPicKeys,
    getCreatorCategoriesForPic: getCreatorCategoriesForPic,
    isCreatorAllowedForPic: isCreatorAllowedForPic,
    canViewCampaign: canViewCampaign,
    canManageCampaign: canManageCampaign,
    getScopedCampaigns: getScopedCampaigns,
    roleLabel: roleLabel,
    formatDateTime: formatDateTime,
    diffCampaign: diffCampaign,
    diffCreators: diffCreators,
    ensureCampaignHistory: ensureCampaignHistory,
    getNotifications: getNotifications,
    saveNotifications: saveNotifications,
    pushNotification: pushNotification,
    recordCampaignEdit: recordCampaignEdit,
    recordCreatorRemoval: recordCreatorRemoval,
    markNotificationRead: markNotificationRead,
    markAllNotificationsRead: markAllNotificationsRead
  };
})();
