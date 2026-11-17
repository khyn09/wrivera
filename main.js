(() => {
  const data = window.ARCHIVE_CONTENT;
  if (!data) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const makeNode = (tag, className = '', text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  };
  const appendList = (parent, heading, items = []) => {
    if (!items.length) return;
    parent.append(makeNode('h3', '', heading));
    const list = makeNode('ul');
    items.forEach((item) => list.append(makeNode('li', '', item)));
    parent.append(list);
  };
  const appendTags = (parent, items = []) => {
    if (!items.length) return;
    const list = makeNode('div', 'tag-list');
    items.forEach((item) => list.append(makeNode('span', 'tag', item)));
    parent.append(list);
  };
  const safeUrl = (value = '') => {
    try {
      const protocol = new URL(value, window.location.href).protocol;
      return ['http:', 'https:', 'mailto:', 'file:'].includes(protocol) ? value : '#';
    } catch {
      return '#';
    }
  };
  const list = (items = []) => items.map((item) => `<li>${esc(item)}</li>`).join('');
  const tags = (items = []) => `<div class="tag-list">${items.map((item) => `<span class="tag">${esc(item)}</span>`).join('')}</div>`;
  const dialog = $('#detail-dialog');
  const dialogContent = $('#dialog-content');
  function fillProfile() {
    $('#now-copy').textContent = data.profile.currentFocus;
    const contactEmail = $('#contact-email');
    if (data.profile.email) {
      contactEmail.href = safeUrl(`mailto:${data.profile.email}`);
      const arrow = makeNode('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      contactEmail.replaceChildren(document.createTextNode(`${data.profile.email} `), arrow);
    } else {
      contactEmail.removeAttribute('href');
      contactEmail.textContent = 'CONTACT DETAILS NOT ADDED';
    }
    $('#current-year').textContent = new Date().getFullYear();
    document.title = 'R_KHYN';
    const socialList = $('#social-list');
    socialList.replaceChildren();
    if (data.profile.socials.length) {
      data.profile.socials.forEach((social) => {
        const link = makeNode('a', 'social-link');
        link.href = safeUrl(social.href);
        if (social.href.startsWith('http')) {
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
        }
        link.append(makeNode('span', '', social.label), makeNode('span', '', `${social.handle} ↗`));
        socialList.append(link);
      });
    } else {
      socialList.append(makeNode('span', 'social-empty', 'SOCIAL LINKS NOT ADDED'));
    }
    const resumeSlot = $('#resume-slot');
    resumeSlot.replaceChildren();
    if (data.profile.resume.available && data.profile.resume.href) {
      const link = makeNode('a', '', `${data.profile.resume.label} ↓`);
      link.href = safeUrl(data.profile.resume.href);
      link.download = '';
      resumeSlot.append(link);
    } else {
      resumeSlot.append(makeNode('span', '', 'RESUME FILE / NOT ATTACHED'));
    }
  }

  function renderWork() {
    $('#work-list').innerHTML = data.work.map((entry, index) => `<article class="work-entry" data-reveal>
      <button class="work-summary" type="button" aria-expanded="false" aria-controls="work-detail-${index}">
        <span class="work-date">${esc(entry.period)}</span>
        <span class="work-role-wrap"><span class="work-role">${esc(entry.position)}</span><span class="work-company">${esc(entry.company)}</span></span>
        <span class="work-location">${esc(entry.location)}</span>
        <span class="work-open" aria-hidden="true">+</span>
      </button>
      <div class="work-detail" id="work-detail-${index}">
        <div><p>${esc(entry.summary)}</p>${entry.responsibilities?.length ? `<h3>Responsibilities</h3><ul>${list(entry.responsibilities)}</ul>` : ''}</div>
        ${entry.achievements?.length || entry.tools?.length ? `<div>${entry.achievements?.length ? `<h3>Selected outcomes</h3><ul>${list(entry.achievements)}</ul>` : ''}${entry.tools?.length ? `<h3>Tools / skills</h3>${tags(entry.tools)}` : ''}</div>` : ''}
      </div>
    </article>`).join('');
  }

  function renderLearning(category = 'All') {
    const entries = data.learning.filter((entry) => category === 'All' || entry.category === category);
    $('#credential-list').innerHTML = entries.length ? entries.map((entry) => {
      const index = data.learning.indexOf(entry) + 1;
      return `<article class="credential-row" data-reveal>
        <span class="credential-number">${String(index).padStart(2, '0')}</span>
        <span class="credential-title">${esc(entry.title)}</span>
        <span class="credential-org">${esc(entry.organization)}</span>
        <span class="credential-date">${esc(entry.date)}</span>
        <button class="credential-open" type="button" aria-label="View ${esc(entry.title)}" data-credential="${index - 1}">↗</button>
      </article>`;
    }).join('') : '<p class="credential-empty">No records in this category yet.</p>';
    $('#credential-count').textContent = `${String(entries.length).padStart(2, '0')} RECORD${entries.length === 1 ? '' : 'S'}`;
    observeReveals();
  }

  function renderFilters() {
    const categories = ['All', ...new Set(data.learning.map((item) => item.category))];
    $('#learning-filters').innerHTML = categories.map((category, index) => `<button class="filter-button" type="button" aria-pressed="${index === 0}" data-filter="${esc(category)}">${esc(category.toUpperCase())}</button>`).join('');
  }

  function renderEducation() {
    $('#education-list').innerHTML = data.education.map((entry) => `<article class="education-entry" data-reveal>
      ${entry.period ? `<span class="education-date">${esc(entry.period)}</span>` : ''}<p class="education-degree">${esc(entry.degree)}</p><p class="education-school">${esc(entry.institution)}</p>${entry.note ? `<p class="education-note">${esc(entry.note)}</p>` : ''}
    </article>`).join('');
  }

  function renderSkills() {
    $('#skills-list').innerHTML = data.skills.map((group) => `<section class="skill-group" data-reveal><h3>${esc(group.category)}</h3><div class="skill-items">${group.items.map((skill) => `<span class="skill-item">${esc(skill)}</span>`).join('')}</div></section>`).join('');
  }

  function openCredential(entry) {
    const fileUrl = entry.certificateFile ? safeUrl(entry.certificateFile) : '';
    const imageUrl = entry.certificateImage ? safeUrl(entry.certificateImage) : '';
    const verification = entry.verificationUrl
      ? `<a class="dialog-link" href="${esc(safeUrl(entry.verificationUrl))}" target="_blank" rel="noreferrer">Verify credential ↗</a>`
      : entry.verificationCode
        ? `<p class="verification-code"><span>VERIFICATION CODE</span><strong>${esc(entry.verificationCode)}</strong></p>`
        : `<p class="verification-note">${esc(entry.verificationNote || 'No separate verification link or code has been added.')}</p>`;
    const pdfLink = fileUrl
      ? `<a class="dialog-link" href="${esc(fileUrl)}" target="_blank" rel="noreferrer">Open original certificate PDF ↗</a>`
      : '';
    const preview = imageUrl
      ? `<img class="certificate-preview-image" src="${esc(imageUrl)}" alt="Preview of ${esc(entry.title)}" />${pdfLink}`
      : fileUrl
        ? `<div class="certificate-preview-frame"><iframe class="certificate-document" src="${esc(fileUrl)}#view=FitH&toolbar=0&navpanes=0" title="Certificate preview: ${esc(entry.title)}"></iframe></div>${pdfLink}`
        : `<div class="certificate-preview"><p class="micro-label">PROFESSIONAL RECORD</p><h3>${esc(entry.title)}</h3><p>${esc(entry.organization).toUpperCase()}</p></div>`;
    dialogContent.innerHTML = `<p class="dialog-kicker">LEARNING RECORD / ${esc(entry.category)}</p><h2 class="dialog-title" id="dialog-title">${esc(entry.title)}</h2>${preview}<p class="dialog-copy">${esc(entry.detail)}</p><div class="dialog-meta"><div><span>ORGANIZATION</span><strong>${esc(entry.organization)}</strong></div><div><span>DATE</span><strong>${esc(entry.date)}</strong></div></div>${verification}`;
    showDialog();
  }

  function showDialog() {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
      document.body.classList.add('dialog-open');
      $('.dialog-close').focus();
    }
  }

  function closeDialog() {
    if (dialog.open) dialog.close();
    document.body.classList.remove('dialog-open');
  }

  function observeReveals() {
    const items = $$('[data-reveal]:not(.is-observed)');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item) => item.classList.add('is-revealed'));
      return;
    }
    const observer = new IntersectionObserver((records, currentObserver) => {
      records.forEach((record) => {
        if (record.isIntersecting) {
          record.target.classList.add('is-revealed');
          currentObserver.unobserve(record.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((item) => {
      item.classList.add('is-observed');
      observer.observe(item);
    });
  }

  fillProfile();
  renderWork();
  renderFilters();
  renderLearning();
  renderEducation();
  renderSkills();
  observeReveals();

  document.addEventListener('click', (event) => {
    const workButton = event.target.closest('.work-summary');
    if (workButton) {
      const entry = workButton.closest('.work-entry');
      const isOpen = entry.classList.toggle('is-open');
      workButton.setAttribute('aria-expanded', String(isOpen));
      workButton.querySelector('.work-open').textContent = isOpen ? '−' : '+';
      return;
    }
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      $$('.filter-button').forEach((button) => button.setAttribute('aria-pressed', String(button === filterButton)));
      renderLearning(filterButton.dataset.filter);
      return;
    }
    const credentialButton = event.target.closest('[data-credential]');
    if (credentialButton) {
      openCredential(data.learning[Number(credentialButton.dataset.credential)]);
      return;
    }
    if (event.target.closest('.dialog-close')) closeDialog();
    if (event.target === dialog) closeDialog();
    const navLink = event.target.closest('#site-nav a');
    if (navLink) closeMenu();
  });

  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDialog();
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase())) event.preventDefault();
  });
  document.addEventListener('copy', (event) => event.preventDefault());
  document.addEventListener('cut', (event) => event.preventDefault());
  document.addEventListener('paste', (event) => event.preventDefault());
  document.addEventListener('contextmenu', (event) => event.preventDefault());

  const menuToggle = $('#menu-toggle');
  const nav = $('#site-nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('.sr-only').textContent = 'Open navigation';
  }
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.querySelector('.sr-only').textContent = isOpen ? 'Close navigation' : 'Open navigation';
  });

  const progressBar = $('#progress-bar');
  const topbar = $('.topbar');
  let previousScrollY = window.scrollY;
  let topbarHideTimer;
  let scrollQueued = false;
  function revealTopbar() {
    topbar.classList.remove('is-hidden');
  }
  function hideTopbar() {
    if (window.scrollY < 90 || topbar.matches(':hover') || topbar.contains(document.activeElement) || nav.classList.contains('is-open')) return;
    topbar.classList.add('is-hidden');
  }
  topbar.addEventListener('mouseenter', revealTopbar);
  topbar.addEventListener('focusin', revealTopbar);
  document.addEventListener('pointermove', (event) => {
    if (event.clientY <= 86) {
      clearTimeout(topbarHideTimer);
      revealTopbar();
    } else if (window.scrollY > 90) {
      clearTimeout(topbarHideTimer);
      topbarHideTimer = setTimeout(hideTopbar, 650);
    }
  }, { passive: true });
  function updateScrollState() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < 90 || currentScrollY < previousScrollY - 4) revealTopbar();
    else if (currentScrollY > previousScrollY + 4) hideTopbar();
    previousScrollY = currentScrollY;
    if (!scrollQueued) {
      window.requestAnimationFrame(updateScrollState);
      scrollQueued = true;
    }
  }, { passive: true });
  updateScrollState();

})();
