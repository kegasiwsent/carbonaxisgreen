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
    admin: document.getElementById('view-admin')
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
  }

  // Hook nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = link.getAttribute('data-view');
      switchView(targetView);
    });
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

  const tabInquiriesView = document.getElementById('admin-tab-inquiries');
  const tabTradesView = document.getElementById('admin-tab-trades');

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
    [tabInquiriesBtn, tabTradesBtn].forEach(b => {
      if (b) {
        b.classList.remove('border-green-600', 'text-green-600', 'active');
        b.classList.add('border-transparent', 'text-slate-500');
      }
    });

    [tabInquiriesView, tabTradesView].forEach(v => {
      if (v) v.classList.add('hidden');
    });

    if (tabName === 'inquiries') {
      tabInquiriesBtn.classList.add('border-green-600', 'text-green-600', 'active');
      tabInquiriesBtn.classList.remove('border-transparent', 'text-slate-500');
      tabInquiriesView.classList.remove('hidden');
    } else if (tabName === 'trades') {
      tabTradesBtn.classList.add('border-green-600', 'text-green-600', 'active');
      tabTradesBtn.classList.remove('border-transparent', 'text-slate-500');
      tabTradesView.classList.remove('hidden');
    }
  }

  if (tabInquiriesBtn) tabInquiriesBtn.addEventListener('click', () => switchAdminTab('inquiries'));
  if (tabTradesBtn) tabTradesBtn.addEventListener('click', () => switchAdminTab('trades'));

  async function loadAdminDashboardData() {
    currentInquiries = await fetchInquiries();
    currentTrades = await fetchTrades();

    // Update KPI counts
    const totalInquiriesEl = document.getElementById('stat-total-inquiries');
    const newInquiriesEl = document.getElementById('stat-new-inquiries');
    const totalTradesEl = document.getElementById('stat-total-trades');
    const tabInqCountEl = document.getElementById('tab-inquiries-count');
    const tabTrCountEl = document.getElementById('tab-trades-count');

    const newCount = currentInquiries.filter(i => (i.status || 'New') === 'New').length;

    if (totalInquiriesEl) totalInquiriesEl.textContent = currentInquiries.length;
    if (newInquiriesEl) newInquiriesEl.textContent = newCount;
    if (totalTradesEl) totalTradesEl.textContent = currentTrades.length;
    if (tabInqCountEl) tabInqCountEl.textContent = currentInquiries.length;
    if (tabTrCountEl) tabTrCountEl.textContent = currentTrades.length;

    renderInquiriesTable();
    renderTradesTable();
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

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
