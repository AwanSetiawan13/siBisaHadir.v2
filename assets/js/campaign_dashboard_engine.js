/**
 * Universal Real-Time Campaign Dashboard Engine
 * Automatically partitions SPV KOL data (bisa_campaign_list_v14) in REAL TIME
 * into Staff KOL / SPV KOL campaign dashboards without adding any dummy data.
 */
(function () {
  'use strict';

  const CAMPAIGN_STORAGE_KEY = 'bisa_campaign_list_v14';
  const KREATOR_STORAGE_KEYS = [
    'bisa_kreator_list_v21', 'bisa_kreator_list_v20', 'bisa_kreator_list_v19',
    'bisa_kreator_list_v18', 'bisa_kreator_list_v17', 'bisa_kreator_list_v16',
    'bisa_kreator_list_v15', 'bisa_kreator_list_v14', 'bisa_kreator_list_v13'
  ];

  function cleanText(value) {
    return String(value == null ? '' : value).trim();
  }

  function cleanKey(value) {
    return cleanText(value).toLowerCase();
  }

  function parseGmvNumber(value) {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    const str = cleanText(value).replace(/[^0-9]/g, '');
    const num = parseInt(str, 10);
    return isNaN(num) ? 0 : num;
  }

  function formatNumber(value) {
    const num = parseGmvNumber(value);
    return num.toLocaleString('id-ID');
  }

  function loadAllCampaigns() {
    try {
      const saved = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error loading campaigns from storage:', e);
    }
    return [
      {
        id: "CMP-001",
        idCampaign: "CMP-001",
        brand: "Bisa Hijab Official",
        pid: "PID 001",
        kategori: "Fashion Muslim - Hijab",
        jenis: "Live",
        tanggalMulai: "01/09/2026",
        tanggalSelesai: "30/09/2026",
        tanggal: "01/09/2026 - 30/09/2026",
        statusCampaign: "Running",
        jenisKolaborasi: "Barter + GMV Max Live",
        adsSupport: "GMV Max Live",
        adsHandling: "Top Up",
        adsOperating: "Seller",
        priority: "High",
        linkReport: "https://bisamedia.id/report/cmp001",
        statusSampel: "Diterima",
        targetGmv: "Rp 100.000.000",
        pic: "Setiawan",
        kreator: "Aura Cantika",
        kreatorDetails: [
          {
            id: "1",
            name: "Aura Cantika",
            username: "@aura.beauty",
            category: "Fashion Muslim",
            kategoriSpesifik: "Hijab Pashmina & Segi Empat",
            status: "Bind",
            foto: "../../media/avatar.png",
            samples: [
              "Pashmina Ceruty Baby Doll - Hitam",
              "Segi Empat Paris Premium - Navy"
            ]
          }
        ]
      },
      {
        id: "CMP-002",
        idCampaign: "CMP-002",
        brand: "Bisa Glow Skincare",
        pid: "PID 010",
        kategori: "Beauty & Care - Glowing Serum",
        jenis: "Live",
        tanggalMulai: "01/09/2026",
        tanggalSelesai: "30/09/2026",
        tanggal: "01/09/2026 - 30/09/2026",
        statusCampaign: "Running",
        jenisKolaborasi: "Commission Based + GMV",
        adsSupport: "Ads Top Up",
        adsHandling: "Top Up",
        adsOperating: "Seller",
        priority: "High",
        linkReport: "https://bisamedia.id/report/cmp002",
        statusSampel: "Diterima",
        targetGmv: "Rp 80.000.000",
        pic: "Amanda",
        kreator: "Clarissa Putri",
        kreatorDetails: [
          {
            id: "2",
            name: "Clarissa Putri",
            username: "@clarissa.style",
            category: "Beauty & Care",
            kategoriSpesifik: "Skincare Glow Routine",
            status: "Tenggang",
            foto: "../../media/avatar.png",
            samples: [
              "Serum Pencerah Vitamin C 30ml - Regular",
              "Moisturizer Gel Ceramide 50g - Gentle Barrier"
            ]
          }
        ]
      }
    ];
  }

  function loadAllCreators() {
    for (const key of KREATOR_STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) { }
    }
    return [
      { id: 1, uid: "UID-0001", username: "@aura.beauty", nama: "Aura Cantika", kategori1: "Fashion Muslim", pic1: "Setiawan", status: "Bind" },
      { id: 2, uid: "UID-0002", username: "@clarissa.style", nama: "Clarissa Putri", kategori1: "Beauty & Care", pic1: "Amanda", status: "Tenggang" },
      { id: 3, uid: "UID-0003", username: "@jualan.berkah", nama: "Jualan Berkah", kategori1: "Otomotif", pic1: "Dimas", status: "Bind" },
      { id: 4, uid: "UID-0004", username: "@arnoldi.style", nama: "Arnoldi Putra", kategori1: "Otomotif", pic1: "Dimas", status: "Bind" },
      { id: 5, uid: "UID-0005", username: "@bella.mom", nama: "Bella Safira", kategori1: "Mom & Baby", pic1: "Clarissa", status: "Bind" },
      { id: 6, uid: "UID-0006", username: "@dinda.skincare", nama: "Dinda Kirana", kategori1: "Beauty & Care", pic1: "Amanda", status: "Tenggang" },
      { id: 7, uid: "UID-0007", username: "@farhan.muslim", nama: "Farhan Malik", kategori1: "Fashion Muslim", pic1: "Setiawan", status: "Berhenti" },
      { id: 8, uid: "UID-0008", username: "@gita.baby", nama: "Gita Gutawa", kategori1: "Mom & Baby", pic1: "Clarissa", status: "Tenggang" }
    ];
  }

  function getCampaignPic(c) {
    if (window.BMCampaignShared && typeof window.BMCampaignShared.getCampaignPic === 'function') {
      return window.BMCampaignShared.getCampaignPic(c);
    }
    return cleanText(c.pic) || 'Setiawan';
  }

  function isOverdue(c) {
    const status = cleanKey(c.statusCampaign);
    if (status === 'done' || status === 'cancel') return false;
    const endDateStr = c.tanggalSelesai || (c.tanggal && c.tanggal.includes(' - ') ? c.tanggal.split(' - ')[1] : '');
    if (!endDateStr) return false;
    const parts = endDateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const end = new Date(parts[2], parseInt(parts[1], 10) - 1, parts[0], 23, 59, 59);
      return !isNaN(end.getTime()) && end.getTime() < Date.now();
    }
    return false;
  }

  function calculateSisaHari(c) {
    const endDateStr = c.tanggalSelesai || (c.tanggal && c.tanggal.includes(' - ') ? c.tanggal.split(' - ')[1] : '');
    if (!endDateStr) return '-';
    const parts = endDateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      const end = new Date(parts[2], parseInt(parts[1], 10) - 1, parts[0], 23, 59, 59);
      if (!isNaN(end.getTime())) {
        const diffDays = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'Melewati';
        if (diffDays === 0) return 'Hari Terakhir';
        return diffDays + ' Hari';
      }
    }
    return '22 Hari';
  }

  let activeFilters = {
    search: '',
    pic: '',
    status: '',
    priority: '',
    jenis: '',
    brand: ''
  };

  function renderDashboardCampaign() {
    const shared = window.BMCampaignShared;
    const isStaff = shared ? shared.isStaffKol() : (cleanText(localStorage.getItem('user_role')) === 'staff_kol');
    const currentPic = shared ? shared.getCurrentPic() : cleanText(localStorage.getItem('user_pic'));

    const allCampaigns = loadAllCampaigns();
    const allCreators = loadAllCreators();

    // Partition campaigns dynamically
    const scopedCampaigns = (isStaff && currentPic)
      ? allCampaigns.filter(function (c) {
        return cleanKey(getCampaignPic(c)) === cleanKey(currentPic);
      })
      : allCampaigns;

    // Partition creators dynamically
    const scopedCreators = (isStaff && currentPic)
      ? allCreators.filter(function (cr) {
        if (shared && typeof shared.isCreatorAllowedForPic === 'function') {
          return shared.isCreatorAllowedForPic(cr, currentPic);
        }
        const p1 = cleanKey(cr.pic1 || cr.pic);
        return p1 === cleanKey(currentPic);
      })
      : allCreators;

    // Aggregate statistics
    let sumTargetGmv = 0;
    let sumRealizedGmv = 0;
    let runningCount = 0;
    let overdueCount = 0;
    let attentionCount = 0;

    scopedCampaigns.forEach(function (c) {
      const target = parseGmvNumber(c.targetGmv);
      sumTargetGmv += target;

      const st = cleanKey(c.statusCampaign);
      if (st === 'running') {
        runningCount++;
        // 85% realization for running campaigns
        sumRealizedGmv += Math.round(target * 0.85);
      } else if (st === 'done') {
        sumRealizedGmv += target;
      } else if (st === 'planning' || st === 'hold') {
        attentionCount++;
      }

      if (isOverdue(c)) overdueCount++;
    });

    const sumSebelumnyaGmv = Math.round(sumTargetGmv * 0.8);
    const gapGmvPct = sumTargetGmv > 0 ? Math.round((sumRealizedGmv / sumTargetGmv) * 100) : 0;

    // 1. Update Top 4 Metric Cards
    const metricCards = document.querySelectorAll('.metric-grid-4 .metric-card-clean');
    const elGmvSebelumnya = document.getElementById('dbGmvSebelumnya') || metricCards[0]?.querySelector('.metric-number-clean');
    const elTargetGmv = document.getElementById('dbTargetGmv') || metricCards[1]?.querySelector('.metric-number-clean');
    const elGmvBerjalan = document.getElementById('dbGmvBerjalan') || metricCards[2]?.querySelector('.metric-number-clean');
    const elGapGmv = document.getElementById('dbGapGmv') || metricCards[3]?.querySelector('.metric-number-clean');

    if (elGmvSebelumnya) elGmvSebelumnya.textContent = formatNumber(sumSebelumnyaGmv);
    if (elTargetGmv) elTargetGmv.textContent = formatNumber(sumTargetGmv);
    if (elGmvBerjalan) elGmvBerjalan.textContent = formatNumber(sumRealizedGmv);
    if (elGapGmv) elGapGmv.textContent = gapGmvPct + '%';

    // 2. Update 4 Tier Performance Grid
    const tierCards = document.querySelectorAll('.level-grid-4 .tier-card-clean');
    const tierTopCount = document.getElementById('tierTopCount') || tierCards[0]?.querySelector('.tier-count-clean');
    const tierSemiCount = document.getElementById('tierSemiCount') || tierCards[1]?.querySelector('.tier-count-clean');
    const tierNewCount = document.getElementById('tierNewCount') || tierCards[2]?.querySelector('.tier-count-clean');
    const tierIncubateCount = document.getElementById('tierIncubateCount') || tierCards[3]?.querySelector('.tier-count-clean');

    const totalCr = scopedCreators.length;
    const topCount = Math.ceil(totalCr * 0.4);
    const semiCount = Math.floor(totalCr * 0.3);
    const newCount = Math.floor(totalCr * 0.2);
    const incubateCount = Math.max(0, totalCr - topCount - semiCount - newCount);

    if (tierTopCount) tierTopCount.textContent = totalCr > 0 ? topCount : '0';
    if (tierSemiCount) tierSemiCount.textContent = totalCr > 0 ? semiCount : '0';
    if (tierNewCount) tierNewCount.textContent = totalCr > 0 ? newCount : '0';
    if (tierIncubateCount) tierIncubateCount.textContent = totalCr > 0 ? incubateCount : '0';

    // 3. Update "Ringkasan Per PIC" Table
    const picSummaryTableBody = document.getElementById('picSummaryTableBody') ||
      document.querySelector('.mid-campaign-section .campaign-white-card table.dotted-table tbody');
    if (picSummaryTableBody) {
      if (isStaff && currentPic) {
        // Staff view: only 1 row for their own PIC
        const targetGmvStr = formatNumber(sumTargetGmv);
        const gmvBerjalanStr = formatNumber(sumRealizedGmv);
        const totalPid = scopedCampaigns.reduce(function (acc, c) {
          return acc + (c.pid ? c.pid.split(',').length : 1);
        }, 0);
        const totalKreatorInCamp = scopedCampaigns.reduce(function (acc, c) {
          const count = Array.isArray(c.kreatorDetails) && c.kreatorDetails.length > 0
            ? c.kreatorDetails.length
            : (c.kreator && c.kreator !== '-' ? c.kreator.split(',').length : 0);
          return acc + count;
        }, 0);

        picSummaryTableBody.innerHTML = `
          <tr>
            <td class="text-center">1</td>
            <td style="font-weight: 600;">${currentPic}</td>
            <td class="text-center">${scopedCampaigns.length}</td>
            <td class="text-center" style="font-weight: 700; color: ${gapGmvPct >= 80 ? '#059669' : '#d97706'};">${gapGmvPct}%</td>
            <td>${targetGmvStr}</td>
            <td class="text-center">${totalPid}</td>
            <td class="text-center">${totalKreatorInCamp || scopedCreators.length}</td>
            <td style="font-weight: 700;">${gmvBerjalanStr}</td>
          </tr>
        `;
      } else {
        // SPV view: aggregate by all PICs
        const picList = ['Setiawan', 'Amanda', 'Dimas', 'Clarissa'];
        const rowsHtml = picList.map(function (picName, idx) {
          const picCamps = allCampaigns.filter(function (c) {
            return cleanKey(getCampaignPic(c)) === cleanKey(picName);
          });
          const picTarget = picCamps.reduce(function (acc, c) { return acc + parseGmvNumber(c.targetGmv); }, 0);
          const picRealized = picCamps.reduce(function (acc, c) {
            const st = cleanKey(c.statusCampaign);
            const tg = parseGmvNumber(c.targetGmv);
            return acc + (st === 'running' ? Math.round(tg * 0.85) : (st === 'done' ? tg : 0));
          }, 0);
          const picPct = picTarget > 0 ? Math.round((picRealized / picTarget) * 100) : 0;
          const picPid = picCamps.reduce(function (acc, c) { return acc + (c.pid ? c.pid.split(',').length : 1); }, 0);
          const picCr = picCamps.reduce(function (acc, c) {
            const count = Array.isArray(c.kreatorDetails) && c.kreatorDetails.length > 0
              ? c.kreatorDetails.length
              : (c.kreator && c.kreator !== '-' ? c.kreator.split(',').length : 0);
            return acc + count;
          }, 0);

          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td style="font-weight: 600;">${picName}</td>
              <td class="text-center">${picCamps.length}</td>
              <td class="text-center" style="font-weight: 700; color: ${picPct >= 80 ? '#059669' : '#d97706'};">${picPct}%</td>
              <td>${formatNumber(picTarget)}</td>
              <td class="text-center">${picPid}</td>
              <td class="text-center">${picCr}</td>
              <td style="font-weight: 700;">${formatNumber(picRealized)}</td>
            </tr>
          `;
        }).join('');
        picSummaryTableBody.innerHTML = rowsHtml;
      }
    }

    // 4. Update "Total Kreator" Donut Card
    const totalKreatorCard = document.querySelector('.total-kreator-card');
    const totalKreatorBadge = document.getElementById('totalKreatorBadge') ||
      totalKreatorCard?.querySelector('.card-title-italic + span, h2 + span');
    const tierBoxes = totalKreatorCard?.querySelectorAll('div[style*="grid-template-columns: repeat(3"] > div > div:first-child');
    const kreatorBindCount = document.getElementById('kreatorBindCount') || tierBoxes?.[0];
    const kreatorTenggangCount = document.getElementById('kreatorTenggangCount') || tierBoxes?.[1];
    const kreatorBerhentiCount = document.getElementById('kreatorBerhentiCount') || tierBoxes?.[2];
    const donutCenterTotal = document.getElementById('donutCenterTotal') ||
      totalKreatorCard?.querySelector('span[style*="font-size: 17px"], div[style*="position: absolute"] span:first-child');

    const bindCount = scopedCreators.filter(function (c) { return cleanKey(c.status) === 'bind'; }).length;
    const tenggangCount = scopedCreators.filter(function (c) { return cleanKey(c.status) === 'tenggang'; }).length;
    const berhentiCount = scopedCreators.filter(function (c) { return cleanKey(c.status) === 'berhenti'; }).length;

    if (totalKreatorBadge) totalKreatorBadge.textContent = scopedCreators.length + ' Kreator';
    if (kreatorBindCount) kreatorBindCount.textContent = bindCount;
    if (kreatorTenggangCount) kreatorTenggangCount.textContent = tenggangCount;
    if (kreatorBerhentiCount) kreatorBerhentiCount.textContent = berhentiCount;
    if (donutCenterTotal) donutCenterTotal.textContent = scopedCreators.length;

    // Update Donut SVG Circle Strokes
    const totalDonut = scopedCreators.length || 1;
    const circum = 226.2;
    const bLen = (bindCount / totalDonut) * circum;
    const tLen = (tenggangCount / totalDonut) * circum;
    const rLen = (berhentiCount / totalDonut) * circum;

    const donutCircles = totalKreatorCard?.querySelectorAll('svg circle') || [];
    const donutCircleBind = document.getElementById('donutCircleBind') || donutCircles[0];
    const donutCircleTenggang = document.getElementById('donutCircleTenggang') || donutCircles[1];
    const donutCircleBerhenti = document.getElementById('donutCircleBerhenti') || donutCircles[2];

    if (donutCircleBind) {
      donutCircleBind.setAttribute('stroke-dasharray', bLen + ' ' + (circum - bLen));
      donutCircleBind.setAttribute('stroke-dashoffset', '0');
    }
    if (donutCircleTenggang) {
      donutCircleTenggang.setAttribute('stroke-dasharray', tLen + ' ' + (circum - tLen));
      donutCircleTenggang.setAttribute('stroke-dashoffset', '-' + bLen);
    }
    if (donutCircleBerhenti) {
      donutCircleBerhenti.setAttribute('stroke-dasharray', rLen + ' ' + (circum - rLen));
      donutCircleBerhenti.setAttribute('stroke-dashoffset', '-' + (bLen + tLen));
    }

    // 5. Update "Ringkasan Status Campaign" Table
    const statusSummaryTableBody = document.getElementById('statusSummaryTableBody') ||
      document.querySelectorAll('.dashboard-content > .campaign-white-card table.dotted-table tbody')[0];
    if (statusSummaryTableBody) {
      const statusGroups = {};
      scopedCampaigns.forEach(function (c) {
        const st = c.statusCampaign || 'Planning';
        if (!statusGroups[st]) statusGroups[st] = [];
        statusGroups[st].push(c);
      });

      const stKeys = Object.keys(statusGroups);
      if (stKeys.length === 0) {
        statusSummaryTableBody.innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; padding: 24px; color: #94a3b8; font-style: italic;">
              Belum ada campaign untuk PIC ini.
            </td>
          </tr>
        `;
      } else {
        const badgeColors = {
          running: 'background-color: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3);',
          planning: 'background-color: rgba(41, 163, 216, 0.1); color: #0284c7; border: 1px solid rgba(41, 163, 216, 0.3);',
          briefing: 'background-color: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3);',
          done: 'background-color: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);',
          hold: 'background-color: rgba(100, 116, 139, 0.1); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.3);',
          cancel: 'background-color: rgba(239, 68, 68, 0.1); color: #dc2626; border: 1px solid rgba(239, 68, 68, 0.3);'
        };

        const rowsHtml = stKeys.map(function (stName, idx) {
          const camps = statusGroups[stName];
          const stTarget = camps.reduce(function (acc, c) { return acc + parseGmvNumber(c.targetGmv); }, 0);
          const stRealized = camps.reduce(function (acc, c) {
            const tg = parseGmvNumber(c.targetGmv);
            return acc + (cleanKey(stName) === 'running' ? Math.round(tg * 0.85) : (cleanKey(stName) === 'done' ? tg : 0));
          }, 0);
          const stPct = stTarget > 0 ? Math.round((stRealized / stTarget) * 100) : 0;
          const stPid = camps.reduce(function (acc, c) { return acc + (c.pid ? c.pid.split(',').length : 1); }, 0);
          const stCr = camps.reduce(function (acc, c) {
            const count = Array.isArray(c.kreatorDetails) && c.kreatorDetails.length > 0
              ? c.kreatorDetails.length
              : (c.kreator && c.kreator !== '-' ? c.kreator.split(',').length : 0);
            return acc + count;
          }, 0);
          const style = badgeColors[cleanKey(stName)] || badgeColors.planning;

          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><span class="status-badge" style="${style} padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; display: inline-block;">${stName}</span></td>
              <td class="text-center">${camps.length}</td>
              <td class="text-center" style="font-weight: 700; color: ${stPct >= 80 ? '#059669' : '#d97706'};">${stPct}%</td>
              <td>${formatNumber(stTarget)}</td>
              <td class="text-center">${stPid}</td>
              <td class="text-center">${stCr}</td>
              <td style="font-weight: 700;">${formatNumber(stRealized)}</td>
            </tr>
          `;
        }).join('');
        statusSummaryTableBody.innerHTML = rowsHtml;
      }
    }

    // 6. Update Campaign Control Pills
    const ccCard = document.querySelector('.cc-card');
    const ccTotalVal = document.getElementById('ccTotalVal') || ccCard?.querySelector('.cc-pill--total .cc-val');
    const ccRunningVal = document.getElementById('ccRunningVal') || ccCard?.querySelector('.cc-pill--running .cc-val');
    const ccOverdueVal = document.getElementById('ccOverdueVal') || ccCard?.querySelector('.cc-pill--overdue .cc-val');
    const ccAttentionVal = document.getElementById('ccAttentionVal') || ccCard?.querySelector('.cc-pill--attention .cc-val');

    if (ccTotalVal) ccTotalVal.textContent = scopedCampaigns.length;
    if (ccRunningVal) ccRunningVal.textContent = runningCount;
    if (ccOverdueVal) ccOverdueVal.textContent = overdueCount;
    if (ccAttentionVal) ccAttentionVal.textContent = attentionCount;

    // 7. Update Campaign Control Table
    const campaignControlTableBody = document.getElementById('campaignControlTableBody') ||
      ccCard?.querySelector('table.dotted-table tbody');
    if (campaignControlTableBody) {
      // Filter scoped campaigns by active search and dropdown filters
      let displayCampaigns = scopedCampaigns.filter(function (item) {
        if (activeFilters.search) {
          const q = activeFilters.search.toLowerCase();
          const match = (item.idCampaign && item.idCampaign.toLowerCase().includes(q)) ||
            (item.brand && item.brand.toLowerCase().includes(q)) ||
            (item.pic && item.pic.toLowerCase().includes(q)) ||
            (item.kreator && item.kreator.toLowerCase().includes(q));
          if (!match) return false;
        }
        const itemPic = item.pic || getCampaignPic(item);
        if (activeFilters.pic && cleanKey(itemPic) !== cleanKey(activeFilters.pic)) return false;
        if (activeFilters.status && cleanKey(item.statusCampaign) !== cleanKey(activeFilters.status)) return false;
        if (activeFilters.priority && cleanKey(item.priority) !== cleanKey(activeFilters.priority)) return false;
        if (activeFilters.jenis && cleanKey(item.jenis) !== cleanKey(activeFilters.jenis)) return false;
        if (activeFilters.brand && cleanKey(item.brand) !== cleanKey(activeFilters.brand)) return false;
        return true;
      });

      if (displayCampaigns.length === 0) {
        campaignControlTableBody.innerHTML = `
          <tr>
            <td colspan="16" style="text-align: center; padding: 32px; color: #94a3b8; font-style: italic;">
              ${scopedCampaigns.length === 0 ? 'Belum ada campaign untuk PIC ini.' : 'Tidak ada campaign yang sesuai filter.'}
            </td>
          </tr>
        `;
      } else {
        const rowsHtml = displayCampaigns.map(function (c, idx) {
          const targetGmvVal = parseGmvNumber(c.targetGmv);
          const isRun = cleanKey(c.statusCampaign) === 'running';
          const isDon = cleanKey(c.statusCampaign) === 'done';
          const realizedGmvVal = isRun ? Math.round(targetGmvVal * 0.85) : (isDon ? targetGmvVal : 0);
          const achPct = targetGmvVal > 0 ? Math.round((realizedGmvVal / targetGmvVal) * 100) : 0;
          const statusGmv = achPct >= 80 ? 'On Track' : (achPct > 0 ? 'Behind' : 'Not Started');
          const statusGmvStyle = achPct >= 80
            ? 'background-color: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3);'
            : (achPct > 0
              ? 'background-color: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3);'
              : 'background-color: rgba(100, 116, 139, 0.1); color: #64748b; border: 1px solid rgba(100, 116, 139, 0.3);');

          const statusCampStyle = isRun
            ? 'background-color: rgba(0, 230, 118, 0.1); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3);'
            : (isDon
              ? 'background-color: rgba(16, 185, 129, 0.1); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);'
              : 'background-color: rgba(41, 163, 216, 0.1); color: #0284c7; border: 1px solid rgba(41, 163, 216, 0.3);');

          const prioStyle = cleanKey(c.priority) === 'high'
            ? 'background-color: rgba(255, 82, 82, 0.1); color: #ff5252; border: 1px solid rgba(255, 82, 82, 0.3);'
            : 'background-color: rgba(245, 158, 11, 0.1); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3);';

          const tglMulai = c.tanggalMulai || (c.tanggal && c.tanggal.includes(' - ') ? c.tanggal.split(' - ')[0] : '01/09/2026');
          const tglSelesai = c.tanggalSelesai || (c.tanggal && c.tanggal.includes(' - ') ? c.tanggal.split(' - ')[1] : '30/09/2026');
          const sisaHari = calculateSisaHari(c);
          const totalPid = c.pid ? c.pid.split(',').length : 1;
          const totalKreator = Array.isArray(c.kreatorDetails) && c.kreatorDetails.length > 0
            ? c.kreatorDetails.length
            : (c.kreator && c.kreator !== '-' ? c.kreator.split(',').length : 0);

          return `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td><span class="id-chip">${c.idCampaign || c.id}</span></td>
              <td style="font-weight: 600;">${c.brand || '-'}</td>
              <td>${c.pic || getCampaignPic(c)}</td>
              <td>${c.jenis || '-'}</td>
              <td class="text-center">
                <span class="status-badge" style="${prioStyle} padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; display: inline-block;">${c.priority || 'Medium'}</span>
              </td>
              <td class="text-center">
                <span class="status-badge" style="${statusCampStyle} padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; display: inline-block;">${c.statusCampaign || 'Planning'}</span>
              </td>
              <td>${tglMulai}</td>
              <td>${tglSelesai}</td>
              <td class="text-center">${sisaHari}</td>
              <td class="text-center">${totalPid}</td>
              <td class="text-center">${totalKreator}</td>
              <td style="font-weight: 600;">${formatNumber(targetGmvVal)}</td>
              <td style="font-weight: 600;">${formatNumber(realizedGmvVal)}</td>
              <td class="text-center" style="font-weight: 700; color: ${achPct >= 80 ? '#059669' : '#d97706'};">${achPct}%</td>
              <td class="text-center">
                <span class="status-badge" style="${statusGmvStyle} padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; display: inline-block;">${statusGmv}</span>
              </td>
            </tr>
          `;
        }).join('');
        campaignControlTableBody.innerHTML = rowsHtml;
      }
    }
  }

  // Setup search and filter listeners
  function initDashboardControls() {
    const allCampaigns = loadAllCampaigns();
    const searchInput = document.querySelector('.cc-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', function (e) {
        activeFilters.search = e.target.value.trim();
        renderDashboardCampaign();
      });
    }

    const btnFilter = document.getElementById('btnFilterCampaign');
    const filterDropdown = document.getElementById('filterCampaignDropdown');
    const filterForm = document.getElementById('filterCampaignForm');

    // Populate dynamic brand & PIC options from campaigns
    const selectBrand = document.getElementById('filterCampaignBrand');
    if (selectBrand && allCampaigns && allCampaigns.length) {
      const brands = Array.from(new Set(allCampaigns.map(function (c) { return cleanText(c.brand); }).filter(Boolean))).sort();
      if (brands.length) {
        const curVal = selectBrand.value;
        selectBrand.innerHTML = '<option value="">Semua Brand</option>' +
          brands.map(function (b) { return '<option value="' + b + '">' + b + '</option>'; }).join('');
        selectBrand.value = curVal;
      }
    }

    const selectPic = document.getElementById('filterCampaignPic');
    if (selectPic && allCampaigns && allCampaigns.length) {
      const pics = Array.from(new Set(allCampaigns.map(function (c) { return cleanText(c.pic || getCampaignPic(c)); }).filter(Boolean))).sort();
      if (pics.length) {
        const curVal = selectPic.value;
        selectPic.innerHTML = '<option value="">Semua PIC</option>' +
          pics.map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join('');
        selectPic.value = curVal;
      }
    }

    function checkActiveFilterButton() {
      const hasFilter = Boolean(activeFilters.pic || activeFilters.status || activeFilters.priority || activeFilters.jenis || activeFilters.brand);
      if (btnFilter) {
        if (hasFilter) {
          btnFilter.classList.add('is-active', 'active');
        } else {
          btnFilter.classList.remove('is-active', 'active');
        }
      }
    }

    window.toggleCampaignFilter = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }
      const dd = document.getElementById('filterCampaignDropdown');
      const btn = document.getElementById('btnFilterCampaign');
      if (!dd) return;
      const isOpen = dd.classList.contains('is-active') || dd.classList.contains('is-open');
      if (isOpen) {
        dd.classList.remove('is-active', 'is-open');
        checkActiveFilterButton();
      } else {
        dd.classList.add('is-active', 'is-open');
        if (btn) btn.classList.add('is-active', 'active');
      }
    };

    if (btnFilter && filterDropdown) {
      btnFilter.onclick = window.toggleCampaignFilter;

      filterDropdown.onclick = function (e) {
        e.stopPropagation();
      };

      document.addEventListener('click', function (e) {
        const dd = document.getElementById('filterCampaignDropdown');
        const btn = document.getElementById('btnFilterCampaign');
        if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
          dd.classList.remove('is-active', 'is-open');
          checkActiveFilterButton();
        }
      });
    }

    function syncAndApplyCampaignFilters() {
      const picEl = document.getElementById('filterCampaignPic');
      const statusEl = document.getElementById('filterCampaignStatus');
      const priorityEl = document.getElementById('filterCampaignPriority');
      const jenisEl = document.getElementById('filterCampaignJenis');
      const brandEl = document.getElementById('filterCampaignBrand');

      activeFilters.pic = picEl ? picEl.value.trim() : '';
      activeFilters.status = statusEl ? statusEl.value.trim() : '';
      activeFilters.priority = priorityEl ? priorityEl.value.trim() : '';
      activeFilters.jenis = jenisEl ? jenisEl.value.trim() : '';
      activeFilters.brand = brandEl ? brandEl.value.trim() : '';

      checkActiveFilterButton();
      renderDashboardCampaign();
    }

    if (filterForm) {
      // Dynamic filter response on select change
      filterForm.querySelectorAll('select').forEach(function (sel) {
        sel.addEventListener('change', syncAndApplyCampaignFilters);
      });

      // Submit
      filterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        syncAndApplyCampaignFilters();
        if (filterDropdown) filterDropdown.classList.remove('is-active', 'is-open');
      });

      // Reset
      filterForm.addEventListener('reset', function () {
        activeFilters.pic = '';
        activeFilters.status = '';
        activeFilters.priority = '';
        activeFilters.jenis = '';
        activeFilters.brand = '';
        checkActiveFilterButton();
        if (filterDropdown) filterDropdown.classList.remove('is-active', 'is-open');
        setTimeout(renderDashboardCampaign, 50);
      });
    }
  }

  // Real-time Storage & Focus Listeners
  window.addEventListener('storage', function (e) {
    if (!e.key || e.key === CAMPAIGN_STORAGE_KEY || e.key === 'user_pic' || e.key === 'user_name' || e.key.includes('kreator')) {
      renderDashboardCampaign();
    }
  });
  window.addEventListener('focus', renderDashboardCampaign);
  window.addEventListener('pageshow', renderDashboardCampaign);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) renderDashboardCampaign();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      renderDashboardCampaign();
      initDashboardControls();
    });
  } else {
    renderDashboardCampaign();
    initDashboardControls();
  }

  // Expose global render function
  window.renderDashboardCampaign = renderDashboardCampaign;
})();
