// ===== Ala Clinic — interactions =====
document.addEventListener('DOMContentLoaded', () => {
  // Burger menu
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const toggleNav = open => {
    nav?.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger?.addEventListener('click', () => toggleNav(!nav.classList.contains('open')));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleNav(false)));
  document.addEventListener('click', e => {
    if (nav?.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) toggleNav(false);
  });

  // Lazy loading для изображений ниже первого экрана
  const lazy = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        const img = en.target;
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '400px' });
  document.querySelectorAll('img').forEach((img, i) => {
    if (i > 2 && !img.closest('.modal')) {
      img.dataset.src = img.src;
      img.removeAttribute('src');
      img.loading = 'lazy';
      lazy.observe(img);
    }
  });

  // Отключаем параллакс на телефонах (экономия батареи и FPS)
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Modal
  const modal = document.getElementById('modal');
  const openModal = () => { if (!modal) return; modal.hidden = false; document.body.style.overflow = 'hidden'; };
  modal.hidden = true; // модалка никогда не открыта при входе — только по клику
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ''; };
  document.querySelectorAll('[data-open-modal]').forEach(b => b.addEventListener('click', openModal));
  modal?.querySelectorAll('[data-close-modal]').forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Phone mask
  const maskPhone = input => {
    input.addEventListener('input', () => {
      let d = input.value.replace(/\D/g, '');
      if (d.startsWith('8')) d = '7' + d.slice(1);
      if (!d.startsWith('7')) d = '7' + d;
      d = d.slice(0, 11);
      let out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 4) out += ') ' + d.slice(4, 7);
      if (d.length >= 7) out += ' ' + d.slice(7, 9);
      if (d.length >= 9) out += ' ' + d.slice(9, 11);
      input.value = out;
    });
  };
  document.querySelectorAll('input[type="tel"]').forEach(maskPhone);

  // Forms — отправка не подключена к реальному бэкенду, только демонстрация
  ['consultForm', 'modalForm'].forEach(id => {
    const f = document.getElementById(id);
    f?.addEventListener('submit', e => {
      e.preventDefault();
      alert('Эта форма является демонстрационной. Данные не отправляются на сервер. В реальном проекте подключите бэкенд для обработки заявок.');
    });
  });

  // Scroll reveal
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.style.animation = 'fadeUp .7s ease both'; io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.service-card,.doctor-card,.work-card,.adv-card,.review-card,.contact-card,.faq-item').forEach(el => { el.style.opacity = '0'; io.observe(el); });

  // Header shrink
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40));

  // Параллакс плавающих зубов в hero (только ПК, не на тач-устройствах)
  if (!isMobile && !reduceMotion) {
    const teeth = document.querySelectorAll('.tooth');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      teeth.forEach((t, i) => { t.style.translate = '0 ' + (y * (0.06 + i * 0.03)) + 'px'; });
    }, { passive: true });
  }
});
