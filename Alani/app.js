'use strict';

const bookingDialog = document.querySelector('#booking-dialog');
const bookingForm = document.querySelector('#booking-form');
const dateInput = document.querySelector('#visit-date');
const timeInput = document.querySelector('#visit-time');
const guestsInput = document.querySelector('#guest-count');
const noteInput = document.querySelector('#visit-note');
const formError = document.querySelector('#form-error');
const bookingStep = document.querySelector('#booking-step');
const bookingReview = document.querySelector('#booking-review');
const navToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
let dialogTrigger = null;
let hasBookingDraft = false;

function localDateString(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}
function currentAlmatyTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Almaty', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());
}
function setNav(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Закрыть навигацию' : 'Открыть навигацию');
  mobileNav.hidden = !open;
}
navToggle.addEventListener('click', () => setNav(mobileNav.hidden));
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNav(false)));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) { setNav(false); navToggle.focus(); } });
window.matchMedia('(min-width: 641px)').addEventListener('change', event => { if (event.matches) setNav(false); });

function updateGuestButtons() {
  const value = Number(guestsInput.value);
  document.querySelector('#guest-minus').disabled = value <= 1;
  document.querySelector('#guest-plus').disabled = value >= 30;
}
function openBooking(trigger, dish) {
  dialogTrigger = trigger;
  setNav(false);
  dateInput.min = localDateString();
  if (!hasBookingDraft) {
  // Default to tomorrow, so an evening time never silently points into the past.
  dateInput.value = localDateString(new Date(Date.now() + 86400000));
  timeInput.value = '19:00';
  guestsInput.value = '2';
  hasBookingDraft = true;
  }
  if (dish) noteInput.value = `Интересует блюдо «${dish}».`;
  formError.hidden = true;
  bookingStep.hidden = false;
  bookingReview.hidden = true;
  bookingDialog.setAttribute('aria-labelledby', 'booking-title');
  updateGuestButtons();
  bookingDialog.showModal();
  document.body.classList.add('dialog-open');
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click', () => openBooking(button)));
document.querySelectorAll('[data-dish]').forEach(button => button.addEventListener('click', () => openBooking(button, button.dataset.dish)));
document.querySelector('#guest-minus').addEventListener('click', () => { guestsInput.stepDown(); updateGuestButtons(); });
document.querySelector('#guest-plus').addEventListener('click', () => { guestsInput.stepUp(); updateGuestButtons(); });
guestsInput.addEventListener('input', updateGuestButtons);

bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  formError.hidden = true;
  dateInput.min = localDateString();
  if (!bookingForm.reportValidity()) return;
  if (dateInput.value < localDateString() || (dateInput.value === localDateString() && timeInput.value <= currentAlmatyTime())) {
    formError.textContent = 'Выберите будущие дату и время встречи.';
    formError.hidden = false;
    timeInput.focus();
    return;
  }
  const visitDate = new Date(`${dateInput.value}T12:00:00+05:00`);
  const readableDate = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Almaty', day: 'numeric', month: 'long', year: 'numeric' }).format(visitDate);
  const note = noteInput.value.trim();
  document.querySelector('#summary-date').textContent = `${readableDate}, ${timeInput.value}`;
  document.querySelector('#summary-guests').textContent = guestsInput.value;
  document.querySelector('#summary-note-row').hidden = !note;
  document.querySelector('#summary-note').textContent = note;
  const message = `Здравствуйте! Хочу забронировать стол в Alani на Луганского, 19.\nДата: ${readableDate}\nВремя: ${timeInput.value}.\nКоличество гостей: ${guestsInput.value}.${note ? `\nПожелания: ${note}` : ''}\nПодтвердите, пожалуйста, возможность брони.`;
  document.querySelector('#whatsapp-request').href = `https://wa.me/77076665203?text=${encodeURIComponent(message)}`;
  bookingStep.hidden = true;
  bookingReview.hidden = false;
  bookingDialog.setAttribute('aria-labelledby', 'review-title');
  bookingDialog.scrollTop = 0;
  document.querySelector('#review-title').focus();
});
document.querySelector('#edit-request').addEventListener('click', () => {
  bookingReview.hidden = true; bookingStep.hidden = false;
  bookingDialog.setAttribute('aria-labelledby', 'booking-title');
  dateInput.focus();
});

const tabs = [...document.querySelectorAll('[data-filter]')];
function chooseCategory(tab) {
  tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; });
  let count = 0;
  document.querySelectorAll('.dish').forEach(dish => { dish.hidden = tab.dataset.filter !== 'all' && dish.dataset.category !== tab.dataset.filter; if (!dish.hidden) count++; });
  document.querySelector('#dish-list').setAttribute('aria-labelledby', tab.id);
  document.querySelector('#filter-status').textContent = `Блюд в подборке: ${count}`;
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => chooseCategory(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[tabs.length - 1];
    if (target) { event.preventDefault(); chooseCategory(target); target.focus(); }
  });
});

const photoDialog = document.querySelector('#photo-dialog');
document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
  dialogTrigger = button;
  document.querySelector('#gallery-image').src = button.dataset.photo;
  document.querySelector('#gallery-image').alt = button.querySelector('img').alt;
  document.querySelector('#gallery-caption').textContent = button.dataset.caption;
  photoDialog.showModal(); document.body.classList.add('dialog-open');
}));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); });
  dialog.addEventListener('close', () => { document.body.classList.remove('dialog-open'); if (dialogTrigger?.isConnected) { if (dialogTrigger.getClientRects().length) dialogTrigger.focus(); else navToggle.focus(); } });
});

// Keep errors and keyboard access coherent while editing a saved draft.
bookingForm.addEventListener('input', () => { formError.hidden = true; });
window.addEventListener('scroll', () => document.querySelector('.header').classList.toggle('is-scrolled', window.scrollY > 12), { passive: true });
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.desktop-nav a').forEach(link => {
      if (link.getAttribute('href') === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
['menu', 'atmosphere', 'contacts'].forEach(id => sectionObserver.observe(document.getElementById(id)));
