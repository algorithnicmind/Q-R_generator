/**
 * Smart QR Generator - Frontend Application
 */

// API Base URL
// API Base URL
const API_BASE = '/api';

// Authentication Check
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// Secure Fetch Helper
async function fetchWithAuth(url, options = {}) {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    return;
  }
  
  return response;
}

// User Info
const user = JSON.parse(localStorage.getItem('user') || '{}');
document.addEventListener('DOMContentLoaded', () => {
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay && user.name) {
    userDisplay.textContent = `👤 ${user.name}`;
  }
  
  // Add logout button listener if it exists
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = 'login.html';
    });
  }
});

// State
let currentPage = 1;
let totalPages = 1;
let currentQRData = null;

// ===================================
// DOM Elements
// ===================================
const elements = {
  // Forms
  qrForm: document.getElementById('qrForm'),
  targetUrl: document.getElementById('targetUrl'),
  qrName: document.getElementById('qrName'),
  qrType: document.getElementById('qrType'),
  expiryDate: document.getElementById('expiryDate'),
  generateBtn: document.getElementById('generateBtn'),
  
  // File Upload
  fileInput: document.getElementById('fileInput'),
  dropZone: document.getElementById('dropZone'),
  fileName: document.getElementById('fileName'),
  fileUploadContainer: document.getElementById('fileUploadContainer'),
  urlHint: document.getElementById('urlHint'),
  uploadProgressContainer: document.getElementById('uploadProgressContainer'),
  uploadProgressBar: document.getElementById('uploadProgressBar'),
  uploadStatusText: document.getElementById('uploadStatusText'),
  
  // Preview
  qrPreview: document.getElementById('qrPreview'),
  qrActions: document.getElementById('qrActions'),
  qrInfo: document.getElementById('qrInfo'),
  downloadBtn: document.getElementById('downloadBtn'),
  copyLinkBtn: document.getElementById('copyLinkBtn'),
  redirectUrl: document.getElementById('redirectUrl'),
  
  // Dashboard
  qrList: document.getElementById('qrList'),
  statusFilter: document.getElementById('statusFilter'),
  pagination: document.getElementById('pagination'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  currentPageEl: document.getElementById('currentPage'),
  totalPagesEl: document.getElementById('totalPages'),
  
  // Toast & Modal
  toast: document.getElementById('toast'),
  modal: document.getElementById('modal'),
  modalBody: document.getElementById('modalBody')
};

// ===================================
// Navigation
// ===================================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    showPage(page);
  });
});

function showPage(pageName) {
  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageName);
  });
  
  // Update pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.toggle('active', page.id === pageName);
  });
  
  // Load data if needed
  if (pageName === 'dashboard') {
    loadQRCodes();
  }
  
  // Update URL hash
  window.location.hash = pageName;
}

// Handle initial page load based on hash
window.addEventListener('load', () => {
  const hash = window.location.hash.replace('#', '') || 'generator';
  showPage(hash);
});

// ===================================
// Type Selector
// ===================================
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const type = btn.dataset.type;
    elements.qrType.value = type;
    
    // Toggle File Upload Logic
    const isFile = ['video', 'document'].includes(type);
    
    if (isFile) {
       elements.fileUploadContainer.classList.remove('hidden');
       elements.targetUrl.readOnly = true;
       elements.targetUrl.value = '';
       elements.targetUrl.placeholder = "Upload a file to generate URL";
       elements.urlHint.textContent = "Upload a file above to auto-fill this URL";
    } else {
       elements.fileUploadContainer.classList.add('hidden');
       elements.targetUrl.readOnly = false;
       elements.targetUrl.placeholder = "https://example.com/your-page";
       elements.urlHint.textContent = "Enter the URL you want the QR code to redirect to";
    }
  });
});

// File Upload Handler
if (elements.fileInput) {
  elements.dropZone.addEventListener('click', () => elements.fileInput.click());
  
  elements.fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit', 'error');
      // Reset input
      elements.fileInput.value = '';
      return;
    }
    
    // UI Updates
    elements.fileName.textContent = file.name;
    elements.uploadProgressContainer.classList.remove('hidden');
    elements.uploadStatusText.textContent = "Uploading...";
    elements.uploadProgressBar.style.width = '10%';
    elements.uploadProgressBar.style.background = 'var(--color-accent-gradient)';
    elements.generateBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        // Use raw fetch to avoid adding Content-Type: application/json
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        elements.uploadProgressBar.style.width = '100%';
        
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.message || 'Upload failed');
        
        // Success
        elements.uploadStatusText.textContent = "Upload Complete!";
        elements.targetUrl.value = result.url;
        showToast('File uploaded successfully!', 'success');
        elements.generateBtn.disabled = false;
        
    } catch (error) {
        showToast(error.message, 'error');
        elements.uploadStatusText.textContent = "Upload Failed";
        elements.uploadProgressBar.style.background = 'var(--color-error)';
        elements.generateBtn.disabled = false;
    }
  });
}

// ===================================
// QR Form Submission
// ===================================
elements.qrForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    target_url: elements.targetUrl.value.trim(),
    name: elements.qrName.value.trim() || undefined,
    type: elements.qrType.value,
    expires_at: elements.expiryDate.value || undefined
  };
  
  // Validate URL
  if (!isValidUrl(formData.target_url)) {
    showToast('Please enter a valid URL', 'error');
    return;
  }
  
  // Show loading state
  setLoading(true);
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to create QR code');
    }
    
    // Store current QR data
    currentQRData = result.data;
    
    // Display QR code
    displayQRCode(result.data);
    
    // Show success message
    showToast('QR code created successfully!', 'success');
    
    // Reset form
    elements.qrForm.reset();
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.type-btn[data-type="url"]').classList.add('active');
    elements.qrType.value = 'url';
    
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    setLoading(false);
  }
});

function displayQRCode(data) {
  // Show QR image
  elements.qrPreview.innerHTML = `<img src="${data.qr_image}" alt="QR Code">`;
  
  // Show actions and info
  elements.qrActions.classList.remove('hidden');
  elements.qrInfo.classList.remove('hidden');
  
  // Update redirect URL
  elements.redirectUrl.textContent = data.redirect_url;
}

// ===================================
// QR Actions
// ===================================
elements.downloadBtn.addEventListener('click', () => {
  if (!currentQRData) return;
  
  const link = document.createElement('a');
  link.download = `${currentQRData.name || 'qr-code'}.png`;
  link.href = currentQRData.qr_image;
  link.click();
  
  showToast('QR code downloaded!', 'success');
});

elements.copyLinkBtn.addEventListener('click', async () => {
  if (!currentQRData) return;
  
  try {
    await navigator.clipboard.writeText(currentQRData.redirect_url);
    showToast('Link copied to clipboard!', 'success');
  } catch (error) {
    showToast('Failed to copy link', 'error');
  }
});

// ===================================
// Dashboard - Load QR Codes
// ===================================
async function loadQRCodes(page = 1) {
  const status = elements.statusFilter.value;
  
  elements.qrList.innerHTML = `
    <div class="loading-state">
      <span class="loader"></span>
      <p>Loading QR codes...</p>
    </div>
  `;
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/qr?page=${page}&limit=10&status=${status}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to load QR codes');
    }
    
    const { qr_codes, pagination } = result.data;
    
    currentPage = pagination.current_page;
    totalPages = pagination.total_pages;
    
    renderQRList(qr_codes);
    updatePagination(pagination);
    
  } catch (error) {
    elements.qrList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p>Failed to load QR codes</p>
        <p class="text-muted">${error.message}</p>
      </div>
    `;
  }
}

function renderQRList(qrCodes) {
  if (qrCodes.length === 0) {
    elements.qrList.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <p>No QR codes found</p>
        <button class="btn btn-primary" onclick="showPage('generator')">Create your first QR</button>
      </div>
    `;
    return;
  }
  
  elements.qrList.innerHTML = qrCodes.map(qr => {
    const isExpired = qr.expires_at && new Date(qr.expires_at) < new Date();
    const statusClass = !qr.is_active ? 'status-inactive' : isExpired ? 'status-expired' : 'status-active';
    const statusText = !qr.is_active ? 'Inactive' : isExpired ? 'Expired' : 'Active';
    
    // Type Icon
    const typeIcon = {
      url: '🔗',
      form: '📝',
      video: '🎬',
      document: '📄',
      image: '🖼️'
    }[qr.type] || '🔗';
    
    return `
      <div class="qr-item" data-id="${qr.qr_code_id}">
        <div class="qr-item-preview">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(window.location.origin + '/q/' + qr.qr_code_id)}" alt="QR">
        </div>
        <div class="qr-item-info">
          <h3>${typeIcon} ${escapeHtml(qr.name || 'Untitled QR')}</h3>
          <div class="qr-item-meta">
            <span class="stats-badge">📊 ${qr.total_scans || 0} scans</span>
            <span class="${statusClass}">${statusText}</span>
            <span>${formatDate(qr.created_at)}</span>
          </div>
        </div>
        <div class="qr-item-actions">
          <button class="btn btn-outline" onclick="viewQRStats('${qr.qr_code_id}')">📈 Stats</button>
          <button class="btn btn-outline" onclick="editQR('${qr.qr_code_id}')">✏️ Edit</button>
          <button class="btn btn-outline" onclick="deleteQR('${qr.qr_code_id}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function updatePagination(pagination) {
  if (pagination.total_pages <= 1) {
    elements.pagination.classList.add('hidden');
    return;
  }
  
  elements.pagination.classList.remove('hidden');
  elements.currentPageEl.textContent = pagination.current_page;
  elements.totalPagesEl.textContent = pagination.total_pages;
  elements.prevBtn.disabled = pagination.current_page === 1;
  elements.nextBtn.disabled = pagination.current_page === pagination.total_pages;
}

// Pagination buttons
elements.prevBtn.addEventListener('click', () => {
  if (currentPage > 1) loadQRCodes(currentPage - 1);
});

elements.nextBtn.addEventListener('click', () => {
  if (currentPage < totalPages) loadQRCodes(currentPage + 1);
});

// Status filter
elements.statusFilter.addEventListener('change', () => {
  loadQRCodes(1);
});

// ===================================
// QR Stats Modal
// ===================================
async function viewQRStats(qrCodeId) {
  openModal('<div class="loading-state"><span class="loader"></span><p>Loading stats...</p></div>');
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/qr/${qrCodeId}/stats`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to load stats');
    }
    
    const { name, total_scans, first_scan, last_scan, scans_by_period } = result.data;
    
    const statsHtml = `
      <h2 style="margin-bottom: 1.5rem;">📊 ${escapeHtml(name)} Statistics</h2>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
        <div class="card" style="text-align: center; padding: 1.5rem;">
          <div style="font-size: 2rem; font-weight: 700; color: var(--color-accent-primary);">${total_scans}</div>
          <div style="color: var(--color-text-muted); font-size: 0.875rem;">Total Scans</div>
        </div>
        <div class="card" style="text-align: center; padding: 1.5rem;">
          <div style="font-size: 0.875rem;">${first_scan ? formatDate(first_scan) : 'N/A'}</div>
          <div style="color: var(--color-text-muted); font-size: 0.875rem;">First Scan</div>
        </div>
        <div class="card" style="text-align: center; padding: 1.5rem;">
          <div style="font-size: 0.875rem;">${last_scan ? formatDate(last_scan) : 'N/A'}</div>
          <div style="color: var(--color-text-muted); font-size: 0.875rem;">Last Scan</div>
        </div>
      </div>
      
      <h3 style="margin-bottom: 1rem;">Scans by Day</h3>
      <div class="card" style="padding: 1.5rem;">
        ${scans_by_period.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${scans_by_period.slice(-7).map(item => `
              <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="width: 80px; font-size: 0.875rem; color: var(--color-text-muted);">${item.date}</span>
                <div style="flex: 1; height: 24px; background: var(--color-bg-secondary); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${Math.min((item.count / Math.max(...scans_by_period.map(s => s.count))) * 100, 100)}%; height: 100%; background: var(--color-accent-gradient);"></div>
                </div>
                <span style="width: 40px; text-align: right; font-weight: 500;">${item.count}</span>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align: center; color: var(--color-text-muted);">No scan data available</p>'}
      </div>
    `;
    
    elements.modalBody.innerHTML = statsHtml;
    
  } catch (error) {
    elements.modalBody.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p>Failed to load statistics</p>
        <p class="text-muted">${error.message}</p>
      </div>
    `;
  }
}

// ===================================
// Edit QR
// ===================================
async function editQR(qrCodeId) {
  openModal('<div class="loading-state"><span class="loader"></span><p>Loading...</p></div>');
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/qr/${qrCodeId}`);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to load QR');
    }
    
    const qr = result.data;
    
    const editHtml = `
      <h2 style="margin-bottom: 1.5rem;">✏️ Edit QR Code</h2>
      
      <form id="editForm" onsubmit="saveQREdit(event, '${qrCodeId}')">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input type="text" class="form-input" id="editName" value="${escapeHtml(qr.name)}" maxlength="100">
        </div>
        
        <div class="form-group">
          <label class="form-label">Destination URL</label>
          <input type="url" class="form-input" id="editUrl" value="${escapeHtml(qr.target_url)}" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Status</label>
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div class="toggle ${qr.is_active ? 'active' : ''}" id="editStatus" onclick="this.classList.toggle('active')"></div>
            <span id="statusLabel">${qr.is_active ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Expiry Date</label>
          <input type="datetime-local" class="form-input" id="editExpiry" value="${qr.expires_at ? new Date(qr.expires_at).toISOString().slice(0, 16) : ''}">
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">Save Changes</button>
          <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        </div>
      </form>
    `;
    
    elements.modalBody.innerHTML = editHtml;
    
    // Update status label on toggle
    document.getElementById('editStatus').addEventListener('click', function() {
      document.getElementById('statusLabel').textContent = this.classList.contains('active') ? 'Active' : 'Inactive';
    });
    
  } catch (error) {
    elements.modalBody.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">⚠️</span>
        <p>Failed to load QR code</p>
        <p class="text-muted">${error.message}</p>
      </div>
    `;
  }
}

async function saveQREdit(event, qrCodeId) {
  event.preventDefault();
  
  const updateData = {
    name: document.getElementById('editName').value.trim(),
    target_url: document.getElementById('editUrl').value.trim(),
    is_active: document.getElementById('editStatus').classList.contains('active'),
    expires_at: document.getElementById('editExpiry').value || null
  };
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/qr/${qrCodeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to update QR code');
    }
    
    closeModal();
    showToast('QR code updated successfully!', 'success');
    loadQRCodes(currentPage);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ===================================
// Delete QR
// ===================================
async function deleteQR(qrCodeId) {
  if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetchWithAuth(`${API_BASE}/qr/${qrCodeId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to delete QR code');
    }
    
    showToast('QR code deleted successfully!', 'success');
    loadQRCodes(currentPage);
    
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// ===================================
// Modal Functions
// ===================================
function openModal(content) {
  elements.modalBody.innerHTML = content;
  elements.modal.classList.remove('hidden');
  elements.modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  elements.modal.classList.remove('show');
  setTimeout(() => {
    elements.modal.classList.add('hidden');
    document.body.style.overflow = '';
  }, 250);
}

// Close modal on overlay click
elements.modal.querySelector('.modal-overlay').addEventListener('click', closeModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
    closeModal();
  }
});

// ===================================
// Toast Notifications
// ===================================
function showToast(message, type = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  elements.toast.querySelector('.toast-icon').textContent = icons[type] || icons.info;
  elements.toast.querySelector('.toast-message').textContent = message;
  elements.toast.className = `toast ${type}`;
  
  // Show toast
  elements.toast.classList.remove('hidden');
  setTimeout(() => elements.toast.classList.add('show'), 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    elements.toast.classList.remove('show');
    setTimeout(() => elements.toast.classList.add('hidden'), 300);
  }, 3000);
}

// ===================================
// Utility Functions
// ===================================
function setLoading(loading) {
  const btn = elements.generateBtn;
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  
  btn.disabled = loading;
  text.classList.toggle('hidden', loading);
  loader.classList.toggle('hidden', !loading);
}

function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Make functions available globally
window.showPage = showPage;
window.viewQRStats = viewQRStats;
window.editQR = editQR;
window.saveQREdit = saveQREdit;
window.deleteQR = deleteQR;
window.closeModal = closeModal;
