// Interactive Scripts for CarbonAxis Full-Scale Web Application & Supabase Admin Portal

document.addEventListener('DOMContentLoaded', () => {
  
  // ==================== 0. Supabase Client Setup ====================
  const SUPABASE_URL = 'https://byjjvotevysrhwiiamie.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5amp2b3Rldnlzcmh3aWlhbWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTg3NjMsImV4cCI6MjEwNDI5NDc2M30.ThMkTJ0rs2FGCwhDLbF1kGFyrbSn5WY3oxOg5XUNkEM';

  let supabaseClient = null;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('Supabase client initialized successfully.');
    } catch (err) {
      console.warn('Supabase initialization note:', err);
    }
  }

  // Database helper: Inquiries
  async function saveInquiryToDatabase(inquiry) {
    const record = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      name: inquiry.name || 'Anonymous',
      email: inquiry.email || '',
      phone: inquiry.phone || 'Not provided',
      inquiry_type: inquiry.inquiry_type || 'Direct Message',
      message: inquiry.message || '',
      status: 'New'
    };

    // 1. Save to localStorage (instant offline-first cache)
    try {
      const existing = JSON.parse(localStorage.getItem('carbonaxis_inquiries') || '[]');
      existing.unshift(record);
      localStorage.setItem('carbonaxis_inquiries', JSON.stringify(existing));
    } catch (e) {
      console.error('Local storage error:', e);
    }

    // 2. Save to Supabase Cloud
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('inquiries')
          .insert([{
            name: record.name,
            email: record.email,
            phone: record.phone,
            inquiry_type: record.inquiry_type,
            message: record.message,
            status: record.status
          }]);
        if (error) {
          console.warn('Supabase cloud insert warning (fallback saved locally):', error.message);
        } else {
          console.log('Inquiry synced to Supabase successfully:', data);
        }
      } catch (err) {
        console.warn('Supabase request note:', err);
      }
    }
  }

  // Database helper: Trades
  async function saveTradeToDatabase(trade) {
    const record = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      created_at: new Date().toISOString(),
      order_type: trade.order_type || 'BUY',
      project_name: trade.project_name || 'Carbon Asset',
      volume: trade.volume || 100,
      limit_price: trade.limit_price || 15.00,
      clearing_value: trade.clearing_value || 1500.00,
      status: 'Cleared'
    };

    // 1. Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('carbonaxis_trades') || '[]');
      existing.unshift(record);
      localStorage.setItem('carbonaxis_trades', JSON.stringify(existing));
    } catch (e) {
      console.error('Local storage trade error:', e);
    }

    // 2. Save to Supabase Cloud
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('trades')
          .insert([{
            order_type: record.order_type,
            project_name: record.project_name,
            volume: record.volume,
            limit_price: record.limit_price,
            clearing_value: record.clearing_value,
            status: record.status
          }]);
        if (error) {
          console.warn('Supabase trade insert warning (fallback saved locally):', error.message);
        }
      } catch (err) {
        console.warn('Supabase trade note:', err);
      }
    }
  }

  // Database query: Inquiries
  async function fetchInquiries() {
    let cloudList = [];
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('inquiries')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          cloudList = data;
        }
      } catch (err) {
        console.warn('Supabase fetch note:', err);
      }
    }

    const localList = JSON.parse(localStorage.getItem('carbonaxis_inquiries') || '[]');
    if (cloudList.length > 0) {
      return cloudList;
    }
    return localList;
  }

  // Database query: Trades
  async function fetchTrades() {
    let cloudList = [];
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('trades')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && Array.isArray(data)) {
          cloudList = data;
        }
      } catch (err) {
        console.warn('Supabase trades fetch note:', err);
      }
    }

    const localList = JSON.parse(localStorage.getItem('carbonaxis_trades') || '[]');
    if (cloudList.length > 0) {
      return cloudList;
    }
    return localList;
  }

  // ==================== 1. View Switching & Sticky Header Nav ====================
  const views = {
    home: document.getElementById('view-home'),
    about: document.getElementById('view-about'),
    projects: document.getElementById('view-projects'),
    marketplace: document.getElementById('view-marketplace'),
    transparency: document.getElementById('view-transparency'),
    admin: document.getElementById('view-admin'),
    employee: document.getElementById('view-employee')
  };

  const navLinks = document.querySelectorAll('.nav-link-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const hamburgerBtn = document.getElementById('hamburger-btn');

  function switchView(viewKey) {
    if (!views[viewKey]) return;

    // Scroll to top of window
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Hide all views
    Object.keys(views).forEach(key => {
      if (views[key]) views[key].classList.add('hidden');
    });

    // Show active view
    views[viewKey].classList.remove('hidden');

    // Update nav active styling for both desktop and mobile
    navLinks.forEach(link => {
      const target = link.getAttribute('data-view');
      if (target === viewKey) {
        link.classList.add('text-green-600', 'border-green-600', 'font-bold');
        link.classList.remove('text-slate-600', 'border-transparent');
      } else {
        link.classList.remove('text-green-600', 'border-green-600', 'font-bold');
        link.classList.add('text-slate-600', 'border-transparent');
      }
    });

    // Close mobile dropdown menu if open
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }

    // If switching to admin view, initialize check
    if (viewKey === 'admin') {
      checkAdminAuth();
    }

    // If switching to employee view, initialize check
    if (viewKey === 'employee') {
      checkEmployeeAuth();
    }
  }

  // Hook nav links and global data-view delegation
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-view]');
    if (trigger && !trigger.classList.contains('project-filter-btn')) {
      const targetView = trigger.getAttribute('data-view');
      if (views[targetView]) {
        e.preventDefault();
        switchView(targetView);
      }
    }
  });

  // Mobile menu toggle
  if (hamburgerBtn && mobileMenu) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Dashboard grid cards on homepage
  const homepageCards = document.querySelectorAll('.homepage-nav-card');
  homepageCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetView = card.getAttribute('data-view');
      switchView(targetView);
    });
  });


  // ==================== 2. Project Filters (Projects Page) ====================
  const filterButtons = document.querySelectorAll('.project-filter-btn');
  const projectItems = document.querySelectorAll('.project-item-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active filter button style
      filterButtons.forEach(b => {
        b.classList.remove('bg-green-600', 'text-white');
        b.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      });
      btn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      btn.classList.add('bg-green-600', 'text-white');

      const filterValue = btn.getAttribute('data-filter');
      let visibleCount = 0;
      projectItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.classList.remove('hidden');
          visibleCount++;
        } else {
          item.classList.add('hidden');
        }
      });

      const countIndicator = document.getElementById('catalog-count-indicator');
      if (countIndicator) {
        countIndicator.textContent = `Showing ${visibleCount} of ${projectItems.length} Projects`;
      }
    });
  });


  // ==================== 3. Carbon Calculator (Marketplace Page) ====================
  const calcBtn = document.getElementById('calc-calculate-btn');
  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      // Input values
      const transport = parseFloat(document.getElementById('calc-transport').value) || 0;
      const flightHours = parseFloat(document.getElementById('calc-flights').value) || 0;
      const electricity = parseFloat(document.getElementById('calc-elec').value) || 0;
      const gas = parseFloat(document.getElementById('calc-gas').value) || 0;

      // Conversions (annual emissions in kg CO2)
      const transportCO2 = transport * 0.404 * 12; // 0.404 kg per mile
      const flightCO2 = flightHours * 250;           // 250 kg per flight hour
      const elecCO2 = electricity * 0.387 * 12;    // 0.387 kg per kWh
      const gasCO2 = gas * 5.3 * 12;                // 5.3 kg per unit/therm

      const totalCO2Kg = transportCO2 + flightCO2 + elecCO2 + gasCO2;
      const totalCO2Tons = totalCO2Kg / 1000;

      // Update UI results
      const resultsDiv = document.getElementById('calc-results');
      const totalValue = document.getElementById('calc-result-value');
      const costValue = document.getElementById('calc-cost-value');
      
      const breakTransport = document.getElementById('break-transport');
      const breakHome = document.getElementById('break-home');
      const breakTravel = document.getElementById('break-travel');

      if (resultsDiv && totalValue && costValue) {
        totalValue.textContent = totalCO2Tons.toFixed(2);
        // Cost assumes average $15 per ton
        costValue.textContent = `$${(totalCO2Tons * 15).toFixed(2)}`;

        // Set breakdown meters
        const sum = transportCO2 + flightCO2 + elecCO2 + gasCO2 || 1;
        if (breakTransport) breakTransport.style.width = `${((transportCO2 / sum) * 100)}%`;
        if (breakHome) breakHome.style.width = `${(((elecCO2 + gasCO2) / sum) * 100)}%`;
        if (breakTravel) breakTravel.style.width = `${((flightCO2 / sum) * 100)}%`;

        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }


  // ==================== 4. Modals (Buy Credits & Register Project) ====================
  const mainModal = document.getElementById('main-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalForm = document.getElementById('modal-form');
  const modalContentDiv = document.getElementById('modal-dynamic-content');

  // Wire CTA buttons
  const triggerContactButtons = document.querySelectorAll('.trigger-contact-cta');
  const triggerTradeButtons = document.querySelectorAll('.trigger-trade-cta');

  function openModal() {
    if (!mainModal) return;
    mainModal.classList.remove('hidden');
    mainModal.classList.add('flex');

    modalTitle.textContent = 'Contact CarbonAxis';
    modalContentDiv.innerHTML = `
      <p class="text-xs text-slate-500 mb-4">Have questions about carbon registries, procurement, or direct offset orders? Send us a message.</p>
      <div class="space-y-3">
        <div>
          <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
          <input type="text" id="modal-name" placeholder="e.g. Sarah Jenkins" class="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-green-500 focus:outline-none" required />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
          <input type="email" id="modal-email" placeholder="e.g. sarah@company.com" class="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-green-500 focus:outline-none" required />
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Inquiry Type</label>
          <select id="modal-type" class="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-green-500 focus:outline-none">
            <option value="General Inquiry">General Information</option>
            <option value="Offset Lot Procurement">Offset Lot Procurement</option>
            <option value="Liquidate Credit Volume">Liquidate Credit Volume</option>
            <option value="Registry & Compliance">Registry & Compliance Audit</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Message</label>
          <textarea id="modal-msg" rows="3" placeholder="Tell us how we can help..." class="w-full text-xs p-2 border border-slate-200 rounded-lg focus:border-green-500 focus:outline-none" required></textarea>
        </div>
      </div>
    `;

    modalForm.onsubmit = async (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('modal-name')?.value.trim() || '';
      const emailInput = document.getElementById('modal-email')?.value.trim() || '';
      const typeInput = document.getElementById('modal-type')?.value || 'General Inquiry';
      const msgInput = document.getElementById('modal-msg')?.value.trim() || '';

      // Save to Supabase + Local Database
      await saveInquiryToDatabase({
        name: nameInput,
        email: emailInput,
        phone: 'Modal Inquiry',
        inquiry_type: typeInput,
        message: msgInput
      });

      alert('Thank you! Your inquiry has been received and recorded in our database. Our team will follow up with you shortly.');
      closeModal();
    };
  }

  function openTradeModal(action, project, price) {
    if (!mainModal) return;
    mainModal.classList.remove('hidden');
    mainModal.classList.add('flex');

    const isBuy = action === 'buy';
    modalTitle.textContent = isBuy ? 'Execute Buy Order' : 'Execute Sell Order';

    modalContentDiv.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between p-2.5 rounded-lg text-xs font-bold ${isBuy ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}">
          <span>Side: ${isBuy ? 'BUYING (ASK Lot)' : 'SELLING (BID Lot)'}</span>
          <span>Asset: Carbon Offsets</span>
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Carbon Lot Asset</label>
          <input type="text" value="${project}" class="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 focus:outline-none font-medium" readonly />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Limit Price ($/t)</label>
            <input type="number" step="0.01" value="${price}" id="trade-limit-price" class="w-full text-xs p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none font-bold" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Order Volume (Tons)</label>
            <input type="number" min="1" value="100" id="trade-volume" class="w-full text-xs p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none font-bold" />
          </div>
        </div>

        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
          <span class="text-slate-600 font-semibold">Total Clearing Value:</span>
          <span id="trade-order-total" class="font-extrabold ${isBuy ? 'text-green-600' : 'text-red-600'} text-base">$${(price * 100).toFixed(2)}</span>
        </div>
      </div>
    `;

    const priceInput = document.getElementById('trade-limit-price');
    const volInput = document.getElementById('trade-volume');
    const totalSpan = document.getElementById('trade-order-total');

    const updateTradeTotal = () => {
      const p = parseFloat(priceInput.value) || 0;
      const v = parseFloat(volInput.value) || 0;
      totalSpan.textContent = `$${(p * v).toFixed(2)}`;
    };

    priceInput.addEventListener('input', updateTradeTotal);
    volInput.addEventListener('input', updateTradeTotal);

    modalForm.onsubmit = async (e) => {
      e.preventDefault();
      const p = parseFloat(priceInput.value) || 0;
      const v = parseFloat(volInput.value) || 0;
      const clearingVal = p * v;

      // Save Trade to Supabase + Local Database
      await saveTradeToDatabase({
        order_type: isBuy ? 'BUY' : 'SELL',
        project_name: project,
        volume: v,
        limit_price: p,
        clearing_value: clearingVal
      });

      alert(`Trade Order Executed & Cleared in Supabase!\n\nType: ${isBuy ? 'BUY' : 'SELL'}\nAsset: ${project}\nVolume: ${v} Tons @ $${p.toFixed(2)}/t\nTotal Clearing: $${clearingVal.toFixed(2)}\n\nRecord saved in CarbonAxis Registry.`);
      closeModal();
    };
  }

  function closeModal() {
    if (!mainModal) return;
    mainModal.classList.add('hidden');
    mainModal.classList.remove('flex');
  }

  triggerContactButtons.forEach(btn => {
    btn.addEventListener('click', () => openModal());
  });

  triggerTradeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      const project = btn.getAttribute('data-project');
      const price = btn.getAttribute('data-price');
      openTradeModal(action, project, price);
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (mainModal) {
    mainModal.addEventListener('click', (e) => {
      if (e.target === mainModal) closeModal();
    });
  }


  // ==================== 5. Carousel Controls ====================
  const carousel = document.getElementById('project-carousel');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (carousel && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      const itemWidth = carousel.querySelector('.carousel-item').offsetWidth + 24;
      carousel.scrollBy({ left: -itemWidth, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const itemWidth = carousel.querySelector('.carousel-item').offsetWidth + 24;
      carousel.scrollBy({ left: itemWidth, behavior: 'smooth' });
    });
  }


  // ==================== 6. Forms & Registry Lookups ====================
  // Footer Ask anything
  const inquiryForm = document.getElementById('footer-inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = inquiryForm.querySelector('input[type="email"]');
      const questionInput = inquiryForm.querySelector('input[type="text"]');
      
      const email = emailInput?.value || '';
      const question = questionInput?.value || 'General inquiry';

      // Save to Supabase + Local Database
      await saveInquiryToDatabase({
        name: email.split('@')[0] || 'Quick Inquiry',
        email: email,
        phone: 'Footer Form',
        inquiry_type: 'Quick Inquiry',
        message: question
      });

      alert('Thank you! Your question has been submitted and recorded in our database. We will reply to you shortly.');
      if (emailInput) emailInput.value = '';
      if (questionInput) questionInput.value = '';
    });
  }

  // Registry page Lookup
  const registryLookupBtn = document.getElementById('registry-lookup-btn');
  const registryInput = document.getElementById('registry-search-input');
  
  if (registryLookupBtn && registryInput) {
    registryLookupBtn.addEventListener('click', () => {
      const val = registryInput.value.trim().toUpperCase();
      if (!val) {
        alert('Please enter a credit serial number to search.');
        return;
      }
      
      if (val.includes('GS') || val.includes('VCS') || val.includes('PV')) {
        alert(`Serial Record Found:\nID: ${val}\nStatus: RETIRED\nOwner: Acme Corporation\nVintage: 2024\nVerifier Audit: 3rd Party Assured (Clean Report)`);
      } else {
        alert(`Serial Record "${val}" not found in current public registry batch. Try using standard codes (e.g. RET-GS-491-2801, RET-VCS-702-8812).`);
      }
    });
  }

  // Homepage redirect buttons
  const directCatalogBtn = document.getElementById('hero-btn-catalog');
  if (directCatalogBtn) {
    directCatalogBtn.addEventListener('click', () => {
      switchView('projects');
    });
  }

  const directAboutBtn = document.getElementById('hero-btn-learn');
  if (directAboutBtn) {
    directAboutBtn.addEventListener('click', () => {
      switchView('about');
    });
  }

  // Bottom homepage contact form
  const bottomContactForm = document.getElementById('bottom-contact-form');
  if (bottomContactForm) {
    bottomContactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('contact-name')?.value.trim() || '';
      const email = document.getElementById('contact-email')?.value.trim() || '';
      const phone = document.getElementById('contact-phone')?.value.trim() || 'Not provided';
      const message = document.getElementById('contact-message')?.value.trim() || '';

      // 1. Save to Supabase Cloud & Local Database
      await saveInquiryToDatabase({
        name: name,
        email: email,
        phone: phone,
        inquiry_type: 'Direct Message',
        message: message
      });

      alert('Thank you! Your message has been sent successfully and recorded in our database. A CarbonAxis representative will follow up with you shortly.');
      bottomContactForm.reset();
    });
  }

  // Floating WhatsApp Widget Popup Toggle
  const waToggleBtn = document.getElementById('whatsapp-toggle-btn');
  const waPopupMenu = document.getElementById('whatsapp-popup-menu');
  const waClosePopup = document.getElementById('close-whatsapp-popup');

  if (waToggleBtn && waPopupMenu) {
    waToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      waPopupMenu.classList.toggle('hidden');
    });

    if (waClosePopup) {
      waClosePopup.addEventListener('click', (e) => {
        e.stopPropagation();
        waPopupMenu.classList.add('hidden');
      });
    }

    document.addEventListener('click', (e) => {
      if (!waPopupMenu.contains(e.target) && e.target !== waToggleBtn) {
        waPopupMenu.classList.add('hidden');
      }
    });
  }


  // ==================== 7. Admin Panel & Supabase CRM Controller ====================
  const adminLoginCard = document.getElementById('admin-login-card');
  const adminDashboardView = document.getElementById('admin-dashboard-view');
  const adminAuthForm = document.getElementById('admin-auth-form');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const adminRefreshBtn = document.getElementById('admin-refresh-btn');
  const adminExportBtn = document.getElementById('admin-export-btn');

  // Admin tab buttons
  const tabInquiriesBtn = document.getElementById('admin-tab-inquiries-btn');
  const tabTradesBtn = document.getElementById('admin-tab-trades-btn');
  const tabEmployeesBtn = document.getElementById('admin-tab-employees-btn');
  const tabLogsBtn = document.getElementById('admin-tab-logs-btn');
  const tabSheetBtn = document.getElementById('admin-tab-sheet-btn');

  const tabInquiriesView = document.getElementById('admin-tab-inquiries');
  const tabTradesView = document.getElementById('admin-tab-trades');
  const tabEmployeesView = document.getElementById('admin-tab-employees');
  const tabLogsView = document.getElementById('admin-tab-logs');
  const tabSheetView = document.getElementById('admin-tab-sheet');

  const searchInput = document.getElementById('admin-search-input');
  const statusFilter = document.getElementById('admin-status-filter');

  let currentInquiries = [];
  let currentTrades = [];

  function checkAdminAuth() {
    const isAuth = sessionStorage.getItem('carbonaxis_admin_auth') === 'true';
    const adminEmail = sessionStorage.getItem('carbonaxis_admin_email') || 'Authorized';
    const displayUserEl = document.getElementById('admin-display-user');
    if (displayUserEl) displayUserEl.textContent = adminEmail;

    if (isAuth) {
      if (adminLoginCard) adminLoginCard.classList.add('hidden');
      if (adminDashboardView) adminDashboardView.classList.remove('hidden');
      loadAdminDashboardData();
    } else {
      if (adminLoginCard) adminLoginCard.classList.remove('hidden');
      if (adminDashboardView) adminDashboardView.classList.add('hidden');
    }
  }

  if (adminAuthForm) {
    adminAuthForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = (document.getElementById('admin-email-input')?.value || '').trim().toLowerCase();
      const pass = (document.getElementById('admin-pass-input')?.value || '').trim();

      // Authorized Admin Credentials
      if (email === 'patel5423@gmail.com' && pass === 'patel5423@$') {
        sessionStorage.setItem('carbonaxis_admin_auth', 'true');
        sessionStorage.setItem('carbonaxis_admin_email', email);
        if (document.getElementById('admin-email-input')) document.getElementById('admin-email-input').value = '';
        if (document.getElementById('admin-pass-input')) document.getElementById('admin-pass-input').value = '';
        checkAdminAuth();
      } else {
        alert('Access Denied: Invalid administrator email or password.');
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('carbonaxis_admin_auth');
      sessionStorage.removeItem('carbonaxis_admin_email');
      checkAdminAuth();
    });
  }

  if (adminRefreshBtn) {
    adminRefreshBtn.addEventListener('click', () => {
      loadAdminDashboardData();
      alert('Dashboard synced with database.');
    });
  }

  // Tab switching inside Admin Dashboard
  function switchAdminTab(tabName) {
    [tabInquiriesBtn, tabTradesBtn, tabEmployeesBtn, tabLogsBtn, tabSheetBtn].forEach(b => {
      if (b) {
        b.classList.remove('border-green-600', 'text-green-600', 'active');
        b.classList.add('border-transparent', 'text-slate-500');
      }
    });

    [tabInquiriesView, tabTradesView, tabEmployeesView, tabLogsView, tabSheetView].forEach(v => {
      if (v) v.classList.add('hidden');
    });

    if (tabName === 'inquiries') {
      if (tabInquiriesBtn) {
        tabInquiriesBtn.classList.add('border-green-600', 'text-green-600', 'active');
        tabInquiriesBtn.classList.remove('border-transparent', 'text-slate-500');
      }
      if (tabInquiriesView) tabInquiriesView.classList.remove('hidden');
    } else if (tabName === 'trades') {
      if (tabTradesBtn) {
        tabTradesBtn.classList.add('border-green-600', 'text-green-600', 'active');
        tabTradesBtn.classList.remove('border-transparent', 'text-slate-500');
      }
      if (tabTradesView) tabTradesView.classList.remove('hidden');
    } else if (tabName === 'employees') {
      if (tabEmployeesBtn) {
        tabEmployeesBtn.classList.add('border-green-600', 'text-green-600', 'active');
        tabEmployeesBtn.classList.remove('border-transparent', 'text-slate-500');
      }
      if (tabEmployeesView) tabEmployeesView.classList.remove('hidden');
      renderAdminEmployeesTable();
    } else if (tabName === 'logs') {
      if (tabLogsBtn) {
        tabLogsBtn.classList.add('border-green-600', 'text-green-600', 'active');
        tabLogsBtn.classList.remove('border-transparent', 'text-slate-500');
      }
      if (tabLogsView) tabLogsView.classList.remove('hidden');
      renderAdminEmployeeLogs();
    } else if (tabName === 'sheet') {
      if (tabSheetBtn) {
        tabSheetBtn.classList.add('border-green-600', 'text-green-600', 'active');
        tabSheetBtn.classList.remove('border-transparent', 'text-slate-500');
      }
      if (tabSheetView) tabSheetView.classList.remove('hidden');
      renderAdminSpreadsheet();
    }
  }

  if (tabInquiriesBtn) tabInquiriesBtn.addEventListener('click', () => switchAdminTab('inquiries'));
  if (tabTradesBtn) tabTradesBtn.addEventListener('click', () => switchAdminTab('trades'));
  if (tabEmployeesBtn) tabEmployeesBtn.addEventListener('click', () => switchAdminTab('employees'));
  if (tabLogsBtn) tabLogsBtn.addEventListener('click', () => switchAdminTab('logs'));
  if (tabSheetBtn) tabSheetBtn.addEventListener('click', () => switchAdminTab('sheet'));

  async function loadAdminDashboardData() {
    currentInquiries = await fetchInquiries();
    currentTrades = await fetchTrades();
    const employees = getEmployees();
    const logs = getEmployeeLogs();
    const sheetRecords = getSheetRecords();

    // Update KPI counts
    const totalInquiriesEl = document.getElementById('stat-total-inquiries');
    const newInquiriesEl = document.getElementById('stat-new-inquiries');
    const totalTradesEl = document.getElementById('stat-total-trades');
    const tabInqCountEl = document.getElementById('tab-inquiries-count');
    const tabTrCountEl = document.getElementById('tab-trades-count');
    const tabEmpCountEl = document.getElementById('tab-employees-count');
    const tabLogsCountEl = document.getElementById('tab-logs-count');
    const tabSheetCountEl = document.getElementById('tab-sheet-count');
    const adminEmpCountDisplay = document.getElementById('admin-emp-count-display');

    const newCount = currentInquiries.filter(i => (i.status || 'New') === 'New').length;

    if (totalInquiriesEl) totalInquiriesEl.textContent = currentInquiries.length;
    if (newInquiriesEl) newInquiriesEl.textContent = newCount;
    if (totalTradesEl) totalTradesEl.textContent = currentTrades.length;
    if (tabInqCountEl) tabInqCountEl.textContent = currentInquiries.length;
    if (tabTrCountEl) tabTrCountEl.textContent = currentTrades.length;
    if (tabEmpCountEl) tabEmpCountEl.textContent = `${employees.length}/10`;
    if (adminEmpCountDisplay) adminEmpCountDisplay.textContent = employees.length;
    if (tabLogsCountEl) tabLogsCountEl.textContent = logs.length;
    if (tabSheetCountEl) tabSheetCountEl.textContent = sheetRecords.length;

    renderInquiriesTable();
    renderTradesTable();
    renderAdminEmployeesTable();
    renderAdminEmployeeLogs();
    renderAdminSpreadsheet();
  }

  function renderInquiriesTable() {
    const tbody = document.getElementById('admin-inquiries-tbody');
    if (!tbody) return;

    const searchTerm = (searchInput?.value || '').toLowerCase();
    const statusVal = statusFilter?.value || 'all';

    const filtered = currentInquiries.filter(item => {
      const matchesSearch = 
        (item.name || '').toLowerCase().includes(searchTerm) ||
        (item.email || '').toLowerCase().includes(searchTerm) ||
        (item.phone || '').toLowerCase().includes(searchTerm) ||
        (item.message || '').toLowerCase().includes(searchTerm);
      
      const matchesStatus = statusVal === 'all' || (item.status || 'New') === statusVal;
      return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-5 py-8 text-center text-slate-400">
            <i class="fa-solid fa-inbox text-2xl mb-2 block"></i>
            No inquiry records found. Test submitting a message on the homepage to see live data here!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((item, idx) => {
      const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString() + ' ' + new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
      const statusColor = item.status === 'Closed' ? 'bg-slate-100 text-slate-600' : (item.status === 'Contacted' ? 'bg-blue-50 text-blue-700' : (item.status === 'In Discussion' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700 font-bold'));

      return `
        <tr class="hover:bg-slate-50/80 transition" data-id="${item.id}">
          <td class="px-5 py-3.5 font-mono text-[11px] text-slate-500">
            #${idx + 1}<br><span class="text-[9px] text-slate-400">${dateStr}</span>
          </td>
          <td class="px-5 py-3.5 font-bold text-slate-900">
            ${escapeHtml(item.name || 'Anonymous')}
          </td>
          <td class="px-5 py-3.5">
            <a href="mailto:${escapeHtml(item.email)}" class="text-green-600 hover:underline block font-medium">${escapeHtml(item.email || 'N/A')}</a>
            <span class="text-slate-400 text-[10px]"><i class="fa-solid fa-phone text-[9px]"></i> ${escapeHtml(item.phone || 'N/A')}</span>
          </td>
          <td class="px-5 py-3.5">
            <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">${escapeHtml(item.inquiry_type || 'Direct Message')}</span>
          </td>
          <td class="px-5 py-3.5 max-w-xs text-slate-600 text-[11px]">
            <p class="line-clamp-2" title="${escapeHtml(item.message)}">${escapeHtml(item.message || 'No message content')}</p>
          </td>
          <td class="px-5 py-3.5">
            <select class="admin-change-status text-[11px] p-1.5 rounded-lg border border-slate-200 ${statusColor} font-medium focus:outline-none" data-id="${item.id}">
              <option value="New" ${item.status === 'New' ? 'selected' : ''}>New</option>
              <option value="In Discussion" ${item.status === 'In Discussion' ? 'selected' : ''}>In Discussion</option>
              <option value="Contacted" ${item.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
              <option value="Closed" ${item.status === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
          </td>
          <td class="px-5 py-3.5 text-right space-x-1.5">
            <a href="mailto:${escapeHtml(item.email)}?subject=Re:%20CarbonAxis%20Inquiry" class="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition inline-block text-xs" title="Reply via Email">
              <i class="fa-solid fa-reply"></i>
            </a>
            <button class="admin-delete-inquiry p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition text-xs" data-id="${item.id}" title="Delete Record">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    tbody.querySelectorAll('.admin-change-status').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await updateInquiryStatus(id, newStatus);
      });
    });

    tbody.querySelectorAll('.admin-delete-inquiry').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this inquiry record?')) {
          await deleteInquiryRecord(id);
        }
      });
    });
  }

  function renderTradesTable() {
    const tbody = document.getElementById('admin-trades-tbody');
    if (!tbody) return;

    if (currentTrades.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="px-5 py-8 text-center text-slate-400">
            <i class="fa-solid fa-file-invoice-dollar text-2xl mb-2 block"></i>
            No trade execution records yet. Trades placed via the Trading Desk will appear here!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = currentTrades.map((t, idx) => {
      const dateStr = t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Today';
      const isBuy = (t.order_type || 'BUY').toUpperCase() === 'BUY';
      return `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-900">${escapeHtml(t.id || 'ORD-' + (idx+1000))}</td>
          <td class="px-5 py-3.5 text-[11px] text-slate-400">${dateStr}</td>
          <td class="px-5 py-3.5">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isBuy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              ${isBuy ? 'BUY' : 'SELL'}
            </span>
          </td>
          <td class="px-5 py-3.5 font-bold text-slate-800">${escapeHtml(t.project_name || 'Carbon Asset')}</td>
          <td class="px-5 py-3.5 font-semibold text-slate-700">${Number(t.volume || 0).toLocaleString()} t</td>
          <td class="px-5 py-3.5 font-mono text-slate-600">$${Number(t.limit_price || 0).toFixed(2)}/t</td>
          <td class="px-5 py-3.5 font-black text-slate-900">$${Number(t.clearing_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td class="px-5 py-3.5 text-right font-bold text-green-600 text-[11px]">Cleared</td>
        </tr>
      `;
    }).join('');
  }

  async function updateInquiryStatus(id, newStatus) {
    // 1. Update in local storage
    const local = JSON.parse(localStorage.getItem('carbonaxis_inquiries') || '[]');
    const updated = local.map(i => {
      if (String(i.id) === String(id)) {
        return { ...i, status: newStatus };
      }
      return i;
    });
    localStorage.setItem('carbonaxis_inquiries', JSON.stringify(updated));

    // 2. Update in Supabase
    if (supabaseClient) {
      try {
        await supabaseClient.from('inquiries').update({ status: newStatus }).eq('id', id);
      } catch (err) {
        console.warn('Supabase status update note:', err);
      }
    }

    loadAdminDashboardData();
  }

  async function deleteInquiryRecord(id) {
    // 1. Delete from local storage
    const local = JSON.parse(localStorage.getItem('carbonaxis_inquiries') || '[]');
    const filtered = local.filter(i => String(i.id) !== String(id));
    localStorage.setItem('carbonaxis_inquiries', JSON.stringify(filtered));

    // 2. Delete from Supabase
    if (supabaseClient) {
      try {
        await supabaseClient.from('inquiries').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete note:', err);
      }
    }

    loadAdminDashboardData();
  }

  // Export to CSV helper
  if (adminExportBtn) {
    adminExportBtn.addEventListener('click', () => {
      if (currentInquiries.length === 0) {
        alert('No inquiries available to export.');
        return;
      }

      const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Type', 'Status', 'Message'];
      const rows = currentInquiries.map((i, idx) => [
        idx + 1,
        i.created_at || '',
        `"${(i.name || '').replace(/"/g, '""')}"`,
        `"${(i.email || '').replace(/"/g, '""')}"`,
        `"${(i.phone || '').replace(/"/g, '""')}"`,
        `"${(i.inquiry_type || '').replace(/"/g, '""')}"`,
        `"${(i.status || 'New').replace(/"/g, '""')}"`,
        `"${(i.message || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `carbonaxis_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  if (searchInput) searchInput.addEventListener('input', renderInquiriesTable);
  if (statusFilter) statusFilter.addEventListener('change', renderInquiriesTable);

  // ==================== 8. Staff / Employee Account Provisioning & Activity Audit System ====================
  const adminOpenAddEmpBtn = document.getElementById('admin-open-add-emp-btn');
  const adminEmpModal = document.getElementById('admin-employee-modal');
  const adminCloseEmpModalBtn = document.getElementById('admin-close-emp-modal-btn');
  const adminCancelEmpModalBtn = document.getElementById('admin-cancel-emp-modal-btn');
  const adminEmpForm = document.getElementById('admin-employee-form');
  const adminEmpIdInput = document.getElementById('admin-emp-id-input');
  const adminEmpNameInput = document.getElementById('admin-emp-name-input');
  const adminEmpUserInput = document.getElementById('admin-emp-user-input');
  const adminEmpPassInput = document.getElementById('admin-emp-pass-input');
  const adminEmpRoleSelect = document.getElementById('admin-emp-role-select');
  const adminEmpEmailInput = document.getElementById('admin-emp-email-input');
  const adminEmpStatusSelect = document.getElementById('admin-emp-status-select');
  const adminEmpModalTitle = document.getElementById('admin-emp-modal-title');

  const adminLogsSearch = document.getElementById('admin-logs-search');
  const adminLogsFilterEmp = document.getElementById('admin-logs-filter-employee');
  const adminLogsFilterAction = document.getElementById('admin-logs-filter-action');
  const adminExportLogsBtn = document.getElementById('admin-export-logs-btn');

  // Employee Portal Elements
  const employeeAuthForm = document.getElementById('employee-auth-form');
  const employeeUsernameInput = document.getElementById('employee-username-input');
  const employeePasswordInput = document.getElementById('employee-password-input');
  const employeeLoginCard = document.getElementById('employee-login-card');
  const employeeDashboardView = document.getElementById('employee-dashboard-view');
  const employeeLogoutBtn = document.getElementById('employee-logout-btn');
  const employeeRefreshBtn = document.getElementById('employee-refresh-btn');
  const empDashName = document.getElementById('emp-dash-name');
  const empDashUsername = document.getElementById('emp-dash-username');
  const empDashRoleBadge = document.getElementById('emp-dash-role-badge');
  const empLiveTimer = document.getElementById('emp-live-timer');

  const empLeadsFilter = document.getElementById('emp-leads-filter');
  const empLeadsContainer = document.getElementById('emp-leads-container');
  const empInteractionForm = document.getElementById('emp-interaction-form');
  const empIntClient = document.getElementById('emp-int-client');
  const empIntChannel = document.getElementById('emp-int-channel');
  const empIntNotes = document.getElementById('emp-int-notes');
  const empSessionLogList = document.getElementById('emp-session-log-list');

  // Note Modal Elements
  const employeeNoteModal = document.getElementById('employee-note-modal');
  const closeEmpNoteModalBtn = document.getElementById('close-emp-note-modal-btn');
  const cancelEmpNoteModalBtn = document.getElementById('cancel-emp-note-modal-btn');
  const employeeNoteForm = document.getElementById('employee-note-form');
  const empNoteLeadId = document.getElementById('emp-note-lead-id');
  const empNoteContent = document.getElementById('emp-note-content');
  const empNoteModalSubtitle = document.getElementById('emp-note-modal-subtitle');

  function getEmployees() {
    let list = [];
    try {
      const stored = localStorage.getItem('carbonaxis_employees');
      if (stored) list = JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading employees:', e);
    }

    if (!list || list.length === 0) {
      list = [
        {
          id: 'EMP-1001',
          name: 'Alex Morgan',
          username: 'alex_broker',
          password: 'broker123',
          role: 'Carbon Credit Broker',
          email: 'alex@carbonaxisgreen.com',
          status: 'Active',
          created_at: new Date().toISOString(),
          last_login: null,
          last_logout: null,
          is_online: false,
          login_count: 0
        }
      ];
      localStorage.setItem('carbonaxis_employees', JSON.stringify(list));
    }
    return list;
  }

  function saveEmployees(list) {
    localStorage.setItem('carbonaxis_employees', JSON.stringify(list));
  }

  function getEmployeeLogs() {
    try {
      return JSON.parse(localStorage.getItem('carbonaxis_employee_logs') || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveEmployeeLogs(list) {
    localStorage.setItem('carbonaxis_employee_logs', JSON.stringify(list));
  }

  async function logEmployeeActivity({ employee, action_type, action_label, details, session_id }) {
    let emp = employee;
    if (!emp) {
      try {
        emp = JSON.parse(sessionStorage.getItem('carbonaxis_current_employee') || 'null');
      } catch (e) {}
    }

    const logEntry = {
      id: 'LOG-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      employee_id: emp?.id || 'EMP-UNKNOWN',
      employee_name: emp?.name || 'Staff Member',
      employee_username: emp?.username || 'unknown',
      employee_role: emp?.role || 'Broker/Specialist',
      action_type: action_type || 'ACTIVITY',
      action_label: action_label || 'Workspace Action',
      details: details || '',
      session_id: session_id || emp?.session_id || 'SESS-WEB'
    };

    const logs = getEmployeeLogs();
    logs.unshift(logEntry);
    saveEmployeeLogs(logs);

    if (supabaseClient) {
      try {
        await supabaseClient.from('employee_audit_logs').insert([logEntry]);
      } catch (err) {
        // Fallback gracefully
      }
    }

    const tabLogsCountEl = document.getElementById('tab-logs-count');
    if (tabLogsCountEl) tabLogsCountEl.textContent = logs.length;

    renderAdminEmployeeLogs();
    renderEmployeeSessionFeed();
    updateEmployeeKPIs();

    return logEntry;
  }

  function openEmployeeModal(empToEdit = null) {
    if (!adminEmpModal) return;
    if (empToEdit) {
      if (adminEmpModalTitle) adminEmpModalTitle.innerHTML = '<i class="fa-solid fa-user-pen text-blue-600"></i> Edit Employee Account';
      if (adminEmpIdInput) adminEmpIdInput.value = empToEdit.id;
      if (adminEmpNameInput) adminEmpNameInput.value = empToEdit.name;
      if (adminEmpUserInput) {
        adminEmpUserInput.value = empToEdit.username;
        adminEmpUserInput.disabled = true;
      }
      if (adminEmpPassInput) adminEmpPassInput.value = empToEdit.password;
      if (adminEmpRoleSelect) adminEmpRoleSelect.value = empToEdit.role;
      if (adminEmpEmailInput) adminEmpEmailInput.value = empToEdit.email || '';
      if (adminEmpStatusSelect) adminEmpStatusSelect.value = empToEdit.status;
    } else {
      if (adminEmpModalTitle) adminEmpModalTitle.innerHTML = '<i class="fa-solid fa-user-plus text-blue-600"></i> Create New Employee Account';
      if (adminEmpIdInput) adminEmpIdInput.value = '';
      if (adminEmpNameInput) adminEmpNameInput.value = '';
      if (adminEmpUserInput) {
        adminEmpUserInput.value = '';
        adminEmpUserInput.disabled = false;
      }
      if (adminEmpPassInput) adminEmpPassInput.value = '';
      if (adminEmpRoleSelect) adminEmpRoleSelect.selectedIndex = 0;
      if (adminEmpEmailInput) adminEmpEmailInput.value = '';
      if (adminEmpStatusSelect) adminEmpStatusSelect.value = 'Active';
    }
    adminEmpModal.classList.remove('hidden');
  }

  function closeEmployeeModal() {
    if (adminEmpModal) adminEmpModal.classList.add('hidden');
    if (adminEmpUserInput) adminEmpUserInput.disabled = false;
  }

  if (adminOpenAddEmpBtn) {
    adminOpenAddEmpBtn.addEventListener('click', () => {
      const employees = getEmployees();
      if (employees.length >= 10) {
        alert('Employee account limit reached (10/10). Maximum of 10 staff accounts permitted.');
        return;
      }
      openEmployeeModal();
    });
  }

  if (adminCloseEmpModalBtn) adminCloseEmpModalBtn.addEventListener('click', closeEmployeeModal);
  if (adminCancelEmpModalBtn) adminCancelEmpModalBtn.addEventListener('click', closeEmployeeModal);

  if (adminEmpForm) {
    adminEmpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const employees = getEmployees();
      const empId = adminEmpIdInput?.value.trim();
      const name = (adminEmpNameInput?.value || '').trim();
      const username = (adminEmpUserInput?.value || '').trim().toLowerCase();
      const password = (adminEmpPassInput?.value || '').trim();
      const role = adminEmpRoleSelect?.value || 'Carbon Credit Broker';
      const email = (adminEmpEmailInput?.value || '').trim();
      const status = adminEmpStatusSelect?.value || 'Active';

      if (!name || !username || !password) {
        alert('Please complete all required fields (Name, Username, Password).');
        return;
      }

      if (empId) {
        // Edit existing
        const idx = employees.findIndex(e => e.id === empId);
        if (idx !== -1) {
          employees[idx].name = name;
          employees[idx].password = password;
          employees[idx].role = role;
          employees[idx].email = email;
          employees[idx].status = status;
          saveEmployees(employees);
          alert(`Employee "${name}" updated successfully.`);
        }
      } else {
        // Create new
        if (employees.length >= 10) {
          alert('Employee account limit reached (10/10). Maximum of 10 staff accounts permitted.');
          return;
        }

        const usernameExists = employees.some(e => e.username.toLowerCase() === username);
        if (usernameExists) {
          alert(`Username "${username}" is already assigned to another staff member. Please use a unique login username.`);
          return;
        }

        const newEmp = {
          id: 'EMP-' + (1000 + employees.length + 1),
          name,
          username,
          password,
          role,
          email,
          status,
          created_at: new Date().toISOString(),
          last_login: null,
          last_logout: null,
          is_online: false,
          login_count: 0
        };

        employees.push(newEmp);
        saveEmployees(employees);
        alert(`New employee account created: ${name} (@${username})`);
      }

      closeEmployeeModal();
      loadAdminDashboardData();
    });
  }

  function renderAdminEmployeesTable() {
    const tbody = document.getElementById('admin-employees-tbody');
    const counterDisplay = document.getElementById('admin-emp-count-display');
    const tabEmpCountEl = document.getElementById('tab-employees-count');
    if (!tbody) return;

    const employees = getEmployees();
    if (counterDisplay) counterDisplay.textContent = employees.length;
    if (tabEmpCountEl) tabEmpCountEl.textContent = `${employees.length}/10`;

    if (employees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="px-5 py-8 text-center text-slate-400">
            <i class="fa-solid fa-users text-2xl mb-2 block"></i>
            No employee accounts configured. Click "Create Employee" to add your first staff member (up to 10).
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = employees.map((emp) => {
      const isOnline = emp.is_online === true;
      const onlineBadge = isOnline 
        ? `<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Online</span>`
        : `<span class="text-[10px] text-slate-400 font-medium">Offline</span>`;

      const statusBadge = emp.status === 'Active'
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">Active</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">Suspended</span>`;

      const lastLoginStr = emp.last_login 
        ? `${new Date(emp.last_login).toLocaleDateString()} <span class="text-[10px] text-slate-400">${new Date(emp.last_login).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`
        : '<span class="text-slate-400 italic">Never</span>';

      const lastLogoutStr = emp.last_logout
        ? `${new Date(emp.last_logout).toLocaleDateString()} <span class="text-[10px] text-slate-400">${new Date(emp.last_logout).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`
        : '<span class="text-slate-400 italic">—</span>';

      return `
        <tr class="hover:bg-slate-50/80 transition" data-id="${emp.id}">
          <td class="px-5 py-3.5">
            <span class="font-mono text-[11px] font-bold text-slate-900 block">${emp.id}</span>
            <span class="font-mono text-[11px] text-blue-600 font-medium">@${escapeHtml(emp.username)}</span>
          </td>
          <td class="px-5 py-3.5">
            <span class="font-bold text-slate-900 block">${escapeHtml(emp.name)}</span>
            <span class="text-[10px] text-slate-500 font-medium">${escapeHtml(emp.role)}</span>
          </td>
          <td class="px-5 py-3.5">
            <span class="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700" title="Password">${escapeHtml(emp.password)}</span>
          </td>
          <td class="px-5 py-3.5 space-y-1">
            <div>${statusBadge}</div>
            <div>${onlineBadge}</div>
          </td>
          <td class="px-5 py-3.5 text-[11px] text-slate-600">
            ${lastLoginStr}
          </td>
          <td class="px-5 py-3.5 text-[11px] text-slate-600">
            ${lastLogoutStr}
          </td>
          <td class="px-5 py-3.5 text-center">
            <span class="font-bold text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded-lg">${emp.login_count || 0}</span>
          </td>
          <td class="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
            <button class="admin-emp-view-logs p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition text-xs" data-user="${escapeHtml(emp.username)}" title="View Activity Logs">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="admin-emp-edit p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition text-xs" data-id="${emp.id}" title="Edit Profile">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="admin-emp-toggle-status p-1.5 ${emp.status === 'Active' ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-green-50 hover:bg-green-100 text-green-700'} rounded-lg transition text-xs" data-id="${emp.id}" title="${emp.status === 'Active' ? 'Suspend Account' : 'Activate Account'}">
              <i class="fa-solid ${emp.status === 'Active' ? 'fa-user-slash' : 'fa-user-check'}"></i>
            </button>
            <button class="admin-emp-reset-pass p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition text-xs" data-id="${emp.id}" title="Reset Password">
              <i class="fa-solid fa-key"></i>
            </button>
            <button class="admin-emp-delete p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition text-xs" data-id="${emp.id}" title="Delete Account">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    tbody.querySelectorAll('.admin-emp-view-logs').forEach(btn => {
      btn.addEventListener('click', () => {
        const username = btn.getAttribute('data-user');
        switchAdminTab('logs');
        if (adminLogsFilterEmp) {
          adminLogsFilterEmp.value = username;
          renderAdminEmployeeLogs();
        }
      });
    });

    tbody.querySelectorAll('.admin-emp-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const emp = getEmployees().find(e => e.id === id);
        if (emp) openEmployeeModal(emp);
      });
    });

    tbody.querySelectorAll('.admin-emp-toggle-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const employees = getEmployees();
        const emp = employees.find(e => e.id === id);
        if (emp) {
          emp.status = emp.status === 'Active' ? 'Inactive' : 'Active';
          saveEmployees(employees);
          renderAdminEmployeesTable();
        }
      });
    });

    tbody.querySelectorAll('.admin-emp-reset-pass').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const employees = getEmployees();
        const emp = employees.find(e => e.id === id);
        if (emp) {
          const newPass = prompt(`Set new password for ${emp.name} (@${emp.username}):`, emp.password);
          if (newPass && newPass.trim()) {
            emp.password = newPass.trim();
            saveEmployees(employees);
            renderAdminEmployeesTable();
            alert(`Password updated for ${emp.name}.`);
          }
        }
      });
    });

    tbody.querySelectorAll('.admin-emp-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const employees = getEmployees();
        const emp = employees.find(e => e.id === id);
        if (emp && confirm(`Are you sure you want to delete employee "${emp.name}" (@${emp.username})?`)) {
          const filtered = employees.filter(e => e.id !== id);
          saveEmployees(filtered);
          loadAdminDashboardData();
        }
      });
    });
  }

  function renderAdminEmployeeLogs() {
    const tbody = document.getElementById('admin-logs-tbody');
    const tabLogsCountEl = document.getElementById('tab-logs-count');
    if (!tbody) return;

    const logs = getEmployeeLogs();
    const employees = getEmployees();
    if (tabLogsCountEl) tabLogsCountEl.textContent = logs.length;

    // Populate employee filter dropdown
    if (adminLogsFilterEmp) {
      const currentVal = adminLogsFilterEmp.value;
      adminLogsFilterEmp.innerHTML = '<option value="all">All Employees</option>' + 
        employees.map(e => `<option value="${escapeHtml(e.username)}" ${currentVal === e.username ? 'selected' : ''}>${escapeHtml(e.name)} (@${escapeHtml(e.username)})</option>`).join('');
    }

    const searchTerm = (adminLogsSearch?.value || '').toLowerCase();
    const empFilter = adminLogsFilterEmp?.value || 'all';
    const actionFilter = adminLogsFilterAction?.value || 'all';

    const filtered = logs.filter(log => {
      const matchesSearch = 
        (log.employee_name || '').toLowerCase().includes(searchTerm) ||
        (log.employee_username || '').toLowerCase().includes(searchTerm) ||
        (log.action_label || '').toLowerCase().includes(searchTerm) ||
        (log.details || '').toLowerCase().includes(searchTerm);

      const matchesEmp = empFilter === 'all' || log.employee_username === empFilter;
      const matchesAction = actionFilter === 'all' || log.action_type === actionFilter;

      return matchesSearch && matchesEmp && matchesAction;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-5 py-8 text-center text-slate-400">
            <i class="fa-solid fa-clock-rotate-left text-2xl mb-2 block"></i>
            No activity logs match the selected filters. Employee logins, logouts, lead changes, notes, and catalog queries will be logged here in real time.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(log => {
      const dateStr = log.timestamp 
        ? `${new Date(log.timestamp).toLocaleDateString()} • ${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
        : 'Recent';

      // Badge styling by action type
      let badgeHtml = '';
      switch (log.action_type) {
        case 'LOGIN':
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><i class="fa-solid fa-right-to-bracket mr-1"></i> Staff Login</span>`;
          break;
        case 'LOGOUT':
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"><i class="fa-solid fa-right-from-bracket mr-1"></i> Staff Logout</span>`;
          break;
        case 'STATUS_UPDATE':
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200"><i class="fa-solid fa-arrows-rotate mr-1"></i> Lead Status</span>`;
          break;
        case 'CLIENT_NOTE':
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200"><i class="fa-solid fa-note-sticky mr-1"></i> Internal Note</span>`;
          break;
        case 'CLIENT_LOG':
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200"><i class="fa-solid fa-comments mr-1"></i> Interaction Log</span>`;
          break;
        case 'CATALOG_INSPECT':
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200"><i class="fa-solid fa-magnifying-glass-chart mr-1"></i> Lot Inspect</span>`;
          break;
        default:
          badgeHtml = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">${escapeHtml(log.action_label || 'Action')}</span>`;
      }

      return `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="px-5 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
            ${dateStr}
          </td>
          <td class="px-5 py-3">
            <span class="font-bold text-slate-900 block">${escapeHtml(log.employee_name)}</span>
            <span class="text-[10px] text-blue-600 font-mono">@${escapeHtml(log.employee_username)}</span>
            <span class="text-[9px] text-slate-400 block">${escapeHtml(log.employee_role)}</span>
          </td>
          <td class="px-5 py-3 whitespace-nowrap">
            ${badgeHtml}
          </td>
          <td class="px-5 py-3 max-w-md text-slate-700 text-xs">
            <p class="leading-relaxed font-medium">${escapeHtml(log.details)}</p>
          </td>
          <td class="px-5 py-3 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
            <span class="bg-slate-100 px-2 py-0.5 rounded">${escapeHtml(log.session_id || 'SESS-WEB')}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (adminLogsSearch) adminLogsSearch.addEventListener('input', renderAdminEmployeeLogs);
  if (adminLogsFilterEmp) adminLogsFilterEmp.addEventListener('change', renderAdminEmployeeLogs);
  if (adminLogsFilterAction) adminLogsFilterAction.addEventListener('change', renderAdminEmployeeLogs);

  if (adminExportLogsBtn) {
    adminExportLogsBtn.addEventListener('click', () => {
      const logs = getEmployeeLogs();
      if (logs.length === 0) {
        alert('No employee activity logs available to export.');
        return;
      }

      const headers = ['Timestamp', 'Session ID', 'Employee ID', 'Staff Name', 'Username', 'Role', 'Action Type', 'Action Label', 'Details'];
      const rows = logs.map(l => [
        `"${l.timestamp || ''}"`,
        `"${l.session_id || ''}"`,
        `"${l.employee_id || ''}"`,
        `"${(l.employee_name || '').replace(/"/g, '""')}"`,
        `"${(l.employee_username || '').replace(/"/g, '""')}"`,
        `"${(l.employee_role || '').replace(/"/g, '""')}"`,
        `"${l.action_type || ''}"`,
        `"${(l.action_label || '').replace(/"/g, '""')}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `carbonaxis_employee_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  // ==================== 9. Employee Portal Workspace & Interactive Session Controller ====================
  let employeeLiveTimerInterval = null;

  function getCurrentEmployee() {
    try {
      const raw = sessionStorage.getItem('carbonaxis_current_employee');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function checkEmployeeAuth() {
    const curEmp = getCurrentEmployee();

    if (curEmp && curEmp.username) {
      if (employeeLoginCard) employeeLoginCard.classList.add('hidden');
      if (employeeDashboardView) employeeDashboardView.classList.remove('hidden');

      if (empDashName) empDashName.textContent = curEmp.name;
      if (empDashUsername) empDashUsername.textContent = `(@${curEmp.username})`;
      if (empDashRoleBadge) empDashRoleBadge.textContent = curEmp.role;

      startEmployeeLiveTimer(curEmp.session_start || Date.now());
      loadEmployeeWorkspace();
    } else {
      if (employeeLoginCard) employeeLoginCard.classList.remove('hidden');
      if (employeeDashboardView) employeeDashboardView.classList.add('hidden');
      if (employeeLiveTimerInterval) {
        clearInterval(employeeLiveTimerInterval);
        employeeLiveTimerInterval = null;
      }
    }
  }

  function startEmployeeLiveTimer(startTime) {
    if (employeeLiveTimerInterval) clearInterval(employeeLiveTimerInterval);
    const timerEl = document.getElementById('emp-live-timer');
    if (!timerEl) return;

    function tick() {
      const diffSec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      const hours = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const mins = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const secs = String(diffSec % 60).padStart(2, '0');
      timerEl.textContent = `Session: ${hours}:${mins}:${secs}`;
    }

    tick();
    employeeLiveTimerInterval = setInterval(tick, 1000);
  }

  if (employeeAuthForm) {
    employeeAuthForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = (employeeUsernameInput?.value || '').trim().toLowerCase();
      const password = (employeePasswordInput?.value || '').trim();

      const employees = getEmployees();
      const emp = employees.find(e => e.username.toLowerCase() === username && e.password === password);

      if (!emp) {
        alert('Invalid employee username or password. Please verify your credentials or contact administrator.');
        return;
      }

      if (emp.status !== 'Active') {
        alert('Access Restricted: This employee account has been suspended or deactivated by the Administrator.');
        return;
      }

      // Generate Session
      const sessionId = 'SESS-' + Date.now().toString(36).toUpperCase();
      const sessionObj = {
        id: emp.id,
        name: emp.name,
        username: emp.username,
        role: emp.role,
        email: emp.email,
        session_id: sessionId,
        session_start: Date.now()
      };
      sessionStorage.setItem('carbonaxis_current_employee', JSON.stringify(sessionObj));

      // Update Employee record
      emp.is_online = true;
      emp.last_login = new Date().toISOString();
      emp.login_count = (emp.login_count || 0) + 1;
      saveEmployees(employees);

      // Log Login Event
      await logEmployeeActivity({
        employee: sessionObj,
        action_type: 'LOGIN',
        action_label: 'Staff Member Login',
        details: `Employee authenticated into staff workspace from web portal session (Device: ${navigator.platform || 'Desktop Browser'}).`,
        session_id: sessionId
      });

      if (employeeUsernameInput) employeeUsernameInput.value = '';
      if (employeePasswordInput) employeePasswordInput.value = '';

      checkEmployeeAuth();
    });
  }

  const empAutofillBtn = document.getElementById('employee-autofill-demo-btn');
  if (empAutofillBtn) {
    empAutofillBtn.addEventListener('click', () => {
      if (employeeUsernameInput) employeeUsernameInput.value = 'alex_broker';
      if (employeePasswordInput) employeePasswordInput.value = 'broker123';
    });
  }

  if (employeeLogoutBtn) {
    employeeLogoutBtn.addEventListener('click', async () => {
      const curEmp = getCurrentEmployee();
      if (!curEmp) {
        sessionStorage.removeItem('carbonaxis_current_employee');
        checkEmployeeAuth();
        return;
      }

      const diffSec = Math.max(1, Math.floor((Date.now() - (curEmp.session_start || Date.now())) / 1000));
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      const durationStr = (mins > 0 ? `${mins}m ` : '') + `${secs}s`;

      const logs = getEmployeeLogs();
      const sessionActions = logs.filter(l => l.session_id === curEmp.session_id && l.action_type !== 'LOGIN');

      // Update Employee offline
      const employees = getEmployees();
      const emp = employees.find(e => e.id === curEmp.id);
      if (emp) {
        emp.is_online = false;
        emp.last_logout = new Date().toISOString();
        saveEmployees(employees);
      }

      // Log Logout Event
      await logEmployeeActivity({
        employee: curEmp,
        action_type: 'LOGOUT',
        action_label: 'Staff Member Logout',
        details: `Employee terminated staff session. Active duration: ${durationStr}. Total workspace actions logged in session: ${sessionActions.length}.`,
        session_id: curEmp.session_id
      });

      sessionStorage.removeItem('carbonaxis_current_employee');
      checkEmployeeAuth();
    });
  }

  if (employeeRefreshBtn) {
    employeeRefreshBtn.addEventListener('click', () => {
      loadEmployeeWorkspace();
      alert('Staff workspace data refreshed.');
    });
  }

  async function loadEmployeeWorkspace() {
    renderEmployeeSpreadsheet();
    await renderEmployeeLeads();
    renderEmployeeSessionFeed();
    updateEmployeeKPIs();

    const inquiries = await fetchInquiries();
    const leadsCountTab = document.getElementById('emp-leads-count-tab');
    if (leadsCountTab) leadsCountTab.textContent = inquiries.length;
  }

  async function renderEmployeeLeads() {
    if (!empLeadsContainer) return;
    const inquiries = await fetchInquiries();
    const filterStatus = empLeadsFilter?.value || 'all';

    const filtered = inquiries.filter(i => filterStatus === 'all' || (i.status || 'New') === filterStatus);

    if (filtered.length === 0) {
      empLeadsContainer.innerHTML = `
        <div class="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
          <i class="fa-solid fa-inbox text-2xl mb-1 block"></i>
          No leads matching status "${filterStatus}".
        </div>
      `;
      return;
    }

    empLeadsContainer.innerHTML = filtered.map(lead => {
      const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Recent';
      const notesList = Array.isArray(lead.internal_notes) ? lead.internal_notes : [];

      return `
        <div class="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 hover:border-slate-300 transition" data-id="${lead.id}">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span class="font-bold text-slate-900 text-xs">${escapeHtml(lead.name || 'Anonymous Client')}</span>
              <span class="text-[10px] text-slate-400 block">${dateStr} • ${escapeHtml(lead.inquiry_type || 'General Lead')}</span>
            </div>
            <div class="flex items-center gap-2">
              <select class="emp-lead-status-sel text-xs p-1.5 rounded-lg border border-slate-200 bg-white font-medium focus:outline-none" data-id="${lead.id}" data-name="${escapeHtml(lead.name)}">
                <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
                <option value="In Discussion" ${lead.status === 'In Discussion' ? 'selected' : ''}>In Discussion</option>
                <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                <option value="Closed" ${lead.status === 'Closed' ? 'selected' : ''}>Closed</option>
              </select>
              <button class="emp-add-note-btn px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition flex items-center gap-1" data-id="${lead.id}" data-name="${escapeHtml(lead.name)}">
                <i class="fa-solid fa-note-sticky"></i> Note
              </button>
            </div>
          </div>

          <div class="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 leading-relaxed">
            <div class="flex flex-wrap gap-3 mb-1 text-slate-400 text-[10px]">
              <span><i class="fa-solid fa-envelope"></i> ${escapeHtml(lead.email || 'N/A')}</span>
              <span><i class="fa-solid fa-phone"></i> ${escapeHtml(lead.phone || 'N/A')}</span>
            </div>
            <p>${escapeHtml(lead.message || 'No description provided.')}</p>
          </div>

          ${notesList.length > 0 ? `
            <div class="space-y-1.5 pt-1 border-t border-slate-100">
              <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Staff Notes:</span>
              ${notesList.map(n => `
                <div class="text-[10px] bg-amber-50/70 p-2 rounded-lg text-amber-900 border border-amber-100">
                  <div class="flex justify-between font-bold text-amber-800 mb-0.5">
                    <span>${escapeHtml(n.author || 'Staff')}</span>
                    <span class="text-[9px] text-amber-600 font-normal">${n.date ? new Date(n.date).toLocaleDateString() : ''}</span>
                  </div>
                  <p>${escapeHtml(n.text)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Attach status dropdown change listeners
    empLeadsContainer.querySelectorAll('.emp-lead-status-sel').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const clientName = e.target.getAttribute('data-name');
        const newStatus = e.target.value;
        const curEmp = getCurrentEmployee();

        await updateInquiryStatus(id, newStatus);

        await logEmployeeActivity({
          employee: curEmp,
          action_type: 'STATUS_UPDATE',
          action_label: 'Lead Status Updated',
          details: `Changed pipeline status of lead "${clientName}" (ID: ${id}) to "${newStatus}".`
        });

        loadEmployeeWorkspace();
      });
    });

    // Attach note buttons
    empLeadsContainer.querySelectorAll('.emp-add-note-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const name = btn.getAttribute('data-name');
        if (empNoteLeadId) empNoteLeadId.value = id;
        if (empNoteModalSubtitle) empNoteModalSubtitle.textContent = `Lead: ${name} (ID: ${id})`;
        if (empNoteContent) empNoteContent.value = '';
        if (employeeNoteModal) employeeNoteModal.classList.remove('hidden');
      });
    });
  }

  if (empLeadsFilter) {
    empLeadsFilter.addEventListener('change', renderEmployeeLeads);
  }

  // Handle Internal Note Form Submit
  if (employeeNoteForm) {
    employeeNoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const leadId = empNoteLeadId?.value;
      const content = (empNoteContent?.value || '').trim();
      const curEmp = getCurrentEmployee();

      if (!leadId || !content) return;

      const local = JSON.parse(localStorage.getItem('carbonaxis_inquiries') || '[]');
      const lead = local.find(i => String(i.id) === String(leadId));
      if (lead) {
        if (!Array.isArray(lead.internal_notes)) lead.internal_notes = [];
        lead.internal_notes.push({
          author: `${curEmp.name} (${curEmp.role})`,
          text: content,
          date: new Date().toISOString()
        });
        localStorage.setItem('carbonaxis_inquiries', JSON.stringify(local));

        await logEmployeeActivity({
          employee: curEmp,
          action_type: 'CLIENT_NOTE',
          action_label: 'Internal Lead Note Added',
          details: `Appended internal note to lead "${lead.name}": "${content}".`
        });
      }

      if (employeeNoteModal) employeeNoteModal.classList.add('hidden');
      loadEmployeeWorkspace();
    });
  }

  if (closeEmpNoteModalBtn) closeEmpNoteModalBtn.addEventListener('click', () => employeeNoteModal?.classList.add('hidden'));
  if (cancelEmpNoteModalBtn) cancelEmpNoteModalBtn.addEventListener('click', () => employeeNoteModal?.classList.add('hidden'));

  // Quick Interaction Form Submit
  if (empInteractionForm) {
    empInteractionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const clientName = (empIntClient?.value || '').trim();
      const channel = empIntChannel?.value || 'Phone Call';
      const notes = (empIntNotes?.value || '').trim();
      const curEmp = getCurrentEmployee();

      if (!clientName || !notes) {
        alert('Please provide client name and discussion summary.');
        return;
      }

      await logEmployeeActivity({
        employee: curEmp,
        action_type: 'CLIENT_LOG',
        action_label: 'Client Interaction Recorded',
        details: `Logged [${channel}] with client "${clientName}". Notes: "${notes}".`
      });

      if (empIntClient) empIntClient.value = '';
      if (empIntNotes) empIntNotes.value = '';

      alert(`Client interaction recorded in audit trail for "${clientName}".`);
      loadEmployeeWorkspace();
    });
  }

  // Hook Project Inspect buttons
  document.querySelectorAll('.emp-inspect-proj-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const projId = btn.getAttribute('data-id');
      const projName = btn.getAttribute('data-name');
      const curEmp = getCurrentEmployee();

      await logEmployeeActivity({
        employee: curEmp,
        action_type: 'CATALOG_INSPECT',
        action_label: 'Carbon Asset Inspected',
        details: `Inspected technical specifications & verification registry documents for project [${projId}] - ${projName}.`
      });

      alert(`TECHNICAL SPECIFICATION LOT REVIEW\n------------------------------------\nProject: ${projName}\nIdentifier: ${projId}\nVerification Body: Global Standard Verified Registry\nTrading Status: Ready for Allocation\n\nYour review has been timestamped in the compliance audit log.`);
      loadEmployeeWorkspace();
    });
  });

  // Render Live Session Activity Feed
  function renderEmployeeSessionFeed() {
    if (!empSessionLogList) return;
    const curEmp = getCurrentEmployee();
    if (!curEmp) return;

    const logs = getEmployeeLogs();
    const sessionLogs = logs.filter(l => l.session_id === curEmp.session_id);

    if (sessionLogs.length === 0) {
      empSessionLogList.innerHTML = `
        <div class="text-center py-6 text-slate-400 text-xs">
          No actions logged in current session yet.
        </div>
      `;
      return;
    }

    empSessionLogList.innerHTML = sessionLogs.map(l => {
      const timeStr = l.timestamp ? new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
      return `
        <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
          <div class="flex items-center justify-between text-[10px]">
            <span class="font-bold text-slate-700">${escapeHtml(l.action_label)}</span>
            <span class="font-mono text-slate-400">${timeStr}</span>
          </div>
          <p class="text-[11px] text-slate-600 line-clamp-2">${escapeHtml(l.details)}</p>
        </div>
      `;
    }).join('');
  }

  // Update Employee Dashboard KPI numbers
  async function updateEmployeeKPIs() {
    const curEmp = getCurrentEmployee();
    const inquiries = await fetchInquiries();
    const logs = getEmployeeLogs();

    const kpiLeads = document.getElementById('emp-kpi-leads');
    const kpiActions = document.getElementById('emp-kpi-actions');
    const kpiInteractions = document.getElementById('emp-kpi-interactions');

    if (kpiLeads) kpiLeads.textContent = inquiries.length;

    if (curEmp) {
      const today = new Date().toISOString().slice(0, 10);
      const myLogsToday = logs.filter(l => l.employee_username === curEmp.username && (l.timestamp || '').startsWith(today));
      const myInteractions = logs.filter(l => l.employee_username === curEmp.username && l.action_type === 'CLIENT_LOG');

      if (kpiActions) kpiActions.textContent = myLogsToday.length;
      if (kpiInteractions) kpiInteractions.textContent = myInteractions.length;
    }
  }

  // ==================== 10. Live Spreadsheet Grid System (Google Sheet / Excel Style) ====================
  const empTabSheetBtn = document.getElementById('emp-tab-sheet-btn');
  const empTabLeadsBtn = document.getElementById('emp-tab-leads-btn');
  const empTabSheetView = document.getElementById('emp-tab-sheet');
  const empTabLeadsView = document.getElementById('emp-tab-leads');

  function switchEmpSubTab(tab) {
    if (empTabSheetBtn && empTabLeadsBtn) {
      if (tab === 'sheet') {
        empTabSheetBtn.classList.add('border-emerald-600', 'text-emerald-600', 'active');
        empTabSheetBtn.classList.remove('border-transparent', 'text-slate-500');
        empTabLeadsBtn.classList.remove('border-emerald-600', 'text-emerald-600', 'active');
        empTabLeadsBtn.classList.add('border-transparent', 'text-slate-500');
        if (empTabSheetView) empTabSheetView.classList.remove('hidden');
        if (empTabLeadsView) empTabLeadsView.classList.add('hidden');
        renderEmployeeSpreadsheet();
      } else {
        empTabLeadsBtn.classList.add('border-emerald-600', 'text-emerald-600', 'active');
        empTabLeadsBtn.classList.remove('border-transparent', 'text-slate-500');
        empTabSheetBtn.classList.remove('border-emerald-600', 'text-emerald-600', 'active');
        empTabSheetBtn.classList.add('border-transparent', 'text-slate-500');
        if (empTabLeadsView) empTabLeadsView.classList.remove('hidden');
        if (empTabSheetView) empTabSheetView.classList.add('hidden');
        renderEmployeeLeads();
      }
    }
  }

  if (empTabSheetBtn) empTabSheetBtn.addEventListener('click', () => switchEmpSubTab('sheet'));
  if (empTabLeadsBtn) empTabLeadsBtn.addEventListener('click', () => switchEmpSubTab('leads'));

  const SPREADSHEET_PROJECT_OPTIONS = [
    'Acre Canopy Protection (PRJ-GS-0104)',
    'Sahara Solar Lot (PRJ-VCS-0218)',
    'Mombasa Mangrove Replanting (PRJ-PV-0342)',
    'Icelandic Direct Air Capture (PRJ-DAC-0419)',
    'Gujarat Wind Corridor (PRJ-VCS-0552)',
    'Andean Cloud Forest (PRJ-GS-0681)',
    'Custom Carbon Offset Lot'
  ];

  const SPREADSHEET_STAGE_OPTIONS = [
    'Lead Inbound',
    'Call Scheduled',
    'Term Sheet Sent',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
  ];

  function getSheetRecords() {
    let list = [];
    try {
      const stored = localStorage.getItem('carbonaxis_deal_sheet_records');
      if (stored) list = JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading sheet records:', e);
    }

    if (!list || list.length === 0) {
      list = [
        {
          id: "REC-101",
          client: "Microsoft Sustainability Fund",
          contact: "carbon-procure@microsoft.com",
          project: "Icelandic Direct Air Capture (PRJ-DAC-0419)",
          volume: 5200,
          price: 48.00,
          stage: "Term Sheet Sent",
          notes: "Requires Gold Standard retirement serial numbers for 2026 fiscal ESG audit.",
          broker: "Alex Morgan",
          broker_username: "alex_broker",
          updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: "REC-102",
          client: "Delta Global Logistics",
          contact: "esg-offsets@deltaglobal.com",
          project: "Acre Canopy Protection (PRJ-GS-0104)",
          volume: 12000,
          price: 15.00,
          stage: "Negotiation",
          notes: "Negotiating long-term forward off-take agreement for vintage 2024-2025.",
          broker: "Alex Morgan",
          broker_username: "alex_broker",
          updated_at: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: "REC-103",
          client: "Starlight Energy Group",
          contact: "trading@starlightenergy.co.uk",
          project: "Sahara Solar Lot (PRJ-VCS-0218)",
          volume: 18500,
          price: 12.00,
          stage: "Closed Won",
          notes: "First tranche clearing complete. Escrow verified via standard registry ledger.",
          broker: "Sarah Jenkins",
          broker_username: "sarah_broker",
          updated_at: new Date(Date.now() - 3600000 * 12).toISOString()
        },
        {
          id: "REC-104",
          client: "Amazon Climate Pledge Partner",
          contact: "netzero@amazonofftake.com",
          project: "Gujarat Wind Corridor (PRJ-VCS-0552)",
          volume: 25000,
          price: 9.80,
          stage: "In Discussion",
          notes: "Requested technical documentation on additionality and local community co-benefits.",
          broker: "Alex Morgan",
          broker_username: "alex_broker",
          updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: "REC-105",
          client: "Nordic Clean Maritime",
          contact: "offsets@nordicmaritime.no",
          project: "Mombasa Mangrove Replanting (PRJ-PV-0342)",
          volume: 8400,
          price: 18.50,
          stage: "Call Scheduled",
          notes: "Blue carbon credits desired to meet EU FuelMaritime emission quota.",
          broker: "Alex Morgan",
          broker_username: "alex_broker",
          updated_at: new Date(Date.now() - 3600000 * 36).toISOString()
        }
      ];
      localStorage.setItem('carbonaxis_deal_sheet_records', JSON.stringify(list));
    }
    return list;
  }

  function saveSheetRecords(list) {
    localStorage.setItem('carbonaxis_deal_sheet_records', JSON.stringify(list));
  }

  function updateSheetStatsElements(prefix, records) {
    const totalCount = records.length;
    let totalVolume = 0;
    let totalValue = 0;

    records.forEach(r => {
      const vol = Number(r.volume || 0);
      const prc = Number(r.price || 0);
      totalVolume += vol;
      totalValue += (vol * prc);
    });

    const avgPrice = totalVolume > 0 ? (totalValue / totalVolume) : 0;

    const countEl = document.getElementById(`${prefix}-sheet-stat-count`);
    const volEl = document.getElementById(`${prefix}-sheet-stat-volume`);
    const valEl = document.getElementById(`${prefix}-sheet-stat-value`);
    const avgEl = document.getElementById(`${prefix}-sheet-stat-avg`);

    if (countEl) countEl.textContent = totalCount;
    if (volEl) volEl.textContent = totalVolume.toLocaleString() + ' t';
    if (valEl) valEl.textContent = '$' + totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (avgEl) avgEl.textContent = '$' + avgPrice.toFixed(2) + '/t';

    if (prefix === 'emp') {
      const recCountEl = document.getElementById('emp-sheet-records-count');
      const pipelineKpi = document.getElementById('emp-kpi-pipeline');
      if (recCountEl) recCountEl.textContent = totalCount;
      if (pipelineKpi) pipelineKpi.textContent = '$' + totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (prefix === 'admin') {
      const tabCount = document.getElementById('tab-sheet-count');
      if (tabCount) tabCount.textContent = totalCount;
    }
  }

  function renderEmployeeSpreadsheet() {
    renderSpreadsheetGrid('emp-sheet-tbody', 'emp');
  }

  function renderAdminSpreadsheet() {
    renderSpreadsheetGrid('admin-sheet-tbody', 'admin');
  }

  function renderSpreadsheetGrid(tbodyId, mode) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const records = getSheetRecords();
    updateSheetStatsElements(mode, records);

    // If admin mode, populate broker filter
    if (mode === 'admin') {
      const brokerSelect = document.getElementById('admin-sheet-filter-broker');
      if (brokerSelect) {
        const curVal = brokerSelect.value;
        const employees = getEmployees();
        brokerSelect.innerHTML = '<option value="all">All Brokers</option>' +
          employees.map(e => `<option value="${escapeHtml(e.username)}" ${curVal === e.username ? 'selected' : ''}>${escapeHtml(e.name)} (@${escapeHtml(e.username)})</option>`).join('');
      }
    }

    const searchInput = document.getElementById(`${mode}-sheet-search`);
    const stageSelect = document.getElementById(`${mode}-sheet-filter-stage`);
    const brokerSelect = mode === 'admin' ? document.getElementById('admin-sheet-filter-broker') : null;

    const searchTerm = (searchInput?.value || '').toLowerCase();
    const stageFilter = stageSelect?.value || 'all';
    const brokerFilter = brokerSelect?.value || 'all';

    const filtered = records.filter(r => {
      const matchesSearch = 
        (r.client || '').toLowerCase().includes(searchTerm) ||
        (r.contact || '').toLowerCase().includes(searchTerm) ||
        (r.project || '').toLowerCase().includes(searchTerm) ||
        (r.notes || '').toLowerCase().includes(searchTerm) ||
        (r.broker || '').toLowerCase().includes(searchTerm) ||
        (r.broker_username || '').toLowerCase().includes(searchTerm);

      const matchesStage = stageFilter === 'all' || r.stage === stageFilter;
      const matchesBroker = brokerFilter === 'all' || r.broker_username === brokerFilter;

      return matchesSearch && matchesStage && matchesBroker;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" class="px-5 py-10 text-center text-slate-400">
            <i class="fa-solid fa-table-cells text-3xl mb-2 block text-slate-300"></i>
            No deal records matching filter. Click "+ Add Deal Row" to create a new spreadsheet record.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((r, idx) => {
      const vol = Number(r.volume || 0);
      const prc = Number(r.price || 0);
      const dealVal = vol * prc;

      // Project options
      const projectOptionsHtml = SPREADSHEET_PROJECT_OPTIONS.map(opt => 
        `<option value="${escapeHtml(opt)}" ${r.project === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`
      ).join('');

      // Stage options with colors
      const stageOptionsHtml = SPREADSHEET_STAGE_OPTIONS.map(opt => 
        `<option value="${escapeHtml(opt)}" ${r.stage === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`
      ).join('');

      let stageBadgeBg = 'bg-slate-100 text-slate-700';
      if (r.stage === 'Closed Won') stageBadgeBg = 'bg-emerald-100 text-emerald-800 font-bold';
      else if (r.stage === 'Negotiation') stageBadgeBg = 'bg-blue-100 text-blue-800 font-bold';
      else if (r.stage === 'Term Sheet Sent') stageBadgeBg = 'bg-purple-100 text-purple-800 font-bold';
      else if (r.stage === 'Call Scheduled') stageBadgeBg = 'bg-amber-100 text-amber-800';
      else if (r.stage === 'Closed Lost') stageBadgeBg = 'bg-rose-100 text-rose-800';

      return `
        <tr class="hover:bg-emerald-50/30 transition border-b border-slate-100 sheet-data-row" data-id="${r.id}">
          <!-- Row Num -->
          <td class="w-12 px-3 py-2 text-center font-mono text-[11px] text-slate-400 bg-slate-50/70 border-r border-slate-200">
            ${idx + 1}
          </td>

          <!-- Col A: Client / Company -->
          <td class="px-2 py-1.5 border-r border-slate-200">
            <input type="text" class="sheet-cell-field font-bold text-slate-900 w-full bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 outline-none text-xs" data-field="client" value="${escapeHtml(r.client)}" placeholder="Client Name..." />
          </td>

          <!-- Col B: Contact Email/Phone -->
          <td class="px-2 py-1.5 border-r border-slate-200">
            <input type="text" class="sheet-cell-field text-slate-600 font-mono text-[11px] w-full bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 outline-none" data-field="contact" value="${escapeHtml(r.contact)}" placeholder="contact@domain.com" />
          </td>

          <!-- Col C: Carbon Project Lot -->
          <td class="px-2 py-1.5 border-r border-slate-200">
            <select class="sheet-cell-field text-slate-800 font-medium text-xs w-full bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-1.5 py-1 outline-none cursor-pointer" data-field="project">
              ${projectOptionsHtml}
            </select>
          </td>

          <!-- Col D: Volume (Tons) -->
          <td class="px-2 py-1.5 border-r border-slate-200">
            <input type="number" step="100" min="0" class="sheet-cell-field sheet-calc-trigger font-mono font-bold text-blue-700 text-right w-full bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 outline-none text-xs" data-field="volume" value="${vol}" />
          </td>

          <!-- Col E: Price ($/t) -->
          <td class="px-2 py-1.5 border-r border-slate-200">
            <input type="number" step="0.10" min="0" class="sheet-cell-field sheet-calc-trigger font-mono font-semibold text-slate-800 text-right w-full bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 outline-none text-xs" data-field="price" value="${prc.toFixed(2)}" />
          </td>

          <!-- Col F: Deal Value ($) (Auto Calculated) -->
          <td class="px-3 py-1.5 border-r border-slate-200 text-right font-mono font-black text-emerald-700 text-xs whitespace-nowrap bg-emerald-50/20 sheet-row-deal-value">
            $${dealVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </td>

          <!-- Col G: Deal Stage -->
          <td class="px-2 py-1.5 border-r border-slate-200">
            <select class="sheet-cell-field text-xs font-semibold rounded px-2 py-1 w-full border-0 outline-none cursor-pointer ${stageBadgeBg}" data-field="stage">
              ${stageOptionsHtml}
            </select>
          </td>

          <!-- Col H: Notes & Remarks -->
          <td class="px-2 py-1.5 border-r border-slate-200">
            <input type="text" class="sheet-cell-field text-slate-600 text-[11px] w-full bg-transparent hover:bg-slate-100/70 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded px-2 py-1 outline-none" data-field="notes" value="${escapeHtml(r.notes || '')}" placeholder="Add deal notes, terms, requirements..." />
          </td>

          <!-- Col I: Staff Broker -->
          <td class="px-3 py-1.5 border-r border-slate-200 whitespace-nowrap">
            <span class="inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              <i class="fa-solid fa-user-check text-[9px] text-emerald-600"></i> @${escapeHtml(r.broker_username || 'alex_broker')}
            </span>
          </td>

          <!-- Actions -->
          <td class="px-2 py-1.5 text-center">
            <button class="sheet-delete-row-btn p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-xs" data-id="${r.id}" title="Delete Deal Row">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row events
    attachSpreadsheetRowEvents(tbody, mode);
  }

  function attachSpreadsheetRowEvents(tbody, mode) {
    const rows = tbody.querySelectorAll('.sheet-data-row');

    rows.forEach(row => {
      const id = row.getAttribute('data-id');
      const inputs = row.querySelectorAll('.sheet-cell-field');
      const valDisplay = row.querySelector('.sheet-row-deal-value');

      // Live Calculation on volume or price change
      const volInput = row.querySelector('[data-field="volume"]');
      const prcInput = row.querySelector('[data-field="price"]');

      function updateRowCalculation() {
        const vol = Number(volInput?.value || 0);
        const prc = Number(prcInput?.value || 0);
        const total = vol * prc;
        if (valDisplay) {
          valDisplay.textContent = '$' + total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      }

      if (volInput) volInput.addEventListener('input', updateRowCalculation);
      if (prcInput) prcInput.addEventListener('input', updateRowCalculation);

      // Save on change/blur
      inputs.forEach(input => {
        input.addEventListener('change', async (e) => {
          const field = e.target.getAttribute('data-field');
          let newVal = e.target.value;
          if (field === 'volume' || field === 'price') {
            newVal = Number(newVal || 0);
          }

          const records = getSheetRecords();
          const rec = records.find(r => r.id === id);
          if (rec) {
            const oldVal = rec[field];
            rec[field] = newVal;
            rec.updated_at = new Date().toISOString();

            // Set current editor if staff
            const curEmp = getCurrentEmployee();
            if (curEmp && mode === 'emp') {
              rec.broker = curEmp.name;
              rec.broker_username = curEmp.username;
            }

            saveSheetRecords(records);

            // Log activity to audit trail
            await logEmployeeActivity({
              employee: curEmp || { name: 'Admin', username: 'admin', role: 'Administrator' },
              action_type: 'SHEET_ROW_EDIT',
              action_label: 'Spreadsheet Record Edited',
              details: `Edited [${field}] for deal "${rec.client}" from "${oldVal}" to "${newVal}". Current deal value: $${(Number(rec.volume || 0) * Number(rec.price || 0)).toLocaleString()}.`
            });

            // Update stats
            updateSheetStatsElements('emp', records);
            updateSheetStatsElements('admin', records);
          }
        });
      });

      // Delete Row
      const delBtn = row.querySelector('.sheet-delete-row-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          const records = getSheetRecords();
          const rec = records.find(r => r.id === id);
          if (rec && confirm(`Are you sure you want to delete deal record for "${rec.client}"?`)) {
            const filtered = records.filter(r => r.id !== id);
            saveSheetRecords(filtered);

            const curEmp = getCurrentEmployee();
            await logEmployeeActivity({
              employee: curEmp || { name: 'Admin', username: 'admin', role: 'Administrator' },
              action_type: 'SHEET_ROW_DELETE',
              action_label: 'Spreadsheet Record Deleted',
              details: `Deleted deal record #${id} ("${rec.client}") of volume ${rec.volume}t.`
            });

            renderEmployeeSpreadsheet();
            renderAdminSpreadsheet();
          }
        });
      }
    });
  }

  async function addSpreadsheetRow(mode) {
    const records = getSheetRecords();
    const curEmp = getCurrentEmployee();
    const newId = 'REC-' + Math.floor(100 + Math.random() * 900);

    const newRecord = {
      id: newId,
      client: 'New Enterprise Client',
      contact: 'procurement@client.com',
      project: SPREADSHEET_PROJECT_OPTIONS[0],
      volume: 5000,
      price: 15.00,
      stage: 'Lead Inbound',
      notes: 'Initial requirement inquiry and credit batch allocation.',
      broker: curEmp?.name || (mode === 'admin' ? 'Administrator' : 'Alex Morgan'),
      broker_username: curEmp?.username || (mode === 'admin' ? 'admin' : 'alex_broker'),
      updated_at: new Date().toISOString()
    };

    records.unshift(newRecord);
    saveSheetRecords(records);

    await logEmployeeActivity({
      employee: curEmp || { name: 'Admin', username: 'admin', role: 'Administrator' },
      action_type: 'SHEET_ROW_ADD',
      action_label: 'New Spreadsheet Row Added',
      details: `Added new deal record #${newId} for "${newRecord.client}" (5,000t @ $15.00/t).`
    });

    renderEmployeeSpreadsheet();
    renderAdminSpreadsheet();
  }

  function exportSpreadsheetCSV() {
    const records = getSheetRecords();
    if (records.length === 0) {
      alert('No spreadsheet records to export.');
      return;
    }

    const headers = ['Row', 'ID', 'Client / Company', 'Contact Email/Phone', 'Carbon Project Lot', 'Volume (Tons)', 'Price ($/t)', 'Deal Value ($)', 'Deal Stage', 'Notes & Remarks', 'Staff Broker', 'Last Updated'];
    const rows = records.map((r, idx) => {
      const vol = Number(r.volume || 0);
      const prc = Number(r.price || 0);
      const val = vol * prc;
      return [
        idx + 1,
        `"${r.id || ''}"`,
        `"${(r.client || '').replace(/"/g, '""')}"`,
        `"${(r.contact || '').replace(/"/g, '""')}"`,
        `"${(r.project || '').replace(/"/g, '""')}"`,
        vol,
        prc.toFixed(2),
        val.toFixed(2),
        `"${(r.stage || '').replace(/"/g, '""')}"`,
        `"${(r.notes || '').replace(/"/g, '""')}"`,
        `"${(r.broker || '').replace(/"/g, '""')} (@${r.broker_username || ''})"`,
        `"${r.updated_at || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CarbonAxis_Master_Deals_Sheet_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Hook toolbar buttons
  const empSheetAddBtn = document.getElementById('emp-sheet-add-row-btn');
  const empSheetExportBtn = document.getElementById('emp-sheet-export-btn');
  const empSheetSearch = document.getElementById('emp-sheet-search');
  const empSheetStage = document.getElementById('emp-sheet-filter-stage');

  if (empSheetAddBtn) empSheetAddBtn.addEventListener('click', () => addSpreadsheetRow('emp'));
  if (empSheetExportBtn) empSheetExportBtn.addEventListener('click', exportSpreadsheetCSV);
  if (empSheetSearch) empSheetSearch.addEventListener('input', renderEmployeeSpreadsheet);
  if (empSheetStage) empSheetStage.addEventListener('change', renderEmployeeSpreadsheet);

  const adminSheetAddBtn = document.getElementById('admin-sheet-add-row-btn');
  const adminSheetExportBtn = document.getElementById('admin-sheet-export-btn');
  const adminSheetSearch = document.getElementById('admin-sheet-search');
  const adminSheetStage = document.getElementById('admin-sheet-filter-stage');
  const adminSheetBroker = document.getElementById('admin-sheet-filter-broker');

  if (adminSheetAddBtn) adminSheetAddBtn.addEventListener('click', () => addSpreadsheetRow('admin'));
  if (adminSheetExportBtn) adminSheetExportBtn.addEventListener('click', exportSpreadsheetCSV);
  if (adminSheetSearch) adminSheetSearch.addEventListener('input', renderAdminSpreadsheet);
  if (adminSheetStage) adminSheetStage.addEventListener('change', renderAdminSpreadsheet);
  if (adminSheetBroker) adminSheetBroker.addEventListener('change', renderAdminSpreadsheet);

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
