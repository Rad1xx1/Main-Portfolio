'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navigation');
function setMenu(open, restoreFocus = false) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Закрыть навигацию' : 'Открыть навигацию');
  nav.classList.toggle('is-open', open);
  if (restoreFocus) toggle.focus();
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true); });
document.addEventListener('click', event => { if (!nav.contains(event.target) && !toggle.contains(event.target)) setMenu(false); });
window.matchMedia('(min-width: 651px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
