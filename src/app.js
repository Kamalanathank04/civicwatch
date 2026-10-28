/**
 * CivicWatch — Citizen-Powered Cleaner Cities
 * Core Logic Engine
 * Team HackSphere (Tamil Nadu) | Team ID: HSC|TN|03258
 */

const STORAGE_KEY = 'civicwatch_reports';
const SEED_DATA_URL = 'sample-data/initial-reports.json';

// Built-in initial seed fallback
const DEFAULT_SEED_REPORTS = [
  {
    id: "CW-2025-TN-1041",
    category: "Overflowing Garbage Bin",
    description: "Commercial waste and unsegregated household garbage overflowing from dual masonry bin. Spilling onto pedestrian walkway near bus shelter.",
    ward: "Ward 172 (Adyar)",
    street: "2nd Avenue",
    landmark: "Opposite Adyar Depot Bus Stand",
    latitude: 13.0067,
    longitude: 80.2571,
    status: "Reported",
    severity: "High",
    isAnonymous: true,
    citizenContact: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    photoUrl: "assets/sample-bin-overflow.svg",
    duplicateCount: 2,
    timeline: [
      {
        status: "Reported",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        actor: "Citizen (Anonymous)",
        note: "Initial report submitted with geo-coordinates."
      }
    ]
  },
  {
    id: "CW-2025-TN-1038",
    category: "Plastic Waste Accumulation",
    description: "Heavy accumulation of discarded plastic beverage bottles and food containers along the beach promenade perimeter wall.",
    ward: "Ward 172 (Adyar)",
    street: "6th Avenue / Beach Road",
    landmark: "Near Karl Schmidt Memorial, Besant Nagar",
    latitude: 13.0002,
    longitude: 80.2668,
    status: "In Progress",
    severity: "Medium",
    isAnonymous: true,
    citizenContact: null,
    createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    photoUrl: "assets/sample-plastic-beach.svg",
    duplicateCount: 1,
    timeline: [
      {
        status: "Reported",
        timestamp: new Date(Date.now() - 3600000 * 22).toISOString(),
        actor: "Citizen (Anonymous)",
        note: "Report logged."
      },
      {
        status: "In Progress",
        timestamp: new Date(Date.now() - 3600000 * 10).toISOString(),
        actor: "Ward Supervisor (Murugan)",
        note: "Assigned to Coastal Conservancy Squad with mini-tipper."
      }
    ]
  },
  {
    id: "CW-2025-TN-1025",
    category: "Blocked Storm Drain",
    description: "Stormwater runoff inlet grating completely choked with dense silt and plastic carry bags. Water pooling on road shoulder.",
    ward: "Ward 172 (Adyar)",
    street: "3rd Cross Street",
    landmark: "Kasturba Nagar, near Community Hall",
    latitude: 13.0034,
    longitude: 80.2520,
    status: "Resolved",
    severity: "Urgent",
    isAnonymous: false,
    citizenContact: "+91 98401 23456",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    photoUrl: "assets/sample-storm-drain.svg",
    duplicateCount: 0,
    timeline: [
      {
        status: "Reported",
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(),
        actor: "Citizen (Verified Phone)",
        note: "Urgent stormwater blockage reported."
      },
      {
        status: "In Progress",
        timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
        actor: "Ward Supervisor",
        note: "Dispatched GCC Super Sucker / Jetting unit."
      },
      {
        status: "Resolved",
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        actor: "Ward Supervisor",
        note: "De-silted by jetting unit. Water flow restored."
      }
    ]
  },
  {
    id: "CW-2025-TN-1019",
    category: "Construction & Demolition Debris",
    description: "Unauthorized night dumping of crushed masonry rubble and broken concrete blocks, obstructing pedestrian sidewalk.",
    ward: "Ward 172 (Adyar)",
    street: "1st Main Road",
    landmark: "Near Gandhi Nagar Club boundary",
    latitude: 13.0112,
    longitude: 80.2554,
    status: "Resolved",
    severity: "Medium",
    isAnonymous: true,
    citizenContact: null,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    photoUrl: "assets/sample-debris.svg",
    duplicateCount: 0,
    timeline: [
      {
        status: "Reported",
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
        actor: "Citizen (Anonymous)",
        note: "Sidewalk obstruction reported."
      },
      {
        status: "Resolved",
        timestamp: new Date(Date.now() - 3600000 * 50).toISOString(),
        actor: "Ward Supervisor",
        note: "Debris loaded into GCC truck and cleared to recycling yard."
      }
    ]
  }
];

// App State
const CivicApp = {
  currentRole: 'citizen', // 'citizen' or 'supervisor'
  activeTab: 'report', // 'report', 'track', 'feed'
  reports: [],
  compressedPhotoData: null,
  pendingSubmission: null,
  activeGeolocation: null,

  init() {
    this.loadReports();
    this.bindEvents();
    this.renderActiveRole();
    this.renderStats();
    this.renderReportsFeed();
    this.renderSupervisorTable();
  },

  loadReports() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.reports = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse localStorage data, resetting to seed', e);
        this.reports = [...DEFAULT_SEED_REPORTS];
        this.persistReports();
      }
    } else {
      this.reports = [...DEFAULT_SEED_REPORTS];
      this.persistReports();
    }
  },

  persistReports() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reports));
    } catch (e) {
      console.warn('Storage quota error while saving reports:', e);
      alert('Local storage quota reached. Consider resetting demo data.');
    }
  },

  resetDemoData() {
    if (confirm('Reset CivicWatch data to the initial Greater Chennai Corporation Ward 172 seed records?')) {
      this.reports = JSON.parse(JSON.stringify(DEFAULT_SEED_REPORTS));
      this.persistReports();
      this.renderStats();
      this.renderReportsFeed();
      this.renderSupervisorTable();
      alert('Demo data restored successfully.');
    }
  },

  bindEvents() {
    // Role switcher
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const role = e.currentTarget.dataset.role;
        this.setRole(role);
      });
    });

    // Tab switcher
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.setTab(tab);
      });
    });

    // Photo input & compression
    const photoInput = document.getElementById('photoInput');
    if (photoInput) {
      photoInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }

    const removePhotoBtn = document.getElementById('removePhotoBtn');
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', () => this.clearPhoto());
    }

    // Geolocation trigger
    const getGeoBtn = document.getElementById('getGeoBtn');
    if (getGeoBtn) {
      getGeoBtn.addEventListener('click', () => this.captureLocation());
    }

    // Anonymous toggle
    const anonToggle = document.getElementById('anonToggle');
    if (anonToggle) {
      anonToggle.addEventListener('change', (e) => {
        const phoneGroup = document.getElementById('phoneGroup');
        if (phoneGroup) {
          phoneGroup.style.display = e.target.checked ? 'none' : 'block';
        }
      });
    }

    // Form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
      reportForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Lookup tracking
    const trackSearchBtn = document.getElementById('trackSearchBtn');
    if (trackSearchBtn) {
      trackSearchBtn.addEventListener('click', () => this.handleTrackLookup());
    }

    const trackInput = document.getElementById('trackInput');
    if (trackInput) {
      trackInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleTrackLookup();
        }
      });
    }

    // Duplicate Modal buttons
    const duplicateUpvoteBtn = document.getElementById('duplicateUpvoteBtn');
    if (duplicateUpvoteBtn) {
      duplicateUpvoteBtn.addEventListener('click', () => this.confirmUpvoteDuplicate());
    }

    const duplicateProceedBtn = document.getElementById('duplicateProceedBtn');
    if (duplicateProceedBtn) {
      duplicateProceedBtn.addEventListener('click', () => this.forceSavePendingReport());
    }

    const duplicateCancelBtn = document.getElementById('duplicateCancelBtn');
    if (duplicateCancelBtn) {
      duplicateCancelBtn.addEventListener('click', () => this.closeModal('duplicateModal'));
    }

    // Status Update Modal buttons
    const saveStatusBtn = document.getElementById('saveStatusBtn');
    if (saveStatusBtn) {
      saveStatusBtn.addEventListener('click', () => this.saveStatusUpdate());
    }

    const cancelStatusBtn = document.getElementById('cancelStatusBtn');
    if (cancelStatusBtn) {
      cancelStatusBtn.addEventListener('click', () => this.closeModal('statusModal'));
    }

    // Supervisor Table Filters
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.renderSupervisorTable());
    }
    const searchFilter = document.getElementById('searchFilter');
    if (searchFilter) {
      searchFilter.addEventListener('input', () => this.renderSupervisorTable());
    }

    // Reset button
    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => this.resetDemoData());
    }
  },

  setRole(role) {
    this.currentRole = role;
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });
    this.renderActiveRole();
  },

  renderActiveRole() {
    const citizenSection = document.getElementById('citizenSection');
    const supervisorSection = document.getElementById('supervisorSection');
    
    if (this.currentRole === 'citizen') {
      if (citizenSection) citizenSection.style.display = 'block';
      if (supervisorSection) supervisorSection.style.display = 'none';
    } else {
      if (citizenSection) citizenSection.style.display = 'none';
      if (supervisorSection) supervisorSection.style.display = 'block';
      this.renderSupervisorTable();
      this.renderStats();
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.citizen-panel').forEach(panel => {
      panel.style.display = panel.id === `tab-${tab}` ? 'block' : 'none';
    });

    if (tab === 'feed') {
      this.renderReportsFeed();
    }
    if (tab === 'video') {
      EmbeddedVideoPlayer.init();
    }
  },

  // Client-Side Canvas Image Downsampling / Compression
  handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|gif)$/i)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 640;
        const scaleSize = MAX_WIDTH / img.width;
        const targetWidth = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        const targetHeight = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Compress to JPEG with 0.70 quality
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.70);
        this.compressedPhotoData = compressedBase64;

        // Update preview
        const previewImg = document.getElementById('previewImg');
        const previewContainer = document.getElementById('previewContainer');
        const dropzoneText = document.getElementById('dropzoneText');

        if (previewImg) previewImg.src = compressedBase64;
        if (previewContainer) previewContainer.style.display = 'block';
        if (dropzoneText) dropzoneText.style.display = 'none';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  },

  clearPhoto() {
    this.compressedPhotoData = null;
    const photoInput = document.getElementById('photoInput');
    const previewContainer = document.getElementById('previewContainer');
    const dropzoneText = document.getElementById('dropzoneText');

    if (photoInput) photoInput.value = '';
    if (previewContainer) previewContainer.style.display = 'none';
    if (dropzoneText) dropzoneText.style.display = 'block';
  },

  // Browser Geolocation
  captureLocation() {
    const geoStatus = document.getElementById('geoStatus');
    const streetInput = document.getElementById('streetInput');
    if (!navigator.geolocation) {
      if (geoStatus) geoStatus.textContent = 'Geolocation is not supported by your browser. Please enter street manually.';
      if (streetInput) streetInput.focus();
      return;
    }

    if (geoStatus) geoStatus.textContent = 'Acquiring GPS fix...';

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5));
        const lng = parseFloat(pos.coords.longitude.toFixed(5));
        this.activeGeolocation = { lat, lng };

        if (geoStatus) {
          geoStatus.innerHTML = `<strong>GPS Locked:</strong> ${lat}° N, ${lng}° E (±${Math.round(pos.coords.accuracy)}m)`;
        }
      },
      (err) => {
        console.warn('Geolocation permission denied or timed out:', err.message);
        if (geoStatus) {
          geoStatus.innerHTML = '<span style="color:#b91c1c;">Location access denied. Please enter street & landmark manually below.</span>';
        }
        if (streetInput) streetInput.focus();
      },
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
    );
  },

  // Form Submit Handler
  handleFormSubmit(e) {
    e.preventDefault();

    const category = document.getElementById('categorySelect').value;
    const description = document.getElementById('descriptionInput').value.trim();
    const ward = document.getElementById('wardSelect').value;
    const street = document.getElementById('streetInput').value.trim();
    const landmark = document.getElementById('landmarkInput').value.trim();
    const isAnonymous = document.getElementById('anonToggle').checked;
    const citizenContact = isAnonymous ? null : document.getElementById('phoneInput').value.trim();

    // Validation
    if (!category) {
      alert('Please select an issue category.');
      return;
    }
    if (description.length < 15) {
      alert('Please provide a descriptive observation (at least 15 characters).');
      return;
    }
    if (!street) {
      alert('Please enter the street name or specific location.');
      return;
    }
    if (!isAnonymous && citizenContact && !/^[0-9+\-\s]{8,15}$/.test(citizenContact)) {
      alert('Please enter a valid phone number or toggle Anonymous reporting.');
      return;
    }

    const newReport = {
      id: this.generateComplaintId(),
      category,
      description,
      ward,
      street,
      landmark: landmark || 'Near ' + street,
      latitude: this.activeGeolocation ? this.activeGeolocation.lat : 13.0067,
      longitude: this.activeGeolocation ? this.activeGeolocation.lng : 80.2571,
      status: 'Reported',
      severity: category.includes('Drain') || category.includes('Hazard') ? 'Urgent' : 'High',
      isAnonymous,
      citizenContact,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      photoUrl: this.compressedPhotoData || 'assets/sample-bin-overflow.svg',
      duplicateCount: 0,
      timeline: [
        {
          status: 'Reported',
          timestamp: new Date().toISOString(),
          actor: isAnonymous ? 'Citizen (Anonymous)' : 'Citizen (Verified Contact)',
          note: 'Civic complaint submitted.'
        }
      ]
    };

    // Explainable Duplicate Detection
    const duplicateMatch = this.detectDuplicate(newReport);
    if (duplicateMatch) {
      this.pendingSubmission = { newReport, duplicateMatch };
      this.showDuplicateModal(duplicateMatch);
      return;
    }

    // Direct save if no duplicate
    this.saveReport(newReport);
  },

  // Explainable Duplicate Detection Heuristic
  detectDuplicate(incoming) {
    const ACTIVE_WINDOW_MS = 72 * 60 * 60 * 1000; // 72-hour active window for unresolved complaints
    const now = Date.now();

    return this.reports.find(existing => {
      // Must be active (Reported or In Progress)
      if (existing.status === 'Resolved') return false;

      // Must be within 72 hours active window
      const existingTime = new Date(existing.createdAt).getTime();
      if (now - existingTime > ACTIVE_WINDOW_MS) return false;

      // Category matches or both relate to garbage/plastic
      const sameCategory = existing.category === incoming.category ||
        (existing.category.includes('Garbage') && incoming.category.includes('Plastic'));

      if (!sameCategory) return false;

      // Street similarity or ward match
      const streetMatch = existing.street.toLowerCase().includes(incoming.street.toLowerCase()) ||
                          incoming.street.toLowerCase().includes(existing.street.toLowerCase());

      return streetMatch;
    });
  },

  showDuplicateModal(existing) {
    const modal = document.getElementById('duplicateModal');
    const details = document.getElementById('duplicateDetails');
    if (details) {
      details.innerHTML = `
        <div style="background:#fef3c7; border:1px solid #fde68a; border-radius:6px; padding:12px; margin-bottom:12px;">
          <p><strong>Similar Active Complaint Found:</strong></p>
          <p style="margin-top:4px;"><strong>ID:</strong> <span class="team-pill" style="color:#78350f;">${existing.id}</span></p>
          <p><strong>Category:</strong> ${existing.category}</p>
          <p><strong>Location:</strong> ${existing.street}, ${existing.landmark}</p>
          <p><strong>Reported:</strong> ${this.formatTimeAgo(existing.createdAt)}</p>
          <p><strong>Current Status:</strong> <span class="badge badge-${existing.status.toLowerCase().replace(' ', '')}">${existing.status}</span></p>
        </div>
        <p style="font-size:0.85rem; color:#475569;">
          To avoid overwhelming sanitation supervisors with duplicate tickets for the same waste pile, you can support this existing ticket (raising its priority urgency), or file your report as a separate entry if it is at a different exact spot.
        </p>
      `;
    }
    if (modal) modal.classList.add('show');
  },

  confirmUpvoteDuplicate() {
    if (!this.pendingSubmission || !this.pendingSubmission.duplicateMatch) return;
    const matchId = this.pendingSubmission.duplicateMatch.id;
    const target = this.reports.find(r => r.id === matchId);
    if (target) {
      target.duplicateCount = (target.duplicateCount || 0) + 1;
      target.severity = 'Urgent'; // Elevate urgency
      target.timeline.push({
        status: target.status,
        timestamp: new Date().toISOString(),
        actor: 'Citizen Corroboration',
        note: `Additional citizen verified this ongoing issue from ${this.pendingSubmission.newReport.street}.`
      });
      this.persistReports();
      this.closeModal('duplicateModal');
      this.showSubmissionSuccess(target.id, true);
      this.resetReportForm();
    }
  },

  forceSavePendingReport() {
    if (!this.pendingSubmission) return;
    const report = this.pendingSubmission.newReport;
    this.closeModal('duplicateModal');
    this.saveReport(report);
  },

  saveReport(report) {
    this.reports.unshift(report);
    this.persistReports();
    this.showSubmissionSuccess(report.id, false);
    this.resetReportForm();
    this.renderReportsFeed();
    this.renderSupervisorTable();
    this.renderStats();
  },

  showSubmissionSuccess(id, wasUpvote) {
    const banner = document.getElementById('submissionSuccessBanner');
    const msg = document.getElementById('successBannerMsg');
    const idSpan = document.getElementById('successComplaintId');

    if (idSpan) idSpan.textContent = id;
    if (msg) {
      msg.textContent = wasUpvote ? 
        'Existing report priority elevated with your civic corroboration!' : 
        'Your civic report has been submitted successfully to Ward 172.';
    }
    if (banner) {
      banner.style.display = 'flex';
      banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  },

  resetReportForm() {
    const form = document.getElementById('reportForm');
    if (form) form.reset();
    this.clearPhoto();
    this.activeGeolocation = null;
    const geoStatus = document.getElementById('geoStatus');
    if (geoStatus) geoStatus.innerHTML = '';
    const phoneGroup = document.getElementById('phoneGroup');
    if (phoneGroup) phoneGroup.style.display = 'none';
  },

  generateComplaintId() {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `CW-2025-TN-${randomSuffix}`;
  },

  // Track Lookup Handler
  handleTrackLookup() {
    const input = document.getElementById('trackInput');
    const query = input.value.trim().toUpperCase();
    const resultBox = document.getElementById('trackResultBox');

    if (!query) {
      alert('Please enter a Complaint ID (e.g. CW-2025-TN-1041)');
      return;
    }

    const report = this.reports.find(r => r.id.toUpperCase() === query);
    if (!report) {
      resultBox.innerHTML = `
        <div class="card" style="text-align:center; padding:32px;">
          <p style="font-size:1.1rem; color:#b91c1c; font-weight:600;">Complaint ID "${query}" not found.</p>
          <p style="font-size:0.85rem; color:#64748b; margin-top:8px;">Please verify your token from your submission confirmation.</p>
        </div>
      `;
      resultBox.style.display = 'block';
      return;
    }

    this.renderTrackDetails(report, resultBox);
  },

  renderTrackDetails(report, container) {
    const statusClasses = {
      'Reported': 'badge-reported',
      'In Progress': 'badge-progress',
      'Resolved': 'badge-resolved'
    };

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <span class="badge ${statusClasses[report.status]}">${report.status}</span>
            <h3 class="card-title" style="margin-top:8px;">${report.category}</h3>
            <p class="card-subtitle">ID: <strong>${report.id}</strong> • Reported on ${new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          <div style="text-align:right;">
            <span class="badge ${report.severity === 'Urgent' ? 'badge-urgent' : 'badge-reported'}">${report.severity} Priority</span>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 140px; gap:20px;">
          <div>
            <p style="font-size:0.9rem; margin-bottom:12px;"><strong>Description:</strong> ${report.description}</p>
            <p style="font-size:0.85rem; color:#475569;"><strong>Location:</strong> ${report.street}, ${report.landmark} (${report.ward})</p>
            <p style="font-size:0.85rem; color:#475569;"><strong>Reporting Mode:</strong> ${report.isAnonymous ? 'Anonymous Citizen' : 'Citizen Contact: ' + report.citizenContact}</p>
            ${report.duplicateCount > 0 ? `<p style="font-size:0.85rem; color:#b45309; margin-top:6px;"><strong>Community Corroboration:</strong> +${report.duplicateCount} citizens confirmed this issue</p>` : ''}
          </div>
          <div>
            <img src="${report.photoUrl}" alt="Evidence" style="width:100%; height:100px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;">
          </div>
        </div>

        <h4 style="font-size:0.95rem; font-family:var(--font-serif); margin-top:20px; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">Accountability & Resolution Timeline</h4>
        <div class="timeline">
          ${report.timeline.map(item => `
            <div class="timeline-item">
              <div class="timeline-dot ${item.status === 'Resolved' ? 'resolved' : ''}"></div>
              <div class="timeline-time">${new Date(item.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              <div class="timeline-title">${item.status} — ${item.actor}</div>
              <div class="timeline-desc">${item.note}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    container.style.display = 'block';
  },

  // Public Reports Feed
  renderReportsFeed() {
    const feedContainer = document.getElementById('publicFeedContainer');
    if (!feedContainer) return;

    if (this.reports.length === 0) {
      feedContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">✓</div><p>No complaints reported in Ward 172.</p></div>';
      return;
    }

    feedContainer.innerHTML = this.reports.map(report => `
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
          <div>
            <span class="badge ${report.status === 'Reported' ? 'badge-reported' : report.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${report.status}</span>
            <span style="font-size:0.8rem; font-family:var(--font-mono); color:#64748b; margin-left:6px;">${report.id}</span>
          </div>
          <span style="font-size:0.75rem; color:#64748b;">${this.formatTimeAgo(report.createdAt)}</span>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 100px; gap:16px;">
          <div>
            <h4 style="font-family:var(--font-serif); font-size:1.05rem; color:#1b2a4a;">${report.category}</h4>
            <p style="font-size:0.85rem; color:#334155; margin:6px 0;">${report.description}</p>
            <p style="font-size:0.8rem; color:#64748b;">📍 ${report.street}, ${report.landmark}</p>
          </div>
          <div>
            <img src="${report.photoUrl}" alt="Evidence" style="width:100%; height:80px; object-fit:cover; border-radius:4px; border:1px solid #cbd5e1;">
          </div>
        </div>
      </div>
    `).join('');
  },

  // Municipal Supervisor Table
  renderSupervisorTable() {
    const tbody = document.getElementById('supervisorTableBody');
    if (!tbody) return;

    const statusFilter = document.getElementById('statusFilter')?.value || 'ALL';
    const searchQuery = document.getElementById('searchFilter')?.value.toLowerCase().trim() || '';

    const filtered = this.reports.filter(r => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesSearch = !searchQuery || 
        r.id.toLowerCase().includes(searchQuery) || 
        r.category.toLowerCase().includes(searchQuery) ||
        r.street.toLowerCase().includes(searchQuery) ||
        r.description.toLowerCase().includes(searchQuery);
      return matchesStatus && matchesSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:32px; color:#64748b;">No complaints match the filter criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(report => `
      <tr>
        <td>
          <span style="font-family:var(--font-mono); font-weight:600; color:#1b2a4a;">${report.id}</span>
          ${report.duplicateCount > 0 ? `<br><span class="badge" style="background:#fef3c7; color:#92400e; font-size:0.65rem;">+${report.duplicateCount} duplicates</span>` : ''}
        </td>
        <td>
          <strong>${report.category}</strong>
          <div style="font-size:0.75rem; color:#64748b; max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${report.description}</div>
        </td>
        <td>
          ${report.street}
          <div style="font-size:0.75rem; color:#64748b;">${report.landmark}</div>
        </td>
        <td>
          <span class="badge ${report.severity === 'Urgent' ? 'badge-urgent' : 'badge-reported'}">${report.severity}</span>
        </td>
        <td>
          <span class="badge ${report.status === 'Reported' ? 'badge-reported' : report.status === 'In Progress' ? 'badge-progress' : 'badge-resolved'}">${report.status}</span>
        </td>
        <td>
          <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="CivicApp.openStatusModal('${report.id}')">
            Action ▾
          </button>
        </td>
      </tr>
    `).join('');
  },

  renderStats() {
    const total = this.reports.length;
    const reported = this.reports.filter(r => r.status === 'Reported').length;
    const inProgress = this.reports.filter(r => r.status === 'In Progress').length;
    const resolved = this.reports.filter(r => r.status === 'Resolved').length;

    const statTotal = document.getElementById('statTotal');
    const statReported = document.getElementById('statReported');
    const statProgress = document.getElementById('statProgress');
    const statResolved = document.getElementById('statResolved');

    if (statTotal) statTotal.textContent = total;
    if (statReported) statReported.textContent = reported;
    if (statProgress) statProgress.textContent = inProgress;
    if (statResolved) statResolved.textContent = resolved;
  },

  // Status Update Modal (Supervisor Action)
  openStatusModal(id) {
    const report = this.reports.find(r => r.id === id);
    if (!report) return;

    this.activeStatusReportId = id;
    const modal = document.getElementById('statusModal');
    const targetIdSpan = document.getElementById('modalReportId');
    const newStatusSelect = document.getElementById('newStatusSelect');
    const officerNoteInput = document.getElementById('officerNoteInput');

    if (targetIdSpan) targetIdSpan.textContent = id;
    if (newStatusSelect) newStatusSelect.value = report.status === 'Reported' ? 'In Progress' : 'Resolved';
    if (officerNoteInput) officerNoteInput.value = '';

    if (modal) modal.classList.add('show');
  },

  saveStatusUpdate() {
    if (!this.activeStatusReportId) return;
    const report = this.reports.find(r => r.id === this.activeStatusReportId);
    if (!report) return;

    const newStatus = document.getElementById('newStatusSelect').value;
    const officerNote = document.getElementById('officerNoteInput').value.trim() || 
      (newStatus === 'In Progress' ? 'Assigned to conservancy crew.' : 'Cleared and inspected by ward team.');

    report.status = newStatus;
    report.updatedAt = new Date().toISOString();
    report.timeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      actor: 'Ward Supervisor (Murugan)',
      note: officerNote
    });

    this.persistReports();
    this.closeModal('statusModal');
    this.renderSupervisorTable();
    this.renderStats();
    this.renderReportsFeed();
    alert(`Complaint ${report.id} updated to "${newStatus}".`);
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
  },

  formatTimeAgo(isoString) {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
};

// ================= EMBEDDED VIDEO WALKTHROUGH PLAYER =================
const EmbeddedVideoPlayer = {
  initialized: false,
  isPlaying: false,
  currentTime: 0,
  currentSceneIdx: 0,
  lastFrameTime: null,
  TOTAL_DURATION: 108.0,
  audioCtx: null,
  audioBuffers: [],
  activeSource: null,

  SCENES: [
    { id: 0, name: "Cover & Team ID", start: 0, duration: 14.5, file: 'assets/audio/scene1.wav', narration: "Welcome to CivicWatch, developed by Team HackSphere from Tamil Nadu, Team ID HSC|TN|03258, presenting for the Clean and Sustainable Communities theme under the Viksit Bharat Young Leaders Dialogue." },
    { id: 1, name: "Portal Registration", start: 14.5, duration: 13.0, file: 'assets/audio/scene2.wav', narration: "To register, navigate to mybharat.gov.in, log in with your youth credentials, select the Hack for Social Cause track, and verify your team details and presentation deck." },
    { id: 2, name: "Citizen Reporting & Compression", start: 27.5, duration: 19.5, file: 'assets/audio/scene3.wav', narration: "In the CivicWatch citizen portal, reporting has zero friction. There are no mandatory logins or OTP walls. A citizen snaps a photo, which our offscreen canvas instantly compresses from 3MB to 42KB, and locks the GPS location." },
    { id: 3, name: "Explainable Deduplication", start: 47.0, duration: 17.5, file: 'assets/audio/scene4.wav', narration: "Upon submission, our explainable duplicate detection engine alerts the citizen if a nearby active report already exists. With one click, the citizen can corroborate the issue, instantly elevating its priority to urgent without creating redundant tickets." },
    { id: 4, name: "Ward 172 Supervisor Console", start: 64.5, duration: 16.0, file: 'assets/audio/scene5.wav', narration: "On the Ward 172 Supervisor Console, Officer Murugan reviews the deduplicated triage queue, inspects photo evidence, and dispatches a conservancy crew with mini-tipper truck, transitioning the ticket to In Progress." },
    { id: 5, name: "Public Timeline Tracking", start: 80.5, duration: 13.0, file: 'assets/audio/scene6.wav', narration: "The citizen can now track the unique complaint ID in real-time. The transparent resolution timeline shows every verified municipal action, eliminating the administrative black hole." },
    { id: 6, name: "Automated Tests & Wrap-Up", start: 93.5, duration: 14.5, file: 'assets/audio/scene7.wav', narration: "CivicWatch is backed by comprehensive automated test coverage, complete architectural design, and a clear pilot roadmap for Greater Chennai Corporation Ward 172. Thank you." }
  ],

  async init() {
    if (this.initialized) {
      this.render(this.currentTime);
      return;
    }

    this.canvas = document.getElementById('walkthroughCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.playBtn = document.getElementById('embeddedPlayBtn');
    this.restartBtn = document.getElementById('embeddedRestartBtn');
    this.voiceToggle = document.getElementById('embeddedVoiceToggle');
    this.progressBar = document.getElementById('embeddedProgressBar');
    this.timeDisplay = document.getElementById('embeddedTimeDisplay');

    this.bindEvents();
    this.initialized = true;
    this.render(0);
    this.startLoop();
  },

  base64ToArrayBuffer(dataUri) {
    const base64 = dataUri.split(',')[1];
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  },

  async initAudio() {
    if (this.audioCtx) return;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (!this.htmlAudioElements) this.htmlAudioElements = [];

      if (window.CIVIC_AUDIO_DATA) {
        for (let i = 0; i < this.SCENES.length; i++) {
          const key = 'scene' + (i + 1);
          const dataUri = window.CIVIC_AUDIO_DATA[key];
          if (dataUri) {
            const a = new Audio(dataUri);
            a.preload = 'auto';
            this.htmlAudioElements[i] = a;

            try {
              const arrayBuf = this.base64ToArrayBuffer(dataUri);
              this.audioBuffers[i] = await this.audioCtx.decodeAudioData(arrayBuf);
            } catch (decErr) {
              console.warn('Audio decoding error for', key, decErr);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Audio init warning:', e);
    }
  },

  playAudio(idx) {
    if (!this.voiceToggle?.checked) return;
    this.stopAudio();

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Method 1: Web Audio Buffer Source
    if (this.audioCtx && this.audioBuffers[idx]) {
      try {
        const src = this.audioCtx.createBufferSource();
        src.buffer = this.audioBuffers[idx];
        src.connect(this.audioCtx.destination);
        src.start();
        this.activeSource = src;
        return;
      } catch (e) {
        console.warn('Buffer playback error, trying HTML5 Audio:', e);
      }
    }

    // Method 2: HTML5 Audio from Base64 Data URI
    if (this.htmlAudioElements && this.htmlAudioElements[idx]) {
      try {
        this.htmlAudioElements[idx].currentTime = 0;
        this.htmlAudioElements[idx].play();
        this.activeHtmlAudio = this.htmlAudioElements[idx];
        return;
      } catch (e) {
        console.warn('HTML5 Audio playback error:', e);
      }
    }

    // Method 3: Native Web Speech API Fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(this.SCENES[idx].narration);
      window.speechSynthesis.speak(u);
    }
  },

  stopAudio() {
    if (this.activeSource) {
      try { this.activeSource.stop(); } catch (e) {}
      this.activeSource = null;
    }
    if (this.activeHtmlAudio) {
      try {
        this.activeHtmlAudio.pause();
        this.activeHtmlAudio.currentTime = 0;
      } catch (e) {}
      this.activeHtmlAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  bindEvents() {
    if (this.playBtn) {
      this.playBtn.addEventListener('click', async () => {
        await this.initAudio();
        this.isPlaying = !this.isPlaying;
        this.playBtn.textContent = this.isPlaying ? '⏸ Pause' : '▶ Play Walkthrough';
        if (this.isPlaying) {
          if (this.currentTime >= this.TOTAL_DURATION) {
            this.currentTime = 0;
            this.currentSceneIdx = 0;
          }
          this.playAudio(this.currentSceneIdx);
        } else {
          this.stopAudio();
        }
      });
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', async () => {
        await this.initAudio();
        this.stopAudio();
        this.currentTime = 0;
        this.currentSceneIdx = 0;
        this.isPlaying = true;
        this.playBtn.textContent = '⏸ Pause';
        this.playAudio(0);
      });
    }

    document.querySelectorAll('.embedded-chip').forEach(chip => {
      chip.addEventListener('click', async (e) => {
        await this.initAudio();
        this.stopAudio();
        const scId = parseInt(e.target.dataset.scene);
        this.currentSceneIdx = scId;
        this.currentTime = this.SCENES[scId].start;
        if (this.isPlaying) {
          this.playAudio(scId);
        } else {
          this.render(this.currentTime);
        }
      });
    });
  },

  startLoop() {
    const loop = (ts) => {
      if (!this.lastFrameTime) this.lastFrameTime = ts;
      const dt = (ts - this.lastFrameTime) / 1000;
      this.lastFrameTime = ts;

      if (this.isPlaying) {
        this.currentTime += dt;
        const scene = this.SCENES.find(s => this.currentTime >= s.start && this.currentTime < s.start + s.duration) || this.SCENES[this.SCENES.length - 1];
        if (scene.id !== this.currentSceneIdx) {
          this.currentSceneIdx = scene.id;
          this.playAudio(this.currentSceneIdx);
        }
        if (this.currentTime >= this.TOTAL_DURATION) {
          this.currentTime = this.TOTAL_DURATION;
          this.isPlaying = false;
          if (this.playBtn) this.playBtn.textContent = '▶ Play Walkthrough';
          this.stopAudio();
        }
      }

      this.render(this.currentTime);

      if (this.progressBar) {
        this.progressBar.style.width = ((this.currentTime / this.TOTAL_DURATION) * 100) + '%';
      }
      if (this.timeDisplay) {
        const m = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
        const s = Math.floor(this.currentTime % 60).toString().padStart(2, '0');
        this.timeDisplay.textContent = `${m}:${s} / 01:48`;
      }

      document.querySelectorAll('.embedded-chip').forEach(c => {
        const scId = parseInt(c.dataset.scene);
        c.style.borderColor = (scId === this.currentSceneIdx) ? '#0284c7' : '#cbd5e1';
        c.style.background = (scId === this.currentSceneIdx) ? '#e0f2fe' : 'transparent';
      });

      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  render(time) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const scene = this.SCENES.find(s => time >= s.start && time < s.start + s.duration) || this.SCENES[this.SCENES.length - 1];
    const sceneTime = time - scene.start;
    const sceneProgress = sceneTime / scene.duration;

    let fade = 1.0;
    if (sceneTime < 0.6) fade = sceneTime / 0.6;
    else if (sceneTime > scene.duration - 0.6) fade = (scene.duration - sceneTime) / 0.6;
    fade = Math.max(0, Math.min(1, fade));

    ctx.clearRect(0, 0, 1280, 720);

    // Top Header
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1280, 65);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText('CivicWatch — Video Walkthrough', 40, 40);
    ctx.fillStyle = '#c5a880';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('TEAM ID: HSC|TN|03258 • TAMIL NADU', 880, 40);

    ctx.save();
    ctx.globalAlpha = fade;

    if (scene.id === 0) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 65, 1280, 580);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(640, 340, 240, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#c5a880';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(100, 100, 1080, 480);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🇮🇳 VIKSIT BHARAT YOUNG LEADERS DIALOGUE • MOYAS & IIT BOMBAY', 640, 150);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px Georgia, serif';
      ctx.fillText('MyBharat Hack for Social Cause', 640, 220);

      ctx.fillStyle = '#93c5fd';
      ctx.font = '22px system-ui';
      ctx.fillText('Theme: Clean & Sustainable Communities', 640, 265);

      ctx.fillStyle = 'rgba(27, 42, 74, 0.95)';
      ctx.fillRect(240, 310, 800, 230);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(240, 310, 800, 230);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px Georgia, serif';
      ctx.fillText('CivicWatch', 640, 360);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '18px system-ui';
      ctx.fillText('Zero-Friction Reporting & Proximity Deduplication for Urban Bodies', 640, 400);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Team HackSphere | Official Team ID: HSC|TN|03258 | Tamil Nadu', 640, 450);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '15px system-ui';
      ctx.fillText('Kamalanathan K (Lead) • Gunasri R (QA/Docs) • Krishnaprasad S (Backend)', 640, 490);
      ctx.textAlign = 'left';
    } else if (scene.id === 1) {
      ctx.fillStyle = '#1b2a4a';
      ctx.fillRect(0, 65, 1280, 580);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(80, 95, 1120, 490);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(80, 95, 1120, 42);
      ctx.fillStyle = '#334155';
      ctx.font = '14px monospace';
      ctx.fillText('🔒 https://mybharat.gov.in/vbyld/hack-for-social-cause', 105, 122);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(110, 160, 1060, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px system-ui';
      ctx.fillText('Mera Yuva Bharat • Official Project Submission Console', 135, 198);

      const items = [
        'Registered Team ID: HSC|TN|03258 (Verified Quota: Tamil Nadu)',
        'Track Category: Clean & Sustainable Communities (VBYLD 2026)',
        'Pilot Scope: Greater Chennai Corporation — Ward 172 (Adyar / Besant Nagar)',
        'Attached Artifacts: 7-Slide @HSC Template Deck, GitHub Codebase, Walkthrough Video',
        'Academic Integrity: Disclosed Google Antigravity & Gemini for docs, styling & test suite'
      ];
      items.forEach((it, idx) => {
        if (sceneProgress * items.length >= idx) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(110, 240 + idx * 58, 1060, 46);
          ctx.fillStyle = '#059669';
          ctx.font = 'bold 16px system-ui';
          ctx.fillText('✓', 135, 270 + idx * 58);
          ctx.fillStyle = '#1e293b';
          ctx.font = '15px system-ui';
          ctx.fillText(it, 165, 270 + idx * 58);
        }
      });
    } else if (scene.id === 2) {
      ctx.fillStyle = '#fbf9f5';
      ctx.fillRect(0, 65, 1280, 580);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(60, 90, 680, 500);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(60, 90, 680, 500);

      ctx.fillStyle = '#1b2a4a';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('Report Civic or Sanitation Hazard', 90, 130);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(90, 175, 620, 38);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(90, 175, 620, 38);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText('Category: Blocked Storm Drain (Pre-Monsoon Risk)', 105, 200);

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(90, 230, 620, 55);
      ctx.strokeRect(90, 230, 620, 55);
      ctx.fillStyle = '#334155';
      ctx.font = '13px system-ui';
      ctx.fillText('Dense silt and plastic debris choking stormwater inlet grating on 2nd Avenue.', 105, 255);

      ctx.fillStyle = '#ecfdf5';
      ctx.fillRect(90, 305, 620, 38);
      ctx.strokeStyle = '#a7f3d0';
      ctx.strokeRect(90, 305, 620, 38);
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('📍 GPS Locked: 13.0067° N, 80.2571° E (±12m) • Ward 172 Adyar', 105, 330);

      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(90, 360, 620, 55);
      ctx.strokeStyle = '#93c5fd';
      ctx.strokeRect(90, 360, 620, 55);
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText('📷 Client Canvas Downsampling: 3.4 MB Photo -> 42 KB Compressed WebP', 105, 385);

      ctx.fillStyle = '#1b2a4a';
      ctx.fillRect(90, 520, 620, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('🚀 Submit Civic Complaint', 400, 550);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(770, 90, 450, 500);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(770, 90, 450, 500);
      ctx.fillStyle = '#334155';
      ctx.fillRect(800, 160, 390, 250);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('[ PHOTO EVIDENCE #CW-1025 ]', 995, 280);
      ctx.textAlign = 'left';
    } else if (scene.id === 3) {
      ctx.fillStyle = '#1b2a4a';
      ctx.fillRect(0, 65, 1280, 580);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(200, 110, 880, 460);
      ctx.strokeStyle = '#c5a880';
      ctx.lineWidth = 3;
      ctx.strokeRect(200, 110, 880, 460);

      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(200, 110, 880, 65);
      ctx.fillStyle = '#b45309';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('⚠️ Explainable Duplicate Alert — Active Report Found in Ward 172', 240, 152);

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(240, 240, 800, 120);
      ctx.strokeStyle = '#fde68a';
      ctx.strokeRect(240, 240, 800, 120);
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('Active Ticket: CW-2025-TN-1041 (Blocked Inlet / Debris)', 265, 275);
      ctx.font = '14px system-ui';
      ctx.fillText('Location: 2nd Avenue, Opposite Adyar Bus Depot • Status: Reported', 265, 305);
      ctx.fillText('Current Priority: High • Community Corroborations: 2 citizens', 265, 335);

      ctx.fillStyle = '#059669';
      ctx.fillRect(240, 400, 420, 55);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px system-ui';
      ctx.fillText('👍 Corroborate & Elevate Priority to URGENT', 265, 435);
    } else if (scene.id === 4) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 65, 1280, 580);
      ctx.fillStyle = '#1b2a4a';
      ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText('Ward 172 Sanitation Control Board (Supervisor Console)', 60, 110);

      const stats = [
        { val: '5', label: 'TOTAL REPORTS', color: '#1b2a4a' },
        { val: '1', label: 'URGENT SLA', color: '#b91c1c' },
        { val: '2', label: 'IN PROGRESS', color: '#1d4ed8' },
        { val: '2', label: 'RESOLVED', color: '#047857' }
      ];
      stats.forEach((s, idx) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(60 + idx * 295, 160, 275, 75);
        ctx.strokeStyle = '#e2e8f0';
        ctx.strokeRect(60 + idx * 295, 160, 275, 75);
        ctx.fillStyle = s.color;
        ctx.font = 'bold 30px Georgia, serif';
        ctx.fillText(s.val, 85 + idx * 295, 205);
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 11px system-ui';
        ctx.fillText(s.label, 85 + idx * 295, 224);
      });

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(60, 260, 1160, 310);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(60, 260, 1160, 310);
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.fillText('Dispatched Jetting Unit to 2nd Avenue (CW-2025-TN-1041)', 90, 305);
      ctx.fillStyle = '#334155';
      ctx.font = '14px system-ui';
      ctx.fillText('Officer Action: Assigned Mini-Tipper #TN-07-G-4421 and GCC Super Sucker jetting crew.', 90, 340);

      ctx.fillStyle = '#1d4ed8';
      ctx.fillRect(90, 420, 280, 45);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('✓ STATUS: IN PROGRESS', 230, 448);
      ctx.textAlign = 'left';
    } else if (scene.id === 5) {
      ctx.fillStyle = '#fbf9f5';
      ctx.fillRect(0, 65, 1280, 580);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(160, 95, 960, 490);
      ctx.strokeStyle = '#e2e8f0';
      ctx.strokeRect(160, 95, 960, 490);
      ctx.fillStyle = '#1b2a4a';
      ctx.font = 'bold 24px Georgia, serif';
      ctx.fillText('Public Accountability Timeline: CW-2025-TN-1041', 200, 145);

      const items = [
        { time: '10:30 AM', title: 'Reported by Citizen (Anonymous)', desc: 'Photo uploaded with GPS fix on 2nd Ave.' },
        { time: '10:45 AM', title: 'Community Corroboration (+3 citizens)', desc: 'Priority elevated to Urgent.' },
        { time: '11:15 AM', title: 'Ward 172 Supervisor Dispatched Crew', desc: 'Mini-tipper #TN-07-G-4421 & jetting unit dispatched.' }
      ];
      items.forEach((it, idx) => {
        if (sceneProgress * items.length >= idx) {
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.arc(220, 240 + idx * 85, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 15px system-ui';
          ctx.fillText(it.time + ' — ' + it.title, 250, 245 + idx * 85);
          ctx.fillStyle = '#475569';
          ctx.font = '13px system-ui';
          ctx.fillText(it.desc, 250, 268 + idx * 85);
        }
      });
    } else {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 65, 1280, 580);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('COMPETITION-READY SUBMISSION DELIVERABLES', 640, 180);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText('CivicWatch — Team HackSphere', 640, 250);
      ctx.fillStyle = '#a7f3d0';
      ctx.font = 'bold 20px system-ui';
      ctx.fillText('✓ 8/8 Automated Tests Passed  •  ✓ Working Zero-Login Web Prototype', 640, 330);
      ctx.fillText('✓ Explainable Deduplication Engine  •  ✓ Full Technical Architecture Docs', 640, 375);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('Team ID: HSC|TN|03258 | Tamil Nadu', 640, 450);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // Bottom Narration
    ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
    ctx.fillRect(40, 645, 1200, 65);
    ctx.strokeStyle = '#c5a880';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 645, 1200, 65);

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`SCENE ${scene.id + 1} OF 7 — ${scene.name.toUpperCase()}:`, 60, 668);
    ctx.fillStyle = '#ffffff';
    ctx.font = '15px system-ui';
    ctx.fillText(scene.narration, 60, 693);
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  CivicApp.init();
});

