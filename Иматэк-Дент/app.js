'use strict';
const booking = document.querySelector('#booking');
const profile = document.querySelector('#profile');
const formView = document.querySelector('#booking-form-view');
const preview = document.querySelector('#booking-preview');
const form = document.querySelector('#booking-form');
const direction = document.querySelector('#direction');
const date = document.querySelector('#preferred-date');
const today = new Date();
const localDay = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
date.min = localDay;
const profiles = {
  karlygash: {name:'Карлыгаш Усеновна Сунтаева', role:'Врач стоматолог-ортопед', text:'Директор и ведущий ортопед клиники. В официальном профиле указаны работа с протезированием, винирами и ортопедической имплантологией.', url:'https://imatek-dent.kz/suntaevakarlygash'},
  roman: {name:'Роман Игоревич Ситник', role:'Врач стоматолог-терапевт', text:'В официальном профиле указаны эстетическая реставрация зубов, профессиональная чистка и лечение корневых каналов.', url:'https://imatek-dent.kz/sitnikroman'},
  dinara: {name:'Динара Маратовна Туякбаева', role:'Врач-ортодонт', text:'Работает с детьми и взрослыми. В официальном профиле указаны брекет-системы, элайнеры и миофункциональные аппараты.', url:'https://imatek-dent.kz/tuyakbayeva'}
};
function showDialog(dialog) {dialog.showModal();document.body.classList.add('modal-open');}
function showBooking(value) {
  if(profile.open) profile.close();
  form.reset();date.setCustomValidity('');
  direction.value = value || 'Нужна помощь с выбором';
  formView.hidden = false;preview.hidden = true;
  booking.setAttribute('aria-labelledby','booking-title');
  showDialog(booking);
}
document.querySelectorAll('[data-book]').forEach(button => button.addEventListener('click',()=>showBooking(button.dataset.book)));
document.querySelectorAll('[data-profile]').forEach(button=>button.addEventListener('click',()=>{
  const data=profiles[button.dataset.profile];
  document.querySelector('#profile-title').textContent=data.name;
  document.querySelector('#profile-role').textContent=data.role;
  document.querySelector('#profile-description').textContent=data.text;
  document.querySelector('#profile-source').href=data.url;
  showDialog(profile);
}));
document.querySelectorAll('dialog').forEach(dialog=>{
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(!document.querySelector('dialog[open]'))document.body.classList.remove('modal-open');});
  dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))dialog.close();});
});
date.addEventListener('input',()=>date.setCustomValidity(''));
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(date.value&&new Date(`${date.value}T12:00:00`).getDay()===0){date.setCustomValidity('По воскресеньям клиника не работает. Выберите другой день.');date.reportValidity();return;}
  if(!form.reportValidity())return;
  const chosenDate=date.value?new Date(`${date.value}T12:00:00`).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'}):null;
  const text=`Здравствуйте! Хочу уточнить запись на консультацию в Иматэк-Дент.\nНаправление: ${direction.value}.${chosenDate?`\nЖелаемая дата: ${chosenDate}.`:''}\nПодскажите, пожалуйста, доступное время и условия консультации.`;
  document.querySelector('#request-text').textContent=text;
  document.querySelector('#whatsapp-link').href=`https://wa.me/77012577161?text=${encodeURIComponent(text)}`;
  formView.hidden=true;preview.hidden=false;
  booking.setAttribute('aria-labelledby','preview-title');
  document.querySelector('#preview-title').focus();
});
document.querySelector('#edit-request').addEventListener('click',()=>{preview.hidden=true;formView.hidden=false;booking.setAttribute('aria-labelledby','booking-title');direction.focus();});
const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
