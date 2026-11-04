'use strict';

// Addresses and WhatsApp links are from the public Taplink page, checked 02.11.2026.
// Gogol 75/95 is deliberately omitted until the conflicting address is clarified.
const branches = [
  { id: 'seifullin', address: 'Сейфуллина, 416 к2', search: 'Сейфуллина 416 корпус 2', phone: '77075407236', women: true, prayer: true },
  { id: '4you', address: 'Радостовца, 333а', search: 'Радостовца 333а ЖК 4YOU', phone: '77002581342', note: 'ЖК 4YOU · формат уточните у администратора' },
  { id: 'auezov', address: 'Ауэзова, 165', search: 'Ауэзова 165', phone: '77780015634' },
  { id: 'tolebi', address: 'Толе би, 185', search: 'Толе би 185', phone: '77066566526' },
  { id: 'shugyla', address: 'Шугыла, 340/33 к10', search: 'Шугыла 340/33 корпус 10', phone: '77053195357', prayer: true },
  { id: 'baitursynov', address: 'Байтурсынова, 67', search: 'Байтурсынова 67', phone: '77478452191' },
  { id: 'zhetysu', address: 'Жетысу-3, 23а', search: 'Жетысу 3 23а', phone: '77052825623' },
  { id: 'zhandosov', address: 'Жандосова, 58/1', search: 'Жандосова 58/1', phone: '77475261547' },
  { id: 'kenesary', address: 'Кенесары хана, 32г/1', search: 'Кенесары хана 32г/1', phone: '77075193494' }
];

const state = { filter: 'all', query: '', expanded: false, selected: branches[0] };
const byId = id => document.getElementById(id);
const arrow = '<svg aria-hidden="true"><use href="#arrow"/></svg>';
const normalize = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const list = byId('branch-list');
const more = byId('more-branches');
const detail = document.querySelector('.branch-detail');

function matchingBranches() {
  const terms = normalize(state.query).split(' ').filter(Boolean);
  return branches.filter(branch => (state.filter === 'all' || branch.women) && terms.every(term => normalize(branch.address + ' ' + branch.search).includes(term)));
}

function renderDetail() {
  const branch = state.selected;
  const addressHeading = byId('detail-address');
  const [street, ...building] = branch.address.split(', ');
  addressHeading.replaceChildren(document.createTextNode(street + ','), document.createElement('br'), document.createTextNode(' ' + building.join(', ')));
  const features = byId('detail-features');
  features.replaceChildren();
  const lines = [];
  if (branch.women) lines.push(['Only for Women', 'women-feature']);
  if (branch.prayer) lines.push(['Намазхана', '']);
  if (branch.note) lines.push([branch.note, '']);
  if (!lines.length) lines.push(['Алматы', '']);
  lines.forEach(([text, className]) => {
    const span = document.createElement('span'); span.textContent = text; span.className = className; features.append(span);
  });
  byId('map-link').href = 'https://2gis.kz/almaty/search/' + encodeURIComponent('Coffee Original Алматы ' + branch.search);
}

function renderBranches({ focusId } = {}) {
  const matches = matchingBranches();
  const shown = state.expanded || state.query.trim() || state.filter !== 'all' ? matches : matches.slice(0, 5);
  if (!matches.some(branch => branch.id === state.selected.id) && matches.length) state.selected = matches[0];
  if (shown.length && !shown.some(branch => branch.id === state.selected.id)) state.selected = shown[0];
  list.replaceChildren();
  if (!matches.length) {
    const empty = document.createElement('div'); empty.className = 'empty-results';
    const message = document.createElement('p'); message.textContent = 'По этому запросу кофейня не найдена.';
    const reset = document.createElement('button'); reset.className = 'link accent'; reset.textContent = 'Сбросить поиск и фильтры';
    reset.addEventListener('click', () => { state.query = ''; state.filter = 'all'; state.expanded = false; byId('branch-search').value = ''; updateFilters(); renderBranches(); byId('branch-search').focus(); });
    empty.append(message, reset); list.append(empty);
  }
  shown.forEach(branch => {
    const row = document.createElement('button'); row.type = 'button'; row.className = 'branch-row' + (branch.id === state.selected.id ? ' selected' : '');
    row.dataset.id = branch.id;
    row.setAttribute('aria-pressed', String(branch.id === state.selected.id));
    row.setAttribute('aria-label', branch.address + (branch.women ? ', Only for Women' : '') + ', выбрать кофейню');
    row.innerHTML = '<span><span class="branch-row-name"></span><small>Алматы</small></span><span class="row-end">' + (branch.women ? '<span class="women-label">Only for Women</span>' : '') + arrow + '</span>';
    row.querySelector('.branch-row-name').textContent = branch.address;
    row.addEventListener('click', () => {
      state.selected = branch;
      renderBranches({ focusId: branch.id });
      byId('results-status').textContent = 'Выбрана кофейня: ' + branch.address;
    });
    list.append(row);
  });
  more.hidden = state.filter !== 'all' || Boolean(state.query.trim()) || matches.length <= 5;
  more.innerHTML = (state.expanded ? 'Меньше адресов' : 'Ещё адреса') + ' ' + arrow;
  more.setAttribute('aria-expanded', String(state.expanded));
  more.setAttribute('aria-controls', 'branch-list');
  detail.hidden = !matches.length;
  byId('results-status').textContent = matches.length ? 'Найдено кофеен: ' + matches.length + '. Выбрана: ' + state.selected.address : 'Кофейни не найдены';
  if (matches.length) renderDetail();
  if (focusId) list.querySelector('[data-id="' + focusId + '"]')?.focus({ preventScroll: true });
}

function updateFilters() {
  document.querySelectorAll('[data-filter]').forEach(button => {
    const active = button.dataset.filter === state.filter;
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
  });
}

document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  state.filter = button.dataset.filter; state.expanded = false; updateFilters(); renderBranches();
}));
byId('branch-search').addEventListener('input', event => { state.query = event.target.value; renderBranches(); });
more.addEventListener('click', () => { state.expanded = !state.expanded; renderBranches(); });

const navToggle = document.querySelector('.nav-toggle');
const navigation = byId('navigation');
function closeNavigation() { navigation.classList.remove('open'); navToggle.setAttribute('aria-expanded', 'false'); navToggle.setAttribute('aria-label', 'Открыть меню'); }
navToggle.addEventListener('click', () => {
  const expanded = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(expanded)); navToggle.setAttribute('aria-label', expanded ? 'Закрыть меню' : 'Открыть меню'); navigation.classList.toggle('open', expanded);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeNavigation));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeNavigation(); });

function openDialog(id) {
  closeNavigation();
  const dialog = byId(id); dialog.showModal(); document.body.classList.add('modal-open');
}
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.open)));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  // Only a direct pointer click outside the dialog rectangle closes it.
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});
byId('menu-to-branches').addEventListener('click', () => {
  byId('menu-dialog').close(); byId('cafes').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); byId('branch-search').focus({ preventScroll: true });
});

function localDate(date) { return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0'); }
const bookingForm = byId('booking-form');
const bookingPreview = byId('booking-preview');
let bookingBranch = state.selected;
byId('booking-open').addEventListener('click', () => {
  bookingBranch = state.selected;
  byId('booking-address').textContent = 'Coffee Original · ' + bookingBranch.address;
  const now = new Date(); const future = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  byId('booking-date').min = localDate(now); byId('booking-date').value = localDate(future);
  byId('booking-time').value = String(future.getHours()).padStart(2, '0') + ':00';
  byId('booking-time').setCustomValidity('');
  bookingForm.hidden = false; bookingPreview.hidden = true; openDialog('booking-dialog');
});
['booking-date', 'booking-time'].forEach(id => byId(id).addEventListener('input', () => byId('booking-time').setCustomValidity('')));
bookingForm.addEventListener('submit', event => {
  event.preventDefault();
  const dateValue = byId('booking-date').value, timeValue = byId('booking-time').value;
  const requested = new Date(dateValue + 'T' + timeValue + ':00');
  if (requested <= new Date()) { byId('booking-time').setCustomValidity('Выберите время в будущем.'); byId('booking-time').reportValidity(); return; }
  const formatted = new Intl.DateTimeFormat('ru-KZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(requested);
  const message = 'Здравствуйте! Хотелось бы уточнить возможность брони в Coffee Original.\n\nФилиал: ' + bookingBranch.address + ', Алматы.\nДата: ' + formatted + '.\nВремя: ' + timeValue + '.\nКоличество гостей: ' + byId('booking-guests').value + '.\n\nПодскажите, пожалуйста, есть ли свободные места и какие условия бронирования?';
  byId('message-preview').textContent = message;
  byId('whatsapp-link').href = 'https://wa.me/' + bookingBranch.phone + '?text=' + encodeURIComponent(message);
  bookingForm.hidden = true; bookingPreview.hidden = false; byId('whatsapp-link').focus();
});
byId('booking-edit').addEventListener('click', () => { bookingForm.hidden = false; bookingPreview.hidden = true; byId('booking-date').focus(); });

renderBranches();
