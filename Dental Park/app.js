'use strict';

const categories = {
  therapy: {title:'Лечение зубов', description:'Лечение кариеса и корневых каналов. Объём лечения определяет врач после осмотра.', rows:[['Лечение кариеса','от 25 000 ₸'],['Лечение пульпита','от 35 000 ₸'],['Лечение периодонтита','от 45 000 ₸']]},
  implants: {title:'Имплантация', description:'На консультации врач обсудит варианты восстановления зубов и составит план. Состав указанной цены нужно уточнить в клинике.', rows:[['Первичная консультация','Бесплатно'],['Имплантация зуба','от 300 000 ₸']]},
  aesthetic: {title:'Эстетика улыбки', description:'Гигиена, отбеливание и виниры. Подходящую процедуру подбирают после осмотра.', rows:[['Чистка AirFlow · две челюсти','35 000 ₸'],['Отбеливание BEYOND Polus Advance','120 000 ₸'],['Винир · один зуб','от 135 000 ₸']]},
  ortho: {title:'Ортодонтия', description:'Исправление прикуса у взрослых и детей. Стоимость полного курса и последующих приёмов уточняйте у ортодонта.', rows:[['Консультация ортодонта','5 000 ₸'],['Брекет-система · одна челюсть','от 125 000 ₸'],['Самолигирующие брекеты · одна челюсть','от 300 000 ₸']]},
  kids: {title:'Детская стоматология', description:'Лечение детских зубов и консультация по прикусу. Отдельный детский прайс в исходных материалах не указан: стоимость лечения уточнит врач.', rows:[['Первичная консультация','Бесплатно'],['Лечение детских зубов','По плану лечения']]},
  diagnostics: {title:'Диагностика', description:'Снимки и обследования по назначению врача. Выбор диагностики зависит от клинической задачи.', rows:[['Прицельный снимок одного зуба','5 000 ₸'],['Панорамный снимок','5 000 ₸'],['Компьютерная томография 3D','15 000 ₸']]}
};
const arrow = '<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
const tabs = [...document.querySelectorAll('[data-tab]')];
let selectedCategory = 'therapy';

function selectCategory(key, focusTab = false) {
  if (!categories[key]) return;
  selectedCategory = key;
  const data = categories[key];
  tabs.forEach(tab => {
    const active = tab.dataset.tab === key;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    if (active && focusTab) { tab.focus({preventScroll:true}); tab.scrollIntoView({block:'nearest',inline:'nearest'}); }
  });
  document.querySelectorAll('[data-category]').forEach(button => {
    button.classList.toggle('is-active',button.dataset.category === key);
    button.setAttribute('aria-pressed',String(button.dataset.category === key));
  });
  document.getElementById('price-category').textContent = data.title;
  document.getElementById('price-intro').textContent = data.description;
  document.getElementById('price-panel').setAttribute('aria-labelledby','tab-'+key);
  const list = document.getElementById('price-list');
  list.replaceChildren();
  data.rows.forEach(([name,price]) => {
    const row = document.createElement('div'); row.className='price-row';
    const title = document.createElement('span'); title.textContent=name;
    const amount = document.createElement('strong'); amount.textContent=price;
    const booking = document.createElement('button'); booking.dataset.book=name;
    booking.innerHTML='Записаться'+arrow; booking.setAttribute('aria-label','Записаться: '+name);
    row.append(title,amount,booking); list.append(row);
  });
}
tabs.forEach((tab,index) => {
  tab.addEventListener('click',() => selectCategory(tab.dataset.tab));
  tab.addEventListener('keydown',event => {
    let next;
    if (['ArrowDown','ArrowRight'].includes(event.key)) next=(index+1)%tabs.length;
    else if (['ArrowUp','ArrowLeft'].includes(event.key)) next=(index-1+tabs.length)%tabs.length;
    else if (event.key==='Home') next=0;
    else if (event.key==='End') next=tabs.length-1;
    else return;
    event.preventDefault(); selectCategory(tabs[next].dataset.tab,true);
  });
});
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click',() => {
  selectCategory(button.dataset.category);
  document.getElementById('prices').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.getElementById('price-panel').focus({preventScroll:true});
}));
selectCategory('therapy');

const dialog = document.getElementById('booking-dialog');
const bookingSelect = document.getElementById('booking-service');
const bookingLink = document.querySelector('.booking-whatsapp');
const selectionNote = document.querySelector('.booking-selection');
let bookingTrigger;
function updateBooking() {
  const service=bookingSelect.value;
  const text='Здравствуйте! Хочу записаться в DentalPark. Интересует: '+service+'. Подскажите, пожалуйста, доступное время.';
  bookingLink.href='https://wa.me/77019628080?text='+encodeURIComponent(text);
  selectionNote.textContent=service==='Первичная консультация'?'Первичная консультация — бесплатно по информации клиники.':'Стоимость и условия выбранной услуги уточнит администратор.';
}
function openBooking(trigger) {
  closeMenu();
  bookingTrigger=trigger;
  const service=trigger.dataset.book || 'Первичная консультация';
  const oldCustom=bookingSelect.querySelector('[data-custom]');
  if(oldCustom) oldCustom.remove();
  if (![...bookingSelect.options].some(option=>option.value===service)) {
    const option=document.createElement('option'); option.textContent=service; option.dataset.custom='true'; bookingSelect.add(option);
  }
  bookingSelect.value=service;
  updateBooking();
  dialog.showModal(); document.body.classList.add('dialog-open'); bookingSelect.focus();
}
document.addEventListener('click',event=> {
  const trigger=event.target.closest('[data-book]');
  if(trigger) openBooking(trigger);
});
bookingSelect.addEventListener('change',updateBooking);
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=> {
  if(event.target!==dialog) return;
  const bounds=dialog.getBoundingClientRect();
  if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom) dialog.close();
});
dialog.addEventListener('close',()=> {
  document.body.classList.remove('dialog-open');
  if(bookingTrigger) bookingTrigger.focus({preventScroll:true});
});
updateBooking();

const menuToggle=document.querySelector('.menu-toggle');
const mobileNav=document.getElementById('mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded','false'); menuToggle.setAttribute('aria-label','Открыть меню'); mobileNav.hidden=true;
  menuToggle.innerHTML='<svg class="icon" aria-hidden="true"><use href="#i-menu"/></svg>';
}
menuToggle.addEventListener('click',()=> {
  const expanded=menuToggle.getAttribute('aria-expanded')==='true';
  mobileNav.hidden=expanded; menuToggle.setAttribute('aria-expanded',String(!expanded));
  menuToggle.setAttribute('aria-label',expanded?'Открыть меню':'Закрыть меню');
  menuToggle.innerHTML='<svg class="icon" aria-hidden="true"><use href="#i-'+(expanded?'menu':'close')+'"/></svg>';
});
mobileNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileNav.hidden){closeMenu();menuToggle.focus();}});
window.matchMedia('(min-width:641px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
// Inline SVGs are decorative; labels come from their adjacent controls.
document.querySelectorAll('svg').forEach(svg=>svg.setAttribute('aria-hidden','true'));
