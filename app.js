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

  // ==================== 10. Authentic Google Sheets Web App Engine ====================
  const GS_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const GS_DEFAULT_ROWS = 35;

  let gsheetState = null;
  let empSelectedCell = { col: 'A', row: 1 };
  let adminSelectedCell = { col: 'A', row: 1 };
  let empInlineEditor = null;
  let adminInlineEditor = null;

  function initDefaultGSheetState() {
    const state = {
      title: 'CarbonAxis Master Deals 2026',
      rows: GS_DEFAULT_ROWS,
      starred: true,
      cells: {}
    };

    // Row 1: Column Headers
    const headers = [
      { col: 'A', val: 'Client / Organization', align: 'left', minW: 190 },
      { col: 'B', val: 'Contact / Email / Phone', align: 'left', minW: 180 },
      { col: 'C', val: 'Carbon Registry & Project', align: 'left', minW: 220 },
      { col: 'D', val: 'Volume (tCO2e)', align: 'right', minW: 120 },
      { col: 'E', val: 'Price ($/t)', align: 'right', minW: 100 },
      { col: 'F', val: 'Deal Value ($)', align: 'right', minW: 130 },
      { col: 'G', val: 'Deal Stage', align: 'center', minW: 140 },
      { col: 'H', val: 'Notes & ESG Terms', align: 'left', minW: 230 },
      { col: 'I', val: 'Assigned Broker', align: 'left', minW: 160 },
      { col: 'J', val: 'Vintage', align: 'center', minW: 90 },
      { col: 'K', val: 'Registry Status', align: 'center', minW: 140 },
      { col: 'L', val: 'Closing Date', align: 'center', minW: 110 },
      { col: 'M', val: 'Internal Ref', align: 'center', minW: 110 },
      { col: 'N', val: 'Broker Fee ($)', align: 'right', minW: 120 }
    ];

    headers.forEach(h => {
      state.cells[h.col + '1'] = {
        raw: h.val,
        bold: true,
        bg: '#f8fafd',
        color: '#1f1f1f',
        align: h.align
      };
    });

    // Row 2: Microsoft
    state.cells['A2'] = { raw: 'Microsoft Sustainability Fund', bold: true };
    state.cells['B2'] = { raw: 'carbon-procure@microsoft.com' };
    state.cells['C2'] = { raw: 'Icelandic Direct Air Capture (PRJ-DAC-0419)' };
    state.cells['D2'] = { raw: '5200', align: 'right', fmt: 'number' };
    state.cells['E2'] = { raw: '48.00', align: 'right', fmt: 'currency' };
    state.cells['F2'] = { raw: '=D2*E2', align: 'right', bold: true, color: '#047857', fmt: 'currency' };
    state.cells['G2'] = { raw: 'Term Sheet Sent', align: 'center', bold: true, color: '#6b21a8', bg: '#f3e8ff' };
    state.cells['H2'] = { raw: 'Requires Gold Standard retirement serial numbers for 2026 fiscal ESG audit.' };
    state.cells['I2'] = { raw: 'Alex Morgan (@alex_broker)' };
    state.cells['J2'] = { raw: '2025-2026', align: 'center' };
    state.cells['K2'] = { raw: 'Gold Standard Verified', align: 'center', color: '#047857' };
    state.cells['L2'] = { raw: '2026-11-15', align: 'center' };
    state.cells['M2'] = { raw: 'CA-MSFT-09', align: 'center' };
    state.cells['N2'] = { raw: '=F2*0.03', align: 'right', fmt: 'currency' };

    // Row 3: Delta Global
    state.cells['A3'] = { raw: 'Delta Global Logistics', bold: true };
    state.cells['B3'] = { raw: 'esg-offsets@deltaglobal.com' };
    state.cells['C3'] = { raw: 'Acre Canopy Protection (PRJ-GS-0104)' };
    state.cells['D3'] = { raw: '12000', align: 'right', fmt: 'number' };
    state.cells['E3'] = { raw: '15.00', align: 'right', fmt: 'currency' };
    state.cells['F3'] = { raw: '=D3*E3', align: 'right', bold: true, color: '#047857', fmt: 'currency' };
    state.cells['G3'] = { raw: 'Negotiation', align: 'center', bold: true, color: '#1d4ed8', bg: '#eff6ff' };
    state.cells['H3'] = { raw: 'Negotiating long-term forward off-take agreement for vintage 2024-2025.' };
    state.cells['I3'] = { raw: 'Alex Morgan (@alex_broker)' };
    state.cells['J3'] = { raw: '2024', align: 'center' };
    state.cells['K3'] = { raw: 'Verra VCS Active', align: 'center', color: '#047857' };
    state.cells['L3'] = { raw: '2026-11-20', align: 'center' };
    state.cells['M3'] = { raw: 'CA-DLT-41', align: 'center' };
    state.cells['N3'] = { raw: '=F3*0.03', align: 'right', fmt: 'currency' };

    // Row 4: Starlight Energy
    state.cells['A4'] = { raw: 'Starlight Energy Group', bold: true };
    state.cells['B4'] = { raw: 'trading@starlightenergy.co.uk' };
    state.cells['C4'] = { raw: 'Sahara Solar Lot (PRJ-VCS-0218)' };
    state.cells['D4'] = { raw: '18500', align: 'right', fmt: 'number' };
    state.cells['E4'] = { raw: '12.00', align: 'right', fmt: 'currency' };
    state.cells['F4'] = { raw: '=D4*E4', align: 'right', bold: true, color: '#047857', fmt: 'currency' };
    state.cells['G4'] = { raw: 'Closed Won', align: 'center', bold: true, color: '#15803d', bg: '#dcfce7' };
    state.cells['H4'] = { raw: 'First tranche clearing complete. Escrow verified via standard registry ledger.' };
    state.cells['I4'] = { raw: 'Sarah Jenkins (@sarah_broker)' };
    state.cells['J4'] = { raw: '2025', align: 'center' };
    state.cells['K4'] = { raw: 'Registry Confirmed', align: 'center', color: '#047857' };
    state.cells['L4'] = { raw: '2026-10-28', align: 'center' };
    state.cells['M4'] = { raw: 'CA-SLT-18', align: 'center' };
    state.cells['N4'] = { raw: '=F4*0.03', align: 'right', fmt: 'currency' };

    // Row 5: Amazon Climate Partner
    state.cells['A5'] = { raw: 'Amazon Climate Partner', bold: true };
    state.cells['B5'] = { raw: 'netzero@amazonofftake.com' };
    state.cells['C5'] = { raw: 'Gujarat Wind Corridor (PRJ-VCS-0552)' };
    state.cells['D5'] = { raw: '25000', align: 'right', fmt: 'number' };
    state.cells['E5'] = { raw: '9.80', align: 'right', fmt: 'currency' };
    state.cells['F5'] = { raw: '=D5*E5', align: 'right', bold: true, color: '#047857', fmt: 'currency' };
    state.cells['G5'] = { raw: 'Lead Inbound', align: 'center', bold: true, color: '#475569', bg: '#f1f5f9' };
    state.cells['H5'] = { raw: 'Requested technical documentation on additionality and local community co-benefits.' };
    state.cells['I2'] = { raw: 'Alex Morgan (@alex_broker)' };
    state.cells['J5'] = { raw: '2025', align: 'center' };
    state.cells['K5'] = { raw: 'VCS Registered', align: 'center', color: '#047857' };
    state.cells['L5'] = { raw: '2026-12-01', align: 'center' };
    state.cells['M5'] = { raw: 'CA-AMZ-77', align: 'center' };
    state.cells['N5'] = { raw: '=F5*0.03', align: 'right', fmt: 'currency' };

    // Row 6: Nordic Clean Maritime
    state.cells['A6'] = { raw: 'Nordic Clean Maritime', bold: true };
    state.cells['B6'] = { raw: 'offsets@nordicmaritime.no' };
    state.cells['C6'] = { raw: 'Mombasa Mangrove Replanting (PRJ-PV-0342)' };
    state.cells['D6'] = { raw: '8400', align: 'right', fmt: 'number' };
    state.cells['E6'] = { raw: '18.50', align: 'right', fmt: 'currency' };
    state.cells['F6'] = { raw: '=D6*E6', align: 'right', bold: true, color: '#047857', fmt: 'currency' };
    state.cells['G6'] = { raw: 'Call Scheduled', align: 'center', bold: true, color: '#b45309', bg: '#fef3c7' };
    state.cells['H6'] = { raw: 'Blue carbon credits desired to meet EU FuelMaritime emission quota.' };
    state.cells['I6'] = { raw: 'Alex Morgan (@alex_broker)' };
    state.cells['J6'] = { raw: '2025', align: 'center' };
    state.cells['K6'] = { raw: 'Plan Vivo Verified', align: 'center', color: '#047857' };
    state.cells['L6'] = { raw: '2026-11-30', align: 'center' };
    state.cells['M6'] = { raw: 'CA-NDM-03', align: 'center' };
    state.cells['N6'] = { raw: '=F6*0.03', align: 'right', fmt: 'currency' };

    // Row 7: Portfolio Summary Totals (Google Sheet Functions)
    state.cells['A7'] = { raw: 'PORTFOLIO TOTALS', bold: true, bg: '#ecfdf5', color: '#065f46' };
    state.cells['B7'] = { raw: '', bg: '#ecfdf5' };
    state.cells['C7'] = { raw: '', bg: '#ecfdf5' };
    state.cells['D7'] = { raw: '=SUM(D2:D6)', bold: true, bg: '#ecfdf5', align: 'right', color: '#1e40af', fmt: 'number' };
    state.cells['E7'] = { raw: '=AVERAGE(E2:E6)', bold: true, bg: '#ecfdf5', align: 'right', color: '#065f46', fmt: 'currency' };
    state.cells['F7'] = { raw: '=SUM(F2:F6)', bold: true, bg: '#ecfdf5', align: 'right', color: '#047857', fmt: 'currency' };
    state.cells['G7'] = { raw: 'ACTIVE PIPELINE', bold: true, bg: '#ecfdf5', align: 'center', color: '#065f46' };
    state.cells['H7'] = { raw: 'Verified CarbonAxis Deal Desk Ledger', bg: '#ecfdf5', color: '#047857' };
    state.cells['I7'] = { raw: 'All Active Brokers', bg: '#ecfdf5', color: '#065f46' };
    state.cells['J7'] = { raw: '', bg: '#ecfdf5' };
    state.cells['K7'] = { raw: '', bg: '#ecfdf5' };
    state.cells['L7'] = { raw: '', bg: '#ecfdf5' };
    state.cells['M7'] = { raw: '', bg: '#ecfdf5' };
    state.cells['N7'] = { raw: '=SUM(N2:N6)', bold: true, bg: '#ecfdf5', align: 'right', color: '#047857', fmt: 'currency' };

    return state;
  }

  const SHEETS_STORE_KEY = 'carbonaxis_sheets_store_v4';
  const ACTIVE_SHEET_KEY = 'carbonaxis_active_sheet_id_v4';

  function getSheetsStore() {
    let store = {};
    try {
      const stored = localStorage.getItem(SHEETS_STORE_KEY);
      if (stored) store = JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading sheets store:', e);
    }
    if (!store || Object.keys(store).length === 0) {
      const defaultState = initDefaultGSheetState();
      defaultState.id = 'sheet_master_2026';
      defaultState.author = 'Alex Morgan (@alex_broker)';
      defaultState.createdAt = '2026-10-31T09:00:00.000Z';
      defaultState.updatedAt = new Date().toISOString();
      store = { 'sheet_master_2026': defaultState };
      localStorage.setItem(SHEETS_STORE_KEY, JSON.stringify(store));
      localStorage.setItem(ACTIVE_SHEET_KEY, 'sheet_master_2026');
    }
    return store;
  }

  function saveSheetsStore(store) {
    localStorage.setItem(SHEETS_STORE_KEY, JSON.stringify(store));
  }

  function getActiveSheetId() {
    let id = localStorage.getItem(ACTIVE_SHEET_KEY);
    const store = getSheetsStore();
    if (!id || !store[id]) {
      id = Object.keys(store)[0] || 'sheet_master_2026';
      localStorage.setItem(ACTIVE_SHEET_KEY, id);
    }
    return id;
  }

  function getGSheetState() {
    const store = getSheetsStore();
    const activeId = getActiveSheetId();
    if (!store[activeId]) {
      const firstId = Object.keys(store)[0];
      return store[firstId] || initDefaultGSheetState();
    }
    return store[activeId];
  }

  function saveGSheetState(state, editorRole, cellKey, oldVal, newVal) {
    const store = getSheetsStore();
    const activeId = state.id || getActiveSheetId();
    state.id = activeId;
    state.updatedAt = new Date().toISOString();
    store[activeId] = state;
    saveSheetsStore(store);

    // Update cloud status
    ['emp', 'admin'].forEach(prefix => {
      const statusText = document.getElementById(`${prefix}-gs-status-text`);
      if (statusText) {
        statusText.textContent = 'Saving...';
        setTimeout(() => {
          if (statusText) statusText.textContent = 'All changes saved to Drive';
        }, 350);
      }
    });

    // Log employee action if a cell was edited
    if (cellKey && oldVal !== newVal) {
      const curEmp = getCurrentEmployee();
      logEmployeeActivity({
        employee: curEmp || { name: 'Admin', username: 'admin', role: 'Administrator' },
        action_type: 'GSHEET_CELL_EDIT',
        action_label: 'Google Sheet Cell Edited',
        details: `Updated [${cellKey}] in "${state.title}" from "${oldVal || ''}" to "${newVal || ''}".`
      });
    }

    // Sync to Supabase deal_sheets cloud table if connected
    if (supabaseClient) {
      try {
        supabaseClient.from('deal_sheets').upsert([{
          id: activeId,
          title: state.title,
          cells: state.cells,
          rows: state.rows,
          updated_at: state.updatedAt
        }]).then(({ error }) => {
          if (error) console.warn('Supabase deal_sheets sync notice:', error.message);
        }).catch(err => console.warn('Supabase sheet notice:', err));
      } catch (e) {
        // Fallback safely to localStorage
      }
    }

    updateGSheetKPIs();
  }

  // Range and Cell evaluation
  function parseCellCoord(coord) {
    const m = coord.match(/^([A-Z]+)([0-9]+)$/i);
    if (!m) return null;
    return {
      col: m[1].toUpperCase(),
      row: parseInt(m[2], 10)
    };
  }

  function getRangeCells(startCoord, endCoord) {
    const s = parseCellCoord(startCoord);
    const e = parseCellCoord(endCoord);
    if (!s || !e) return [];

    const colStartIdx = GS_COLS.indexOf(s.col);
    const colEndIdx = GS_COLS.indexOf(e.col);
    if (colStartIdx === -1 || colEndIdx === -1) return [];

    const cMin = Math.min(colStartIdx, colEndIdx);
    const cMax = Math.max(colStartIdx, colEndIdx);
    const rMin = Math.min(s.row, e.row);
    const rMax = Math.max(s.row, e.row);

    const result = [];
    for (let r = rMin; r <= rMax; r++) {
      for (let c = cMin; c <= cMax; c++) {
        result.push(GS_COLS[c] + r);
      }
    }
    return result;
  }

  function evalGSheetCell(key, state, visited = new Set()) {
    if (visited.has(key)) return '#CIRCULAR!';
    visited.add(key);

    const cell = state.cells[key];
    if (!cell || cell.raw === undefined || cell.raw === null) return '';
    let raw = String(cell.raw).trim();
    if (!raw.startsWith('=')) {
      // Auto-formatting for plain numbers
      if (cell.fmt === 'currency' && !isNaN(Number(raw)) && raw !== '') {
        return '$' + Number(raw).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      if (cell.fmt === 'number' && !isNaN(Number(raw)) && raw !== '') {
        return Number(raw).toLocaleString();
      }
      return raw;
    }

    // Formula execution
    try {
      const formula = raw.substring(1).trim();

      // Range Function: =SUM(D2:D6)
      const sumMatch = formula.match(/^SUM\s*\(\s*([A-Z]+[0-9]+)\s*:\s*([A-Z]+[0-9]+)\s*\)$/i);
      if (sumMatch) {
        const cells = getRangeCells(sumMatch[1], sumMatch[2]);
        let total = 0;
        cells.forEach(k => {
          const val = evalGSheetCell(k, state, new Set(visited));
          const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]/g, ''));
          if (!isNaN(num)) total += num;
        });
        if (cell.fmt === 'currency' || key.startsWith('F') || key.startsWith('N')) {
          return '$' + total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        if (cell.fmt === 'number' || key.startsWith('D')) {
          return total.toLocaleString();
        }
        return total;
      }

      // Range Function: =AVERAGE(E2:E6)
      const avgMatch = formula.match(/^AVERAGE\s*\(\s*([A-Z]+[0-9]+)\s*:\s*([A-Z]+[0-9]+)\s*\)$/i);
      if (avgMatch) {
        const cells = getRangeCells(avgMatch[1], avgMatch[2]);
        let total = 0;
        let count = 0;
        cells.forEach(k => {
          const val = evalGSheetCell(k, state, new Set(visited));
          const num = typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]/g, ''));
          if (!isNaN(num) && num !== 0) {
            total += num;
            count++;
          }
        });
        const avg = count > 0 ? (total / count) : 0;
        if (cell.fmt === 'currency' || key.startsWith('E')) {
          return '$' + avg.toFixed(2);
        }
        return avg.toFixed(2);
      }

      // Range Function: =COUNT(D2:D6)
      const countMatch = formula.match(/^COUNT\s*\(\s*([A-Z]+[0-9]+)\s*:\s*([A-Z]+[0-9]+)\s*\)$/i);
      if (countMatch) {
        const cells = getRangeCells(countMatch[1], countMatch[2]);
        let count = 0;
        cells.forEach(k => {
          const val = evalGSheetCell(k, state, new Set(visited));
          if (val !== '' && val !== null && val !== undefined) count++;
        });
        return count;
      }

      // Basic arithmetic: =D2*E2 or =D2+E2 or =F2*0.03
      let expr = formula;
      const refMatches = formula.match(/([A-Z]+[0-9]+)/gi) || [];
      for (const ref of refMatches) {
        const refVal = evalGSheetCell(ref.toUpperCase(), state, new Set(visited));
        const num = typeof refVal === 'number' ? refVal : Number(String(refVal).replace(/[^0-9.-]/g, ''));
        expr = expr.replace(new RegExp('\\b' + ref + '\\b', 'gi'), isNaN(num) ? 0 : num);
      }

      // Safe arithmetic evaluator
      if (/^[0-9+\-*/().\s]+$/.test(expr)) {
        // eslint-disable-next-line no-eval
        const calc = Function('"use strict"; return (' + expr + ')')();
        if (typeof calc === 'number' && !isNaN(calc)) {
          if (cell.fmt === 'currency' || key.startsWith('F') || key.startsWith('N')) {
            return '$' + calc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
          if (cell.fmt === 'number') {
            return calc.toLocaleString();
          }
          return calc;
        }
      }

      return raw;
    } catch (e) {
      return '#VALUE!';
    }
  }

  function updateGSheetKPIs() {
    const state = getGSheetState();
    let totalDeals = 0;
    let totalPipeline = 0;

    // Calculate deals count and volume from rows 2..35
    for (let r = 2; r <= state.rows; r++) {
      if (r === 7) continue; // skip portfolio totals row
      const clientCell = state.cells['A' + r];
      if (clientCell && clientCell.raw && String(clientCell.raw).trim() !== '') {
        totalDeals++;
        const fVal = evalGSheetCell('F' + r, state);
        const num = typeof fVal === 'number' ? fVal : Number(String(fVal).replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) totalPipeline += num;
      }
    }

    const valFormatted = '$' + totalPipeline.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const empCountEl = document.getElementById('emp-sheet-records-count');
    const empKpiVal = document.getElementById('emp-gs-kpi-val');
    const empPipelineKpi = document.getElementById('emp-kpi-pipeline');
    const adminCountEl = document.getElementById('tab-sheet-count');
    const adminKpiVal = document.getElementById('admin-gs-kpi-val');

    if (empCountEl) empCountEl.textContent = totalDeals;
    if (empKpiVal) empKpiVal.textContent = valFormatted;
    if (empPipelineKpi) empPipelineKpi.textContent = valFormatted;
    if (adminCountEl) adminCountEl.textContent = totalDeals;
    if (adminKpiVal) adminKpiVal.textContent = valFormatted;
  }

  // Render Google Sheet Table
  function renderGSheet(mode) {
    const table = document.getElementById(`${mode}-gs-table`);
    if (!table) return;

    const state = getGSheetState();
    const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;

    let html = '<thead><tr>';
    // Corner header
    html += `<th class="gs-corner-header" id="${mode}-gs-corner"></th>`;

    // Column Headers A to N
    GS_COLS.forEach(col => {
      const isActive = sel.col === col;
      html += `<th class="gs-col-header ${isActive ? 'gs-active' : ''}" data-col="${col}" id="${mode}-gs-col-${col}">${col}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Grid Rows
    for (let r = 1; r <= state.rows; r++) {
      const isRowActive = sel.row === r;
      html += `<tr><td class="gs-row-header ${isRowActive ? 'gs-active' : ''}" data-row="${r}" id="${mode}-gs-row-${r}">${r}</td>`;

      GS_COLS.forEach(col => {
        const key = col + r;
        const cell = state.cells[key] || {};
        const isSelected = sel.col === col && sel.row === r;
        const displayVal = evalGSheetCell(key, state);

        let style = '';
        if (cell.bold) style += 'font-weight:bold;';
        if (cell.italic) style += 'font-style:italic;';
        if (cell.strike) style += 'text-decoration:line-through;';
        if (cell.align) style += `text-align:${cell.align};`;
        if (cell.color) style += `color:${cell.color};`;
        if (cell.bg) style += `background-color:${cell.bg};`;
        if (cell.size) style += `font-size:${cell.size}px;`;

        html += `<td class="gs-cell ${isSelected ? 'gs-selected' : ''}" data-cell="${key}" data-col="${col}" data-row="${r}" style="${style}" title="${key}: ${escapeHtml(String(cell.raw || ''))}">`;
        html += escapeHtml(String(displayVal));
        if (isSelected) {
          html += `<div class="gs-drag-handle"></div>`;
        }
        html += '</td>';
      });

      html += '</tr>';
    }

    html += '</tbody>';
    table.innerHTML = html;

    // Update Name Box and Formula input
    const curKey = sel.col + sel.row;
    const curCell = state.cells[curKey] || {};
    const nameBox = document.getElementById(`${mode}-gs-name-box`);
    const formulaInput = document.getElementById(`${mode}-gs-formula-input`);
    const docTitle = document.getElementById(`${mode}-gs-doc-title`);

    if (nameBox) nameBox.textContent = curKey;
    if (formulaInput && document.activeElement !== formulaInput) {
      formulaInput.value = curCell.raw || '';
    }
    if (docTitle && document.activeElement !== docTitle) {
      docTitle.value = state.title || 'CarbonAxis Master Deals 2026';
    }

    updateGSheetKPIs();
    attachGSheetEvents(mode);
  }

  function attachGSheetEvents(mode) {
    const table = document.getElementById(`${mode}-gs-table`);
    if (!table) return;

    // Click cell to select
    const cells = table.querySelectorAll('.gs-cell');
    cells.forEach(cellEl => {
      cellEl.addEventListener('click', (e) => {
        const key = cellEl.getAttribute('data-cell');
        const col = cellEl.getAttribute('data-col');
        const row = parseInt(cellEl.getAttribute('data-row'), 10);
        selectGSheetCell(mode, col, row);
      });

      // Double click to inline edit
      cellEl.addEventListener('dblclick', (e) => {
        const col = cellEl.getAttribute('data-col');
        const row = parseInt(cellEl.getAttribute('data-row'), 10);
        startInlineEditing(mode, col, row);
      });
    });
  }

  function selectGSheetCell(mode, col, row) {
    if (mode === 'emp') {
      empSelectedCell = { col, row };
    } else {
      adminSelectedCell = { col, row };
    }

    const state = getGSheetState();
    const key = col + row;
    const cell = state.cells[key] || {};

    const nameBox = document.getElementById(`${mode}-gs-name-box`);
    const formulaInput = document.getElementById(`${mode}-gs-formula-input`);

    if (nameBox) nameBox.textContent = key;
    if (formulaInput) formulaInput.value = cell.raw || '';

    // Update active highlight classes without re-rendering entire table for speed
    const table = document.getElementById(`${mode}-gs-table`);
    if (table) {
      table.querySelectorAll('.gs-cell.gs-selected').forEach(c => {
        c.classList.remove('gs-selected');
        const handle = c.querySelector('.gs-drag-handle');
        if (handle) handle.remove();
      });

      table.querySelectorAll('.gs-col-header.gs-active').forEach(c => c.classList.remove('gs-active'));
      table.querySelectorAll('.gs-row-header.gs-active').forEach(r => r.classList.remove('gs-active'));

      const targetCell = table.querySelector(`[data-cell="${key}"]`);
      if (targetCell) {
        targetCell.classList.add('gs-selected');
        const handle = document.createElement('div');
        handle.className = 'gs-drag-handle';
        targetCell.appendChild(handle);
      }

      const colHeader = document.getElementById(`${mode}-gs-col-${col}`);
      const rowHeader = document.getElementById(`${mode}-gs-row-${row}`);
      if (colHeader) colHeader.classList.add('gs-active');
      if (rowHeader) rowHeader.classList.add('gs-active');
    }
  }

  function startInlineEditing(mode, col, row) {
    const table = document.getElementById(`${mode}-gs-table`);
    if (!table) return;
    const key = col + row;
    const cellEl = table.querySelector(`[data-cell="${key}"]`);
    if (!cellEl) return;

    const state = getGSheetState();
    const cell = state.cells[key] || {};
    const oldRaw = cell.raw || '';

    // Remove old editor if any
    const existingInput = cellEl.querySelector('.gs-cell-editor');
    if (existingInput) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'gs-cell-editor';
    input.value = oldRaw;
    cellEl.appendChild(input);
    input.focus();
    input.select();

    const formulaInput = document.getElementById(`${mode}-gs-formula-input`);

    input.addEventListener('input', () => {
      if (formulaInput) formulaInput.value = input.value;
    });

    function commitEdit() {
      const newVal = input.value;
      if (!state.cells[key]) state.cells[key] = {};
      state.cells[key].raw = newVal;
      saveGSheetState(state, mode, key, oldRaw, newVal);
      renderGSheet('emp');
      renderGSheet('admin');
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
        // Move to next row
        selectGSheetCell(mode, col, Math.min(row + 1, state.rows));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitEdit();
        // Move to next col
        const curIdx = GS_COLS.indexOf(col);
        const nextCol = GS_COLS[Math.min(curIdx + 1, GS_COLS.length - 1)];
        selectGSheetCell(mode, nextCol, row);
      } else if (e.key === 'Escape') {
        input.remove();
        renderGSheet(mode);
      }
    });

    input.addEventListener('blur', () => {
      commitEdit();
    });
  }

  // Keyboard navigation on spreadsheet
  document.addEventListener('keydown', (e) => {
    // Only capture if active element is not an input/textarea (unless it's cell editor)
    const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (activeTag === 'textarea' || (activeTag === 'input' && !document.activeElement.classList.contains('gs-cell-editor'))) {
      return;
    }

    // Determine which view is currently open
    const isEmpVisible = empTabSheetView && !empTabSheetView.classList.contains('hidden') && viewEmployee && !viewEmployee.classList.contains('hidden');
    const isAdminVisible = tabSheetView && !tabSheetView.classList.contains('hidden') && adminDashboardView && !adminDashboardView.classList.contains('hidden');

    if (!isEmpVisible && !isAdminVisible) return;
    const mode = isEmpVisible ? 'emp' : 'admin';
    const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
    const state = getGSheetState();
    const colIdx = GS_COLS.indexOf(sel.col);

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectGSheetCell(mode, sel.col, Math.max(1, sel.row - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectGSheetCell(mode, sel.col, Math.min(state.rows, sel.row + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectGSheetCell(mode, GS_COLS[Math.max(0, colIdx - 1)], sel.row);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectGSheetCell(mode, GS_COLS[Math.min(GS_COLS.length - 1, colIdx + 1)], sel.row);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      startInlineEditing(mode, sel.col, sel.row);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement && document.activeElement.classList.contains('gs-cell-editor')) return;
      e.preventDefault();
      const key = sel.col + sel.row;
      if (state.cells[key]) {
        const oldVal = state.cells[key].raw;
        state.cells[key].raw = '';
        saveGSheetState(state, mode, key, oldVal, '');
        renderGSheet('emp');
        renderGSheet('admin');
      }
    }
  });

  // Setup toolbar & formula bar handlers for both Emp & Admin
  ['emp', 'admin'].forEach(mode => {
    // Formula bar input sync
    const formulaInput = document.getElementById(`${mode}-gs-formula-input`);
    if (formulaInput) {
      formulaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
          const key = sel.col + sel.row;
          const state = getGSheetState();
          const oldVal = state.cells[key] ? state.cells[key].raw : '';
          const newVal = formulaInput.value;
          if (!state.cells[key]) state.cells[key] = {};
          state.cells[key].raw = newVal;
          saveGSheetState(state, mode, key, oldVal, newVal);
          renderGSheet('emp');
          renderGSheet('admin');
          // Move down
          selectGSheetCell(mode, sel.col, Math.min(sel.row + 1, state.rows));
        }
      });
    }

    // Document title renaming
    const docTitle = document.getElementById(`${mode}-gs-doc-title`);
    if (docTitle) {
      docTitle.addEventListener('change', () => {
        const state = getGSheetState();
        state.title = docTitle.value || 'CarbonAxis Master Deals 2026';
        saveGSheetState(state, mode);
      });
    }

    // Star button
    const starBtn = document.getElementById(`${mode}-gs-star-btn`);
    if (starBtn) {
      starBtn.addEventListener('click', () => {
        const state = getGSheetState();
        state.starred = !state.starred;
        starBtn.classList.toggle('active', state.starred);
        saveGSheetState(state, mode);
      });
    }

    // Formatting Toolbar: Bold
    const boldBtn = document.getElementById(`${mode}-gs-bold-btn`);
    if (boldBtn) {
      boldBtn.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        state.cells[key].bold = !state.cells[key].bold;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Formatting Toolbar: Italic
    const italicBtn = document.getElementById(`${mode}-gs-italic-btn`);
    if (italicBtn) {
      italicBtn.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        state.cells[key].italic = !state.cells[key].italic;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Formatting Toolbar: Strikethrough
    const strikeBtn = document.getElementById(`${mode}-gs-strike-btn`);
    if (strikeBtn) {
      strikeBtn.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        state.cells[key].strike = !state.cells[key].strike;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Text Color
    const textColor = document.getElementById(`${mode}-gs-color-text`);
    if (textColor) {
      textColor.addEventListener('input', (e) => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        state.cells[key].color = e.target.value;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Fill Color
    const bgColor = document.getElementById(`${mode}-gs-color-bg`);
    if (bgColor) {
      bgColor.addEventListener('input', (e) => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        state.cells[key].bg = e.target.value;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Currency format ($)
    const fmtCurrency = document.getElementById(`${mode}-gs-fmt-currency`);
    if (fmtCurrency) {
      fmtCurrency.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        state.cells[key].fmt = 'currency';
        state.cells[key].align = 'right';
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Percent format (%)
    const fmtPercent = document.getElementById(`${mode}-gs-fmt-percent`);
    if (fmtPercent) {
      fmtPercent.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        state.cells[key].fmt = 'percent';
        state.cells[key].align = 'right';
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Alignments
    ['left', 'center', 'right'].forEach(align => {
      const btn = document.getElementById(`${mode}-gs-align-${align}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
          const key = sel.col + sel.row;
          const state = getGSheetState();
          if (!state.cells[key]) state.cells[key] = {};
          state.cells[key].align = align;
          saveGSheetState(state, mode);
          renderGSheet('emp');
          renderGSheet('admin');
        });
      }
    });

    // Font size +/-
    const fontPlus = document.getElementById(`${mode}-gs-font-up`);
    const fontMinus = document.getElementById(`${mode}-gs-font-down`);
    const fontSizeVal = document.getElementById(`${mode}-gs-font-size-val`);

    if (fontPlus) {
      fontPlus.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        const curSize = state.cells[key].size || 11;
        state.cells[key].size = curSize + 1;
        if (fontSizeVal) fontSizeVal.textContent = state.cells[key].size;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    if (fontMinus) {
      fontMinus.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        const curSize = state.cells[key].size || 11;
        state.cells[key].size = Math.max(9, curSize - 1);
        if (fontSizeVal) fontSizeVal.textContent = state.cells[key].size;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Formulas: SUM, AVG, COUNT
    const fnSum = document.getElementById(`${mode}-gs-fn-sum`);
    if (fnSum) {
      fnSum.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        const startRow = Math.max(2, sel.row - 5);
        const endRow = Math.max(2, sel.row - 1);
        const formula = `=SUM(${sel.col}${startRow}:${sel.col}${endRow})`;
        state.cells[key].raw = formula;
        state.cells[key].bold = true;
        state.cells[key].align = 'right';
        saveGSheetState(state, mode, key, '', formula);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    const fnAvg = document.getElementById(`${mode}-gs-fn-avg`);
    if (fnAvg) {
      fnAvg.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        const startRow = Math.max(2, sel.row - 5);
        const endRow = Math.max(2, sel.row - 1);
        const formula = `=AVERAGE(${sel.col}${startRow}:${sel.col}${endRow})`;
        state.cells[key].raw = formula;
        state.cells[key].align = 'right';
        saveGSheetState(state, mode, key, '', formula);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    const fnCount = document.getElementById(`${mode}-gs-fn-count`);
    if (fnCount) {
      fnCount.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (!state.cells[key]) state.cells[key] = {};
        const startRow = Math.max(2, sel.row - 5);
        const endRow = Math.max(2, sel.row - 1);
        const formula = `=COUNT(${sel.col}${startRow}:${sel.col}${endRow})`;
        state.cells[key].raw = formula;
        saveGSheetState(state, mode, key, '', formula);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Add Row button
    const addRowBtn = document.getElementById(`${mode}-gs-add-row-btn`);
    if (addRowBtn) {
      addRowBtn.addEventListener('click', () => {
        const state = getGSheetState();
        state.rows += 1;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
      });
    }

    // Clear Cell button
    const clearCellBtn = document.getElementById(`${mode}-gs-clear-cell-btn`);
    if (clearCellBtn) {
      clearCellBtn.addEventListener('click', () => {
        const sel = mode === 'emp' ? empSelectedCell : adminSelectedCell;
        const key = sel.col + sel.row;
        const state = getGSheetState();
        if (state.cells[key]) {
          const oldVal = state.cells[key].raw;
          state.cells[key].raw = '';
          saveGSheetState(state, mode, key, oldVal, '');
          renderGSheet('emp');
          renderGSheet('admin');
        }
      });
    }

    // Add 20 more rows at bottom
    const addMoreRowsBtn = document.getElementById(`${mode}-gs-add-more-rows`);
    if (addMoreRowsBtn) {
      addMoreRowsBtn.addEventListener('click', () => {
        const state = getGSheetState();
        state.rows += 20;
        saveGSheetState(state, mode);
        renderGSheet('emp');
        renderGSheet('admin');
        alert('Added 20 new rows to the spreadsheet grid.');
      });
    }

    // Print
    const printBtn = document.getElementById(`${mode}-gs-print-btn`);
    if (printBtn) {
      printBtn.addEventListener('click', () => window.print());
    }

    // Export CSV
    const exportBtn = document.getElementById(`${mode}-gs-export-btn`);
    if (exportBtn) {
      exportBtn.addEventListener('click', exportGSheetCSV);
    }

    // Google Drive Embed modal trigger
    const embedToggleBtn = document.getElementById(`${mode}-gs-embed-toggle-btn`);
    if (embedToggleBtn) {
      embedToggleBtn.addEventListener('click', openGSheetEmbedModal);
    }
  });

  // Export CSV Function
  function exportGSheetCSV() {
    const state = getGSheetState();
    const rows = [];

    for (let r = 1; r <= state.rows; r++) {
      const rowVals = [];
      let hasData = false;
      GS_COLS.forEach(col => {
        const key = col + r;
        const val = evalGSheetCell(key, state);
        if (val !== '' && val !== null && val !== undefined) hasData = true;
        rowVals.push(`"${String(val).replace(/"/g, '""')}"`);
      });
      if (hasData || r <= 10) {
        rows.push(rowVals.join(','));
      }
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${(state.title || 'CarbonAxis_Master_Deals').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ==================== 11. Google Sheets Multi-Document & File Menu Manager ====================
  let pendingImportFile = null;

  // Create new spreadsheet
  function createNewSpreadsheet(title, fromTemplate = false, mode = 'emp') {
    const curEmp = getCurrentEmployee();
    const newId = 'sheet_' + Date.now();
    const newTitle = title || (fromTemplate ? 'Carbon Deals Master ' + new Date().getFullYear() : 'Untitled spreadsheet');

    let cells = {};
    if (fromTemplate) {
      cells = JSON.parse(JSON.stringify(initDefaultGSheetState().cells));
    } else {
      // Standard column headers on Row 1
      const headerNames = [
        { col: 'A', val: 'Client / Organization', align: 'left' },
        { col: 'B', val: 'Contact / Email / Phone', align: 'left' },
        { col: 'C', val: 'Carbon Registry & Project', align: 'left' },
        { col: 'D', val: 'Volume (tCO2e)', align: 'right' },
        { col: 'E', val: 'Price ($/t)', align: 'right' },
        { col: 'F', val: 'Deal Value ($)', align: 'right' },
        { col: 'G', val: 'Deal Stage', align: 'center' },
        { col: 'H', val: 'Notes & ESG Terms', align: 'left' },
        { col: 'I', val: 'Assigned Broker', align: 'left' },
        { col: 'J', val: 'Vintage', align: 'center' },
        { col: 'K', val: 'Registry Status', align: 'center' },
        { col: 'L', val: 'Closing Date', align: 'center' },
        { col: 'M', val: 'Internal Ref', align: 'center' },
        { col: 'N', val: 'Broker Fee ($)', align: 'right' }
      ];
      headerNames.forEach(h => {
        cells[h.col + '1'] = {
          raw: h.val,
          bold: true,
          bg: '#f8fafd',
          color: '#1f1f1f',
          align: h.align
        };
      });
    }

    const newSheet = {
      id: newId,
      title: newTitle,
      starred: false,
      rows: GS_DEFAULT_ROWS,
      cells: cells,
      author: curEmp ? `${curEmp.name} (@${curEmp.username})` : 'Administrator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const store = getSheetsStore();
    store[newId] = newSheet;
    saveSheetsStore(store);
    localStorage.setItem(ACTIVE_SHEET_KEY, newId);

    // Close any open modals/menus
    closeAllGSheetMenus();
    const openModal = document.getElementById('gs-open-modal');
    if (openModal) openModal.classList.add('hidden');

    logEmployeeActivity({
      employee: curEmp || { name: 'Admin', username: 'admin', role: 'Administrator' },
      action_type: 'GSHEET_CREATE',
      action_label: 'New Spreadsheet Created',
      details: `Created new spreadsheet "${newTitle}" (ID: ${newId}).`
    });

    renderGSheet('emp');
    renderGSheet('admin');
  }

  // Duplicate spreadsheet
  function duplicateSpreadsheet(sheetId, mode = 'emp') {
    const store = getSheetsStore();
    const target = store[sheetId] || getGSheetState();
    if (!target) return;

    const curEmp = getCurrentEmployee();
    const newId = 'sheet_' + Date.now();
    const newTitle = 'Copy of ' + (target.title || 'Untitled spreadsheet');

    const cloned = JSON.parse(JSON.stringify(target));
    cloned.id = newId;
    cloned.title = newTitle;
    cloned.author = curEmp ? `${curEmp.name} (@${curEmp.username})` : 'Administrator';
    cloned.createdAt = new Date().toISOString();
    cloned.updatedAt = new Date().toISOString();

    store[newId] = cloned;
    saveSheetsStore(store);
    localStorage.setItem(ACTIVE_SHEET_KEY, newId);

    closeAllGSheetMenus();
    const openModal = document.getElementById('gs-open-modal');
    if (openModal) openModal.classList.add('hidden');

    renderGSheet('emp');
    renderGSheet('admin');
    alert(`Spreadsheet duplicated! Now viewing "${newTitle}".`);
  }

  // Delete spreadsheet
  function deleteSpreadsheet(sheetId, mode = 'emp') {
    const store = getSheetsStore();
    const keys = Object.keys(store);
    if (keys.length <= 1) {
      alert('Cannot delete the only remaining spreadsheet. Create a new sheet first.');
      return;
    }

    const sheet = store[sheetId];
    const sheetTitle = sheet ? sheet.title : 'this spreadsheet';
    if (!confirm(`Are you sure you want to move "${sheetTitle}" to bin?`)) {
      return;
    }

    delete store[sheetId];
    saveSheetsStore(store);

    const activeId = getActiveSheetId();
    if (activeId === sheetId) {
      const remainingId = Object.keys(store)[0];
      localStorage.setItem(ACTIVE_SHEET_KEY, remainingId);
    }

    closeAllGSheetMenus();
    renderExistingSheetsList();
    renderGSheet('emp');
    renderGSheet('admin');
  }

  // Open existing sheet
  function switchActiveSheet(sheetId) {
    const store = getSheetsStore();
    if (!store[sheetId]) return;

    localStorage.setItem(ACTIVE_SHEET_KEY, sheetId);
    closeAllGSheetMenus();
    const openModal = document.getElementById('gs-open-modal');
    if (openModal) openModal.classList.add('hidden');

    renderGSheet('emp');
    renderGSheet('admin');
  }

  // Open Dialog Modal
  function openExistingSheetsDialog(initialTab = 'recent') {
    closeAllGSheetMenus();
    const modal = document.getElementById('gs-open-modal');
    if (!modal) return;

    switchOpenModalTab(initialTab);
    renderExistingSheetsList();
    modal.classList.remove('hidden');
  }

  function switchOpenModalTab(tab) {
    const btnRecent = document.getElementById('gs-open-nav-recent');
    const btnUpload = document.getElementById('gs-open-nav-upload');
    const viewRecent = document.getElementById('gs-open-view-recent');
    const viewUpload = document.getElementById('gs-open-view-upload');

    if (tab === 'recent') {
      if (btnRecent) {
        btnRecent.classList.add('border-emerald-600', 'text-emerald-700', 'font-bold');
        btnRecent.classList.remove('border-transparent', 'text-slate-500');
      }
      if (btnUpload) {
        btnUpload.classList.remove('border-emerald-600', 'text-emerald-700', 'font-bold');
        btnUpload.classList.add('border-transparent', 'text-slate-500');
      }
      if (viewRecent) viewRecent.classList.remove('hidden');
      if (viewUpload) viewUpload.classList.add('hidden');
      renderExistingSheetsList();
    } else {
      if (btnUpload) {
        btnUpload.classList.add('border-emerald-600', 'text-emerald-700', 'font-bold');
        btnUpload.classList.remove('border-transparent', 'text-slate-500');
      }
      if (btnRecent) {
        btnRecent.classList.remove('border-emerald-600', 'text-emerald-700', 'font-bold');
        btnRecent.classList.add('border-transparent', 'text-slate-500');
      }
      if (viewUpload) viewUpload.classList.remove('hidden');
      if (viewRecent) viewRecent.classList.add('hidden');
    }
  }

  function renderExistingSheetsList(filterText = '') {
    const container = document.getElementById('gs-existing-sheets-container');
    const countBadge = document.getElementById('gs-open-sheets-count');
    if (!container) return;

    const store = getSheetsStore();
    const activeId = getActiveSheetId();
    const list = Object.values(store);

    if (countBadge) countBadge.textContent = list.length;

    const searchLower = (filterText || '').toLowerCase().trim();
    const filtered = list.filter(s => {
      if (!searchLower) return true;
      return (s.title || '').toLowerCase().includes(searchLower) ||
             (s.author || '').toLowerCase().includes(searchLower);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400 space-y-2">
          <i class="fa-solid fa-file-circle-question text-3xl text-slate-300"></i>
          <p class="text-xs">No spreadsheets matching "${escapeHtml(filterText)}".</p>
          <button onclick="window.empCreateNewSheet()" class="text-xs text-emerald-600 font-bold hover:underline">
            + Create a new spreadsheet
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(sheet => {
      const isActive = sheet.id === activeId;
      // Calculate deals count & total value
      let dealsCount = 0;
      let totalPipeline = 0;
      for (let r = 2; r <= (sheet.rows || 35); r++) {
        if (r === 7) continue;
        const cellA = sheet.cells ? sheet.cells['A' + r] : null;
        if (cellA && cellA.raw && String(cellA.raw).trim() !== '') {
          dealsCount++;
          const cellF = sheet.cells ? sheet.cells['F' + r] : null;
          if (cellF && cellF.raw) {
            const num = Number(String(cellF.raw).replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) totalPipeline += num;
          }
        }
      }

      const formattedDate = sheet.updatedAt ? new Date(sheet.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently';

      return `
        <div class="gs-open-dialog-sheet-card p-4 rounded-xl flex flex-col justify-between space-y-3 ${isActive ? 'active-sheet' : 'bg-white'}">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-start gap-2.5">
              <div class="w-8 h-8 rounded-lg ${isActive ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'} flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                <i class="fa-solid fa-file-excel"></i>
              </div>
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <h4 class="font-bold text-xs text-slate-900 line-clamp-1">${escapeHtml(sheet.title || 'Untitled spreadsheet')}</h4>
                  ${isActive ? '<span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">Active</span>' : ''}
                </div>
                <p class="text-[10px] text-slate-500">
                  <span>${escapeHtml(sheet.author || 'Staff')}</span> • <span class="font-mono">${formattedDate}</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button class="gs-card-copy-btn p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition text-xs" data-id="${sheet.id}" title="Make a copy">
                <i class="fa-regular fa-clone"></i>
              </button>
              <button class="gs-card-delete-btn p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs" data-id="${sheet.id}" title="Delete spreadsheet">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
            <div class="flex items-center gap-2 font-mono text-[10px] text-slate-500">
              <span><strong>${dealsCount}</strong> deals</span>
              <span>•</span>
              <span class="text-emerald-700 font-bold">$${totalPipeline.toLocaleString()}</span>
            </div>
            <button class="gs-card-open-btn px-3 py-1 text-xs font-bold ${isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-600 hover:bg-emerald-700 text-white'} rounded-lg transition flex items-center gap-1 shadow-sm" data-id="${sheet.id}">
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> ${isActive ? 'Currently Open' : 'Open Sheet'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach card event listeners
    container.querySelectorAll('.gs-card-open-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        switchActiveSheet(id);
      });
    });

    container.querySelectorAll('.gs-card-copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        duplicateSpreadsheet(id);
      });
    });

    container.querySelectorAll('.gs-card-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        deleteSpreadsheet(id);
      });
    });
  }

  // Robust CSV Parser
  function parseCSV(text) {
    const lines = [];
    let row = [];
    let inQuote = false;
    let curVal = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"') {
        if (inQuote && next === '"') {
          curVal += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (c === ',' && !inQuote) {
        row.push(curVal.trim());
        curVal = '';
      } else if ((c === '\r' || c === '\n') && !inQuote) {
        if (c === '\r' && next === '\n') i++;
        row.push(curVal.trim());
        if (row.some(val => val !== '')) lines.push(row);
        row = [];
        curVal = '';
      } else {
        curVal += c;
      }
    }
    if (curVal !== '' || row.length > 0) {
      row.push(curVal.trim());
      if (row.some(val => val !== '')) lines.push(row);
    }
    return lines;
  }

  // Import Spreadsheet File Engine
  function importSpreadsheetFile(file, destMode = 'new') {
    if (!file) {
      alert('Please select a file to import.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const parsedRows = parseCSV(text);

      if (parsedRows.length === 0) {
        alert('The uploaded file appears to be empty.');
        return;
      }

      const curEmp = getCurrentEmployee();
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');

      if (destMode === 'new') {
        // Create new spreadsheet
        const newId = 'sheet_' + Date.now();
        const newCells = {};

        parsedRows.forEach((rowArr, rIdx) => {
          const rowNum = rIdx + 1;
          rowArr.forEach((cellVal, cIdx) => {
            if (cIdx < GS_COLS.length) {
              const col = GS_COLS[cIdx];
              const isHeader = rowNum === 1;
              newCells[col + rowNum] = {
                raw: cellVal,
                bold: isHeader,
                bg: isHeader ? '#f8fafd' : '#ffffff',
                align: isHeader ? 'center' : (isNaN(Number(cellVal)) ? 'left' : 'right')
              };
            }
          });
        });

        const newSheet = {
          id: newId,
          title: fileNameWithoutExt,
          starred: false,
          rows: Math.max(GS_DEFAULT_ROWS, parsedRows.length + 5),
          cells: newCells,
          author: curEmp ? `${curEmp.name} (@${curEmp.username})` : 'Administrator',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const store = getSheetsStore();
        store[newId] = newSheet;
        saveSheetsStore(store);
        localStorage.setItem(ACTIVE_SHEET_KEY, newId);

        closeAllGSheetMenus();
        const openModal = document.getElementById('gs-open-modal');
        if (openModal) openModal.classList.add('hidden');

        renderGSheet('emp');
        renderGSheet('admin');
        alert(`Successfully imported "${file.name}" as a new spreadsheet with ${parsedRows.length} rows!`);
      } else if (destMode === 'replace') {
        // Replace current sheet cells
        const curSheet = getGSheetState();
        curSheet.cells = {};
        parsedRows.forEach((rowArr, rIdx) => {
          const rowNum = rIdx + 1;
          rowArr.forEach((cellVal, cIdx) => {
            if (cIdx < GS_COLS.length) {
              const col = GS_COLS[cIdx];
              const isHeader = rowNum === 1;
              curSheet.cells[col + rowNum] = {
                raw: cellVal,
                bold: isHeader,
                bg: isHeader ? '#f8fafd' : '#ffffff',
                align: isHeader ? 'center' : (isNaN(Number(cellVal)) ? 'left' : 'right')
              };
            }
          });
        });
        curSheet.rows = Math.max(curSheet.rows || 35, parsedRows.length + 5);
        saveGSheetState(curSheet);

        closeAllGSheetMenus();
        const openModal = document.getElementById('gs-open-modal');
        if (openModal) openModal.classList.add('hidden');

        renderGSheet('emp');
        renderGSheet('admin');
        alert(`Successfully replaced current sheet data with ${parsedRows.length} rows from "${file.name}"!`);
      } else if (destMode === 'append') {
        // Append rows
        const curSheet = getGSheetState();
        let lastRow = 1;
        Object.keys(curSheet.cells).forEach(k => {
          const m = k.match(/[0-9]+/);
          if (m) lastRow = Math.max(lastRow, parseInt(m[0], 10));
        });

        parsedRows.forEach((rowArr, rIdx) => {
          if (rIdx === 0 && rowArr[0] && (rowArr[0].toLowerCase().includes('client') || rowArr[0].toLowerCase().includes('name'))) {
            return;
          }
          lastRow++;
          rowArr.forEach((cellVal, cIdx) => {
            if (cIdx < GS_COLS.length) {
              const col = GS_COLS[cIdx];
              curSheet.cells[col + lastRow] = {
                raw: cellVal,
                align: isNaN(Number(cellVal)) ? 'left' : 'right'
              };
            }
          });
        });

        curSheet.rows = Math.max(curSheet.rows || 35, lastRow + 5);
        saveGSheetState(curSheet);

        closeAllGSheetMenus();
        const openModal = document.getElementById('gs-open-modal');
        if (openModal) openModal.classList.add('hidden');

        renderGSheet('emp');
        renderGSheet('admin');
        alert(`Successfully appended rows from "${file.name}"! Current row count: ${lastRow}.`);
      }
    };
    reader.readAsText(file);
  }

  // Export Excel (.xlsx compatible CSV with UTF-8 BOM)
  function exportGSheetXLSX() {
    const state = getGSheetState();
    const rows = [];

    for (let r = 1; r <= state.rows; r++) {
      const rowVals = [];
      let hasData = false;
      GS_COLS.forEach(col => {
        const key = col + r;
        const val = evalGSheetCell(key, state);
        if (val !== '' && val !== null && val !== undefined) hasData = true;
        rowVals.push(`"${String(val).replace(/"/g, '""')}"`);
      });
      if (hasData || r <= 15) {
        rows.push(rowVals.join(','));
      }
    }

    const bom = '\uFEFF';
    const csvContent = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(bom + rows.join('\r\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `${(state.title || 'CarbonAxis_Master_Deals').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Show Details Modal
  function showSheetDetailsModal() {
    closeAllGSheetMenus();
    const modal = document.getElementById('gs-details-modal');
    if (!modal) return;

    const state = getGSheetState();
    const nameEl = document.getElementById('gs-detail-name');
    const ownerEl = document.getElementById('gs-detail-owner');
    const modEl = document.getElementById('gs-detail-modified');
    const createdEl = document.getElementById('gs-detail-created');
    const dimEl = document.getElementById('gs-detail-dimensions');
    const pipeEl = document.getElementById('gs-detail-pipeline');

    if (nameEl) nameEl.textContent = state.title || 'Untitled spreadsheet';
    if (ownerEl) ownerEl.textContent = state.author || 'Staff Broker';
    if (modEl) modEl.textContent = state.updatedAt ? new Date(state.updatedAt).toLocaleString() : 'Just now';
    if (createdEl) createdEl.textContent = state.createdAt ? new Date(state.createdAt).toLocaleDateString() : '2026-10-31';
    if (dimEl) dimEl.textContent = `${GS_COLS.length} Columns × ${state.rows || 35} Rows`;

    // Calculate pipeline
    let totalPipeline = 0;
    for (let r = 2; r <= (state.rows || 35); r++) {
      if (r === 7) continue;
      const fVal = evalGSheetCell('F' + r, state);
      const num = typeof fVal === 'number' ? fVal : Number(String(fVal).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) totalPipeline += num;
    }
    if (pipeEl) pipeEl.textContent = '$' + totalPipeline.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    modal.classList.remove('hidden');
  }

  function closeAllGSheetMenus() {
    const empDropdown = document.getElementById('emp-gs-file-dropdown');
    const adminDropdown = document.getElementById('admin-gs-file-dropdown');
    if (empDropdown) empDropdown.classList.add('hidden');
    if (adminDropdown) adminDropdown.classList.add('hidden');
  }

  // Setup File Menu Dropdowns & Action Handlers
  ['emp', 'admin'].forEach(mode => {
    const fileMenuBtn = document.getElementById(`${mode}-gs-menu-file`);
    const fileDropdown = document.getElementById(`${mode}-gs-file-dropdown`);

    if (fileMenuBtn && fileDropdown) {
      fileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isClosed = fileDropdown.classList.contains('hidden');
        closeAllGSheetMenus();
        if (isClosed) fileDropdown.classList.remove('hidden');
      });
    }

    // New Spreadsheet
    const newSheetBtn = document.getElementById(`${mode}-file-new-sheet`);
    if (newSheetBtn) {
      newSheetBtn.addEventListener('click', () => {
        const title = prompt('Enter title for new spreadsheet:', 'Untitled spreadsheet');
        if (title !== null) {
          createNewSpreadsheet(title, false, mode);
        }
      });
    }

    // New from Template
    const newTemplateBtn = document.getElementById(`${mode}-file-new-template`);
    if (newTemplateBtn) {
      newTemplateBtn.addEventListener('click', () => {
        const title = prompt('Enter title for template spreadsheet:', 'Carbon Deals ' + new Date().getFullYear());
        if (title !== null) {
          createNewSpreadsheet(title, true, mode);
        }
      });
    }

    // Open Existing Sheets
    const openBtn = document.getElementById(`${mode}-file-open-btn`);
    if (openBtn) {
      openBtn.addEventListener('click', () => openExistingSheetsDialog('recent'));
    }

    // Import File
    const importBtn = document.getElementById(`${mode}-file-import-btn`);
    if (importBtn) {
      importBtn.addEventListener('click', () => openExistingSheetsDialog('upload'));
    }

    // Make a copy
    const copyBtn = document.getElementById(`${mode}-file-copy-btn`);
    if (copyBtn) {
      copyBtn.addEventListener('click', () => duplicateSpreadsheet(getActiveSheetId(), mode));
    }

    // Share Team
    const shareTeamBtn = document.getElementById(`${mode}-file-share-team`);
    if (shareTeamBtn) {
      shareTeamBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        alert('Spreadsheet is currently shared with all 10 authorized staff brokers and administrator in real time.');
      });
    }

    // Share Link
    const shareLinkBtn = document.getElementById(`${mode}-file-share-link`);
    if (shareLinkBtn) {
      shareLinkBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        navigator.clipboard?.writeText(window.location.href);
        alert('Spreadsheet direct workspace link copied to clipboard!');
      });
    }

    // Download CSV
    const dlCsvBtn = document.getElementById(`${mode}-file-dl-csv`);
    if (dlCsvBtn) {
      dlCsvBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        exportGSheetCSV();
      });
    }

    // Download XLSX
    const dlXlsxBtn = document.getElementById(`${mode}-file-dl-xlsx`);
    if (dlXlsxBtn) {
      dlXlsxBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        exportGSheetXLSX();
      });
    }

    // Download PDF
    const dlPdfBtn = document.getElementById(`${mode}-file-dl-pdf`);
    if (dlPdfBtn) {
      dlPdfBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        window.print();
      });
    }

    // Rename
    const renameBtn = document.getElementById(`${mode}-file-rename-btn`);
    if (renameBtn) {
      renameBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        const docTitle = document.getElementById(`${mode}-gs-doc-title`);
        if (docTitle) {
          docTitle.focus();
          docTitle.select();
        }
      });
    }

    // Move to bin / Delete
    const deleteBtn = document.getElementById(`${mode}-file-delete-btn`);
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => deleteSpreadsheet(getActiveSheetId(), mode));
    }

    // Details
    const detailsBtn = document.getElementById(`${mode}-file-details-btn`);
    if (detailsBtn) {
      detailsBtn.addEventListener('click', showSheetDetailsModal);
    }

    // Settings
    const settingsBtn = document.getElementById(`${mode}-file-settings-btn`);
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        alert('Spreadsheet Settings:\nLocale: United States (USD)\nCalculation: On change\nTimezone: UTC');
      });
    }

    // Print
    const printMenuBtn = document.getElementById(`${mode}-file-print-btn`);
    if (printMenuBtn) {
      printMenuBtn.addEventListener('click', () => {
        closeAllGSheetMenus();
        window.print();
      });
    }
  });

  // Global click outside to close menus
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.gs-menu-wrapper')) {
      closeAllGSheetMenus();
    }
  });

  // Open Modal Tab switching & search filter
  const openTabRecent = document.getElementById('gs-open-nav-recent');
  const openTabUpload = document.getElementById('gs-open-nav-upload');
  const openSearchInput = document.getElementById('gs-open-search-input');
  const openCreateNewBtn = document.getElementById('gs-open-create-new-btn');
  const closeOpenModal = document.getElementById('close-gs-open-modal');
  const cancelOpenModal = document.getElementById('gs-open-modal-cancel');

  if (openTabRecent) openTabRecent.addEventListener('click', () => switchOpenModalTab('recent'));
  if (openTabUpload) openTabUpload.addEventListener('click', () => switchOpenModalTab('upload'));
  if (openSearchInput) {
    openSearchInput.addEventListener('input', (e) => renderExistingSheetsList(e.target.value));
  }
  if (openCreateNewBtn) {
    openCreateNewBtn.addEventListener('click', () => {
      const title = prompt('Enter title for new spreadsheet:', 'Untitled spreadsheet');
      if (title !== null) {
        createNewSpreadsheet(title, false);
      }
    });
  }
  if (closeOpenModal) {
    closeOpenModal.addEventListener('click', () => {
      const m = document.getElementById('gs-open-modal');
      if (m) m.classList.add('hidden');
    });
  }
  if (cancelOpenModal) {
    cancelOpenModal.addEventListener('click', () => {
      const m = document.getElementById('gs-open-modal');
      if (m) m.classList.add('hidden');
    });
  }

  // Upload / Import Drag and Drop Handling
  const dropzone = document.getElementById('gs-dropzone');
  const fileImportInput = document.getElementById('gs-file-import-input');
  const browseFileBtn = document.getElementById('gs-browse-file-btn');
  const selectedBadge = document.getElementById('gs-selected-file-badge');
  const selectedName = document.getElementById('gs-selected-file-name');
  const selectedSize = document.getElementById('gs-selected-file-size');
  const removeSelectedFile = document.getElementById('gs-remove-selected-file');
  const confirmImportBtn = document.getElementById('gs-confirm-import-btn');

  if (browseFileBtn && fileImportInput) {
    browseFileBtn.addEventListener('click', () => fileImportInput.click());
  }

  if (dropzone && fileImportInput) {
    dropzone.addEventListener('click', (e) => {
      if (e.target !== browseFileBtn) fileImportInput.click();
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    });
  }

  if (fileImportInput) {
    fileImportInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFileSelection(e.target.files[0]);
      }
    });
  }

  function handleFileSelection(file) {
    pendingImportFile = file;
    if (selectedBadge) selectedBadge.classList.remove('hidden');
    if (selectedName) selectedName.textContent = file.name;
    if (selectedSize) selectedSize.textContent = `${(file.size / 1024).toFixed(1)} KB`;
  }

  if (removeSelectedFile) {
    removeSelectedFile.addEventListener('click', () => {
      pendingImportFile = null;
      if (fileImportInput) fileImportInput.value = '';
      if (selectedBadge) selectedBadge.classList.add('hidden');
    });
  }

  if (confirmImportBtn) {
    confirmImportBtn.addEventListener('click', () => {
      if (!pendingImportFile) {
        alert('Please select or drop a CSV / Excel file to import.');
        return;
      }
      const destRadios = document.getElementsByName('gs-import-dest');
      let destMode = 'new';
      destRadios.forEach(r => {
        if (r.checked) destMode = r.value;
      });
      importSpreadsheetFile(pendingImportFile, destMode);
      pendingImportFile = null;
      if (fileImportInput) fileImportInput.value = '';
      if (selectedBadge) selectedBadge.classList.add('hidden');
    });
  }

  // Details Modal close handlers
  const closeDetailsModal = document.getElementById('close-gs-details-modal');
  const closeDetailsModalBtn = document.getElementById('close-gs-details-modal-btn');
  if (closeDetailsModal) {
    closeDetailsModal.addEventListener('click', () => {
      const m = document.getElementById('gs-details-modal');
      if (m) m.classList.add('hidden');
    });
  }
  if (closeDetailsModalBtn) {
    closeDetailsModalBtn.addEventListener('click', () => {
      const m = document.getElementById('gs-details-modal');
      if (m) m.classList.add('hidden');
    });
  }

  // Keyboard shortcut Ctrl+O / Cmd+O to open file dialog
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
      const isEmpVisible = empTabSheetView && !empTabSheetView.classList.contains('hidden') && viewEmployee && !viewEmployee.classList.contains('hidden');
      const isAdminVisible = tabSheetView && !tabSheetView.classList.contains('hidden') && adminDashboardView && !adminDashboardView.classList.contains('hidden');
      if (isEmpVisible || isAdminVisible) {
        e.preventDefault();
        openExistingSheetsDialog('recent');
      }
    }
  });

  window.empCreateNewSheet = () => createNewSpreadsheet('Untitled spreadsheet', false);

  // Google Drive Modal Functions
  const gsheetEmbedModal = document.getElementById('gsheet-embed-modal');
  const closeGSheetEmbedModal = document.getElementById('close-gsheet-embed-modal');
  const gsheetEmbedInput = document.getElementById('gsheet-embed-url-input');
  const gsheetEmbedSaveBtn = document.getElementById('gsheet-embed-save-btn');
  const gsheetEmbedResetBtn = document.getElementById('gsheet-embed-reset-btn');

  function openGSheetEmbedModal() {
    if (gsheetEmbedModal) {
      const savedUrl = localStorage.getItem('carbonaxis_gsheet_embed_url') || '';
      if (gsheetEmbedInput) gsheetEmbedInput.value = savedUrl;
      gsheetEmbedModal.classList.remove('hidden');
    }
  }

  if (closeGSheetEmbedModal && gsheetEmbedModal) {
    closeGSheetEmbedModal.addEventListener('click', () => {
      gsheetEmbedModal.classList.add('hidden');
    });
  }

  if (gsheetEmbedSaveBtn) {
    gsheetEmbedSaveBtn.addEventListener('click', () => {
      const url = (gsheetEmbedInput?.value || '').trim();
      if (!url) {
        alert('Please enter a valid Google Sheets URL.');
        return;
      }
      localStorage.setItem('carbonaxis_gsheet_embed_url', url);
      applyGoogleDriveEmbed(url);
      if (gsheetEmbedModal) gsheetEmbedModal.classList.add('hidden');
      alert('Google Drive Sheet successfully connected! Viewport updated.');
    });
  }

  if (gsheetEmbedResetBtn) {
    gsheetEmbedResetBtn.addEventListener('click', () => {
      localStorage.removeItem('carbonaxis_gsheet_embed_url');
      if (gsheetEmbedModal) gsheetEmbedModal.classList.add('hidden');
      renderGSheet('emp');
      renderGSheet('admin');
      alert('Switched back to Native Google Sheets Editor.');
    });
  }

  function applyGoogleDriveEmbed(url) {
    let embedUrl = url;
    if (embedUrl.includes('/edit')) {
      embedUrl = embedUrl.replace('/edit.*', '/preview');
    }
    const empViewport = document.getElementById('emp-gs-viewport');
    const adminViewport = document.getElementById('admin-gs-viewport');

    const iframeHtml = `
      <div class="w-full h-[520px] bg-slate-50 flex flex-col">
        <div class="p-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span class="font-bold flex items-center gap-1.5"><i class="fa-brands fa-google-drive text-blue-600"></i> Embedded Live Google Workspace Sheet</span>
          <a href="${escapeHtml(url)}" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1">Open in Google Sheets <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a>
        </div>
        <iframe src="${escapeHtml(embedUrl)}" class="w-full flex-1 border-0" allowfullscreen></iframe>
      </div>
    `;

    if (empViewport) empViewport.innerHTML = iframeHtml;
    if (adminViewport) adminViewport.innerHTML = iframeHtml;
  }

  // Global render functions
  window.renderEmployeeSpreadsheet = function() {
    const embedUrl = localStorage.getItem('carbonaxis_gsheet_embed_url');
    if (embedUrl) {
      applyGoogleDriveEmbed(embedUrl);
    } else {
      renderGSheet('emp');
    }
  };

  window.renderAdminSpreadsheet = function() {
    const embedUrl = localStorage.getItem('carbonaxis_gsheet_embed_url');
    if (embedUrl) {
      applyGoogleDriveEmbed(embedUrl);
    } else {
      renderGSheet('admin');
    }
  };

  function renderEmployeeSpreadsheet() {
    window.renderEmployeeSpreadsheet();
  }

  function renderAdminSpreadsheet() {
    window.renderAdminSpreadsheet();
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
