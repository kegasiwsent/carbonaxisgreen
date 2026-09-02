// Interactive Scripts for CarbonAxis Full-Scale Web Application

document.addEventListener('DOMContentLoaded', () => {
  
  // ==================== 1. View Switching & Sticky Header Nav ====================
  const views = {
    home: document.getElementById('view-home'),
    about: document.getElementById('view-about'),
    projects: document.getElementById('view-projects'),
    marketplace: document.getElementById('view-marketplace'),
    transparency: document.getElementById('view-transparency')
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
      views[key].classList.add('hidden');
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
      projectItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
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
      <p class="text-sm text-slate-500 mb-4">Have questions about carbon registries, compliance audits, or partnership integration? Send us a message.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
          <input type="text" placeholder="e.g. Sarah Jenkins" class="w-full text-sm p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none" required />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
          <input type="email" placeholder="e.g. sarah@company.com" class="w-full text-sm p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none" required />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Inquiry Type</label>
          <select class="w-full text-sm p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none">
            <option>General Information</option>
            <option>Registry Integrity & ICVCM</option>
            <option>Offset Lot Procurement</option>
            <option>Technical API Integration</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Message</label>
          <textarea rows="3" placeholder="Tell us how we can help..." class="w-full text-sm p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none" required></textarea>
        </div>
      </div>
    `;

    modalForm.onsubmit = (e) => {
      e.preventDefault();
      alert('Thank you for contacting us! Your inquiry has been successfully submitted. A CarbonAxis representative will follow up via email shortly.');
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
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Carbon Lot Asset</label>
          <input type="text" value="${project}" class="w-full text-sm p-2 border border-slate-200 rounded bg-slate-50 focus:outline-none font-medium" readonly />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Limit Price ($/t)</label>
            <input type="number" step="0.01" value="${price}" id="trade-limit-price" class="w-full text-sm p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none font-bold" />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Order Volume (Tons)</label>
            <input type="number" min="1" value="100" id="trade-volume" class="w-full text-sm p-2 border border-slate-200 rounded focus:border-green-500 focus:outline-none font-bold" />
          </div>
        </div>

        <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-sm">
          <span class="text-slate-600 font-semibold">Total Clearing Value:</span>
          <span id="trade-order-total" class="font-extrabold ${isBuy ? 'text-green-600' : 'text-red-600'} text-lg">$${(price * 100).toFixed(2)}</span>
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

    modalForm.onsubmit = (e) => {
      e.preventDefault();
      const p = parseFloat(priceInput.value) || 0;
      const v = parseFloat(volInput.value) || 0;
      alert(`Trade Order Executed Successfully!\nCleared through CarbonAxis Registry Protocol.\n\nType: ${isBuy ? 'BUY' : 'SELL'}\nAsset: ${project}\nVolume: ${v} Tons @ $${p.toFixed(2)}/t\nClearing Value: $${(p * v).toFixed(2)}`);
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
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = inquiryForm.querySelector('input[type="email"]');
      const questionInput = inquiryForm.querySelector('input[type="text"]');
      
      if (emailInput && emailInput.value) {
        alert(`Inquiry received from ${emailInput.value}!\nWe will follow up shortly.`);
        emailInput.value = '';
        if (questionInput) questionInput.value = '';
      }
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
      
      // Mock matches
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
    bottomContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for reaching out! Your message has been received by the CarbonAxis trading desk. A specialist will follow up shortly.');
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
});
