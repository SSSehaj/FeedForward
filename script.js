document.addEventListener('DOMContentLoaded', () => {
  // ─── Auth State ───
  let currentRole = localStorage.getItem('ff_role') || null; // 'restaurant' | 'ngo' | null
  let currentName = localStorage.getItem('ff_userName') || '';
  let selectedLoginRole = 'restaurant';
  let selectedUrgency = 'critical';

  // ─── Update Nav Based on Auth ───
  function updateNav() {
    const desktopAuth = document.getElementById('nav-auth-area');
    const mobileAuth = document.getElementById('mobile-auth-area');
    if (!desktopAuth) return;

    let extraLinks = '';
    if (currentRole === 'restaurant') {
      extraLinks = '<a href="restaurant-dashboard.html" style="color:hsla(40,33%,96%,.8);transition:color .2s;font-weight:500;font-size:.875rem;">NGO Needs</a>';
    } else if (currentRole === 'ngo') {
      extraLinks = '<a href="ngo-dashboard.html" style="color:hsla(40,33%,96%,.8);transition:color .2s;font-weight:500;font-size:.875rem;">NGO Dashboard</a>';
    }

    if (currentRole) {
      const roleLabel = currentRole === 'restaurant' ? 'Restaurant' : 'NGO';
      desktopAuth.innerHTML = extraLinks + '<span class="nav-user-info"><span>👤 ' + currentName + ' (' + roleLabel + ')</span><button class="btn-logout" onclick="doLogout()">Logout</button></span>';
      if (mobileAuth) mobileAuth.innerHTML = extraLinks + '<button class="btn-logout" onclick="doLogout()">Logout (' + currentName + ')</button>';
    } else {
      desktopAuth.innerHTML = extraLinks + '<button class="btn-login" onclick="openLoginModal()">Login</button>';
      if (mobileAuth) mobileAuth.innerHTML = extraLinks + '<button class="btn-login" onclick="openLoginModal()">Login</button>';
    }
  }

  updateNav();

  // ─── Login Modal ───
  window.openLoginModal = function() {
    document.getElementById('login-modal').classList.remove('hidden');
  };
  window.closeLoginModal = function() {
    document.getElementById('login-modal').classList.add('hidden');
  };
  window.setLoginRole = function(role) {
    selectedLoginRole = role;
    document.getElementById('role-restaurant').classList.toggle('active', role === 'restaurant');
    document.getElementById('role-ngo').classList.toggle('active', role === 'ngo');
    const nameInput = document.getElementById('login-name');
    nameInput.placeholder = role === 'restaurant' ? 'e.g. The Green Table' : 'e.g. Hope Community Shelter';
    document.querySelector('.modal-submit').textContent = 'Login as ' + (role === 'restaurant' ? 'Restaurant' : 'NGO');
  };
  window.doLogin = function() {
    const name = document.getElementById('login-name').value.trim();
    if (!name) return;
    currentRole = selectedLoginRole;
    currentName = name;
    localStorage.setItem('ff_role', currentRole);
    localStorage.setItem('ff_userName', currentName);
    closeLoginModal();
    updateNav();
    // Redirect NGOs to dashboard
    if (currentRole === 'ngo') {
      window.location.href = 'ngo-dashboard.html';
    } else {
      // Refresh current page to update donate area etc.
      renderDonateArea();
    }
  };
  window.doLogout = function() {
    currentRole = null;
    currentName = '';
    localStorage.removeItem('ff_role');
    localStorage.removeItem('ff_userName');
    updateNav();
    renderDonateArea();
    // If on a dashboard page, redirect home
    if (window.location.pathname.includes('ngo-dashboard') || window.location.pathname.includes('restaurant-dashboard')) {
      window.location.href = 'index.html';
    }
  };

  // ─── Mobile Menu Toggle ───
  const toggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      toggle.innerHTML = isOpen
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // ─── Donate Area (index.html) ───
  function renderDonateArea() {
    const area = document.getElementById('donate-area');
    if (!area) return;
    if (!currentRole) {
      area.innerHTML = '<div class="login-prompt"><p>Please login as a Restaurant to donate food.</p><p style="font-size:.875rem;">Click the <strong>Login</strong> button in the navigation bar above.</p></div>';
    } else if (currentRole === 'ngo') {
      area.innerHTML = '<div class="login-prompt"><p>You are logged in as an NGO.</p><a href="ngo-dashboard.html" class="btn-green" style="margin-top:1rem;display:inline-flex;">Go to NGO Dashboard</a></div>';
    } else {
      area.innerHTML = `
        <form id="donation-form" class="donate-form">
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0;"><label>Restaurant Name</label><input type="text" value="${currentName}" disabled /></div>
            <div class="form-group" style="margin-bottom:0;"><label>Contact Email</label><input type="email" id="donor-email" required placeholder="email@restaurant.com" /></div>
          </div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom:0;"><label>Food Type</label><select id="donor-food-type" required><option value="">Select type</option><option value="Prepared Meals">Prepared Meals</option><option value="Raw Ingredients">Raw Ingredients</option><option value="Baked Goods">Baked Goods</option><option value="Mixed Items">Mixed Items</option></select></div>
            <div class="form-group" style="margin-bottom:0;"><label>Estimated Servings</label><input type="number" id="donor-servings" required min="1" placeholder="e.g. 50" /></div>
          </div>
          <div class="form-group"><label>Additional Notes</label><textarea rows="3" placeholder="Dietary info, pickup time preferences..."></textarea></div>
          <button type="submit" class="form-submit">Submit Donation</button>
        </form>`;
      // Bind form
      document.getElementById('donation-form').addEventListener('submit', handleDonation);
    }
  }
  renderDonateArea();

  // ─── Donation Form Handler ───
  function handleDonation(e) {
    e.preventDefault();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    const len = Math.floor(Math.random() * 3) + 6;
    for (let i = 0; i < len; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    const trackingId = 'FF-' + code;

    const foodType = document.getElementById('donor-food-type').value;
    const servings = document.getElementById('donor-servings').value;

    const donationData = {
      restaurant: currentName,
      type: foodType,
      servings: servings,
      status: 'listed',
      timestamp: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('feedforward_donations') || '{}');
    existing[trackingId] = donationData;
    localStorage.setItem('feedforward_donations', JSON.stringify(existing));
    alert('Thank you for your donation!\n\nYour Tracking Code is: ' + trackingId + '\n\nPlease save this code to track your consignment on the Track Food page.');
    e.target.reset();
  }

  // ─── Tracking Page ───
  const trackForm = document.getElementById('tracking-form');
  const trackResult = document.getElementById('tracking-result');
  if (trackForm && trackResult) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let inputVal = document.getElementById('tracking-input').value.trim().toUpperCase();
      if (!inputVal.startsWith('FF-') && inputVal !== '') inputVal = 'FF-' + inputVal;

      const donations = JSON.parse(localStorage.getItem('feedforward_donations') || '{}');
      const donation = donations[inputVal];

      if (donation) {
        document.getElementById('display-track-id').textContent = '#' + inputVal;
        const status = donation.status || 'listed';
        document.getElementById('display-status').textContent = status.replace(/_/g, ' ');
        document.getElementById('track-restaurant').textContent = donation.restaurant;
        document.getElementById('track-ngo').textContent = donation.ngoName || 'Pending NGO Match';
        document.getElementById('track-food-details').textContent = donation.type + ' (' + donation.servings + ' Servings)';
        document.getElementById('track-confirmed').textContent = donation.ngoConfirmedAt ? '✅ ' + new Date(donation.ngoConfirmedAt).toLocaleString() : 'Awaiting confirmation';

        // Update timeline
        const stepOrder = ['listed', 'ngo_accepted', 'out_for_pickup', 'delivered'];
        const currentIndex = stepOrder.indexOf(status);
        const steps = document.querySelectorAll('.timeline-step');
        steps.forEach((step, i) => {
          step.className = 'timeline-step';
          if (i < currentIndex) step.classList.add('completed');
          else if (i === currentIndex) step.classList.add('active');
        });

        trackResult.classList.remove('show');
        setTimeout(() => { trackResult.classList.add('show'); showToast('Consignment located!'); }, 200);
      } else {
        alert('Tracking ID not found. Please verify your code and try again.');
        trackResult.classList.remove('show');
      }
    });
  }

  // ─── NGO Dashboard ───
  const consignmentList = document.getElementById('consignment-list');
  if (consignmentList && window.location.pathname.includes('ngo-dashboard')) {
    // Redirect if not NGO
    if (currentRole !== 'ngo') { window.location.href = 'index.html'; return; }

    const welcomeEl = document.getElementById('ngo-welcome');
    if (welcomeEl) welcomeEl.textContent = 'Welcome, ' + currentName + '. View available food donations and post urgent needs.';

    renderConsignments();
  }

  function renderConsignments() {
    const list = document.getElementById('consignment-list');
    if (!list) return;
    const donations = JSON.parse(localStorage.getItem('feedforward_donations') || '{}');
    const entries = Object.entries(donations).reverse();

    if (entries.length === 0) {
      list.innerHTML = '<div class="empty-state"><p>No donations available yet. Check back soon!</p></div>';
      return;
    }

    list.innerHTML = entries.map(([id, d]) => {
      const isAccepted = d.status === 'ngo_accepted';
      const badge = isAccepted
        ? '<span class="status-badge accepted">✓ Accepted</span>'
        : '<span class="status-badge pending">⏳ Pending</span>';
      const confirmBtn = (!d.status || d.status === 'listed')
        ? '<button class="btn-confirm" onclick="confirmDelivery(\'' + id + '\')">Confirm Delivery</button>'
        : '';
      const confirmedLine = d.ngoConfirmedAt
        ? '<p class="consignment-confirmed">Confirmed by ' + d.ngoName + ' at ' + new Date(d.ngoConfirmedAt).toLocaleString() + '</p>'
        : '';
      return '<div class="consignment-card"><div class="consignment-info"><div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.25rem;"><span class="consignment-id">#' + id + '</span>' + badge + '</div><p class="consignment-meta">' + d.restaurant + '</p><p class="consignment-detail">' + d.type + ' · ' + d.servings + ' servings</p>' + confirmedLine + '</div>' + confirmBtn + '</div>';
    }).join('');
  }

  window.confirmDelivery = function(id) {
    const donations = JSON.parse(localStorage.getItem('feedforward_donations') || '{}');
    if (donations[id]) {
      donations[id].status = 'ngo_accepted';
      donations[id].ngoName = currentName;
      donations[id].ngoConfirmedAt = new Date().toISOString();
      localStorage.setItem('feedforward_donations', JSON.stringify(donations));
      renderConsignments();
      showToast('Delivery confirmed for ' + id + '!');
    }
  };

  // ─── Urgency Form (NGO Dashboard) ───
  window.setUrgency = function(level) {
    selectedUrgency = level;
    document.querySelectorAll('.urgency-btn').forEach(btn => {
      btn.className = 'urgency-btn';
      if (btn.dataset.level === level) {
        btn.classList.add('active-' + level);
      }
    });
  };

  const urgencyForm = document.getElementById('urgency-form');
  if (urgencyForm) {
    urgencyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const needs = JSON.parse(localStorage.getItem('feedforward_ngo_needs') || '[]');
      needs.push({
        ngoName: currentName,
        foodType: document.getElementById('urgency-food-type').value,
        servings: document.getElementById('urgency-servings').value,
        notes: document.getElementById('urgency-notes').value,
        urgency: selectedUrgency,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('feedforward_ngo_needs', JSON.stringify(needs));
      alert('Urgent food need posted successfully! Restaurants will be notified.');
      urgencyForm.reset();
      selectedUrgency = 'critical';
      setUrgency('critical');
    });
  }

  // ─── Restaurant Dashboard (Needs List) ───
  const needsList = document.getElementById('needs-list');
  if (needsList && window.location.pathname.includes('restaurant-dashboard')) {
    if (currentRole !== 'restaurant') { window.location.href = 'index.html'; return; }

    const needs = JSON.parse(localStorage.getItem('feedforward_ngo_needs') || '[]').reverse();
    if (needs.length === 0) {
      needsList.innerHTML = '<div class="empty-state"><svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg><p>No urgent needs posted yet. Check back later!</p></div>';
    } else {
      needsList.innerHTML = needs.map(n => {
        const badgeClass = n.urgency === 'critical' ? 'critical' : n.urgency === 'high' ? 'high' : 'medium';
        const badgeText = n.urgency === 'critical' ? '🔴 Critical' : n.urgency === 'high' ? '🟠 High' : '🟢 Medium';
        const timeAgo = getTimeAgo(n.timestamp);
        return '<div class="need-card"><div class="need-info"><div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.25rem;flex-wrap:wrap;"><span class="need-ngo">' + n.ngoName + '</span><span class="urgency-badge ' + badgeClass + '">' + badgeText + '</span></div><p class="need-detail">' + n.foodType + ' · ' + n.servings + ' servings needed</p>' + (n.notes ? '<p class="need-notes">' + n.notes + '</p>' : '') + '</div><div class="need-time">🕐 ' + timeAgo + '</div></div>';
      }).join('');
    }
  }

  function getTimeAgo(ts) {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  // ─── Scroll Reveal ───
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('section > .container > div, .step-card, .value-card, .blog-card, .restaurant-card').forEach(el => {
    el.classList.add('fade-up');
    observer.observe(el);
  });
});

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}
