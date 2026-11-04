(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const products = window.FELIX_PRODUCTS || [];
  const motionAllowed = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateCards() {
    if(!motionAllowed) return;
    $$('.product-card').forEach((card,i)=>card.animate(
      [{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],
      {duration:520,delay:(i%3)*65,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}
    ));
  }
  const storageKey = 'felix-demo-selection-v1';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch (_) { /* Storage can be unavailable in a private file session. */ }
  const state = { filter:'all', query:'', ids:new Set(Array.isArray(saved.ids) ? saved.ids.filter(id=>products.some(p=>p.id===id)) : []) };
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let toastTimeout;
  function toast(text) { const el=$('#toast'); el.textContent=text; el.classList.add('visible'); clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>el.classList.remove('visible'),2600); }
  function persist() {
    const brief = { purpose:$('#purpose').value, seats:$('#seats').value, notes:$('#notes').value };
    try { localStorage.setItem(storageKey,JSON.stringify({ids:[...state.ids],brief})); } catch (_) { /* Selection still works in memory. */ }
  }
  const brief = saved.brief;
  if(brief && typeof brief==='object') {
    if(['office','work','executive','meeting','reception'].includes(brief.purpose)) $('#purpose').value=brief.purpose;
    if(/^\d{1,5}$/.test(String(brief.seats||'')) && Number(brief.seats)<=10000) $('#seats').value=brief.seats;
    if(typeof brief.notes==='string') $('#notes').value=brief.notes.slice(0,2000);
  }
  function renderCatalog() {
    const filtered=products.filter(p=>(state.filter==='all'||p.category===state.filter) && (p.title+' '+p.label).toLocaleLowerCase('ru').includes(state.query.toLocaleLowerCase('ru')));
    $('#products').innerHTML=filtered.map(p=>`<article class="product-card"><button type="button" class="product-image-button" data-view="${p.id}" aria-label="Посмотреть коллекцию ${esc(p.title)}"><img src="${p.image}" alt="${esc(p.alt)}" width="498" height="352" loading="lazy"></button><div class="product-info"><div><p class="product-category">${esc(p.label)}</p><h3><button type="button" class="product-title" data-view="${p.id}">${esc(p.title)}</button></h3><p class="product-price">Стоимость по запросу</p></div><button type="button" class="add-button" data-add="${p.id}" aria-pressed="${state.ids.has(p.id)}" aria-label="${state.ids.has(p.id)?'Убрать':'Добавить'} ${esc(p.title)} ${state.ids.has(p.id)?'из подборки':'в подборку'}">${state.ids.has(p.id)?'✓':'+'}</button></div></article>`).join('');
    $('#no-results').hidden=filtered.length!==0;
    $('#catalog-count').textContent=`Показано ${filtered.length} из ${products.length} коллекций`;
    animateCards();
  }
  function renderSelection() {
    $$('.selection-count').forEach(el=>el.textContent=state.ids.size);
    const selected=products.filter(p=>state.ids.has(p.id));
    $('#selection-items').innerHTML=selected.length ? selected.map(p=>`<div class="selection-item"><img src="${p.image}" alt="${esc(p.title)}" width="80" height="65"><div><strong>${esc(p.title)}</strong><small>${esc(p.label)}</small></div><button type="button" class="remove-item" data-remove="${p.id}" aria-label="Убрать ${esc(p.title)} из подборки">Убрать</button></div>`).join('') : '<div class="selection-empty">Пока без коллекций — можно начать с описания задачи.<button type="button" class="text-button" id="browse-from-selection">Посмотреть каталог ↗</button></div>';
  }
  function toggle(id) {
    if(!products.some(p=>p.id===id)) return;
    const focusedAdd=document.activeElement?.matches('[data-add]')?document.activeElement.dataset.add:null;
    const removing=state.ids.has(id);
    if(removing)state.ids.delete(id);else state.ids.add(id);
    persist(); renderSelection(); renderCatalog();
    if(motionAllowed) $$('.header .selection-count').forEach(el=>el.animate([{transform:'scale(1)'},{transform:'scale(1.4)'},{transform:'scale(1)'}],{duration:350,easing:'ease-out'}));
    if(focusedAdd)document.querySelector(`[data-add="${focusedAdd}"]`)?.focus({preventScroll:true});
    if(!$('#request-result').hidden) updateResult();
    toast(removing?'Коллекция убрана из подборки':'Коллекция добавлена в подборку');
    const detail=$('#product-detail [data-detail-add]');
    if(detail) {detail.textContent=state.ids.has(detail.dataset.detailAdd)?'В подборке ✓':'Добавить в подборку +';detail.setAttribute('aria-pressed',String(state.ids.has(detail.dataset.detailAdd)));}
  }
  let lastFocus;
  function openDialog(dialog) {
    lastFocus=document.activeElement;
    $$('dialog[open]').forEach(d=>d.close());
    dialog.showModal();document.body.classList.add('modal-open');
    if(motionAllowed)dialog.animate([{opacity:0,transform:'translateY(18px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:320,easing:'cubic-bezier(.22,1,.36,1)'});
  }
  $$('dialog').forEach(dialog=>{
    dialog.addEventListener('close',()=>{ if(!document.querySelector('dialog[open]')){document.body.classList.remove('modal-open');if(lastFocus?.isConnected)lastFocus.focus();} });
    dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
  });
  function view(id) {
    const p=products.find(p=>p.id===id);if(!p)return;
    $('#product-detail').innerHTML=`<div class="product-detail-grid"><img src="${p.image}" alt="${esc(p.alt)}" width="498" height="352"><div class="product-detail-copy"><p class="product-category">${esc(p.label)}</p><h2 id="product-title">${esc(p.title)}</h2><p>${esc(p.description)}</p><p>Стоимость по запросу. Комплектацию, отделку и наличие необходимо уточнить у компании.</p><button type="button" class="button primary" data-detail-add="${p.id}" aria-pressed="${state.ids.has(p.id)}">${state.ids.has(p.id)?'В подборке ✓':'Добавить в подборку +'}</button><a class="source-link" href="${p.source}" target="_blank" rel="noopener noreferrer">Посмотреть на исходном сайте ↗</a></div></div>`;
    $('#product-dialog').setAttribute('aria-labelledby','product-title');openDialog($('#product-dialog'));
  }
  function setFilter(filter) {
    state.filter=filter;
    $$('.filter').forEach(el=>{const active=el.dataset.filter===filter;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));});renderCatalog();
  }
  function openSelection(purpose) {
    if(purpose)$('#purpose').value=purpose;
    $('#brief-form').hidden=false;$('#request-result').hidden=true;renderSelection();openDialog($('#selection-dialog'));
  }
  function makeText() {
    const selected=products.filter(p=>state.ids.has(p.id));
    const lines=['ПОДБОРКА ОФИСНОЙ МЕБЕЛИ — ФЕЛИКС АЛМАТЫ','Черновик для обсуждения. Не заказ и не отправленная заявка.','',`Задача: ${$('#purpose').selectedOptions[0].textContent}`];
    if($('#seats').value) lines.push(`Рабочих мест: ${$('#seats').value}`);
    lines.push('','Интересующие коллекции:');
    if(selected.length)selected.forEach((p,i)=>lines.push(`${i+1}. ${p.title} — ${p.label}`,`   Источник: ${p.source}`));else lines.push('Требуется помощь с выбором коллекций.');
    if($('#notes').value.trim())lines.push('','Пожелания:', $('#notes').value.trim());
    lines.push('','Уточнить: состав, отделку, наличие, стоимость и условия поставки.','Контакты из официального сайта: +7 727 390 20 05; felix-almaty@mail.ru','Источник: https://www.felix-almaty.kz/contact');
    return lines.join('\n');
  }
  function updateResult() {$('#request-text').value=makeText();}
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    if(b.matches('[data-add]'))toggle(b.dataset.add);
    else if(b.matches('[data-remove]')) {const index=[...$('#selection-items').querySelectorAll('button')].indexOf(b);toggle(b.dataset.remove);const next=$('#selection-items').querySelectorAll('button');(next[Math.min(index,next.length-1)]||$('#purpose')).focus();}
    else if(b.matches('[data-detail-add]'))toggle(b.dataset.detailAdd);
    else if(b.matches('[data-view]'))view(b.dataset.view);
    else if(b.matches('.close-dialog'))b.closest('dialog').close();
    else if(b.matches('.selection-toggle,.open-planner'))openSelection(b.dataset.purpose);
    else if(b.matches('.open-credits'))openDialog($('#credits-dialog'));
    else if(b.matches('[data-filter]'))setFilter(b.dataset.filter);
    else if(b.matches('[data-shortcut]')) {state.query='';$('#search').value='';setFilter(b.dataset.shortcut);}
    else if(b.id==='browse-from-selection') {$('#selection-dialog').close();$('#collections').scrollIntoView({behavior:'smooth'});$('#search').focus({preventScroll:true});}
  });
  $('#search').addEventListener('input',e=>{state.query=e.target.value.trim();renderCatalog();});
  $('#reset-search').addEventListener('click',()=>{state.query='';$('#search').value='';setFilter('all');$('#search').focus();});
  $('#brief-form').addEventListener('input',persist);
  $('#brief-form').addEventListener('change',persist);
  $('#brief-form').addEventListener('submit',e=>{e.preventDefault();if(!e.target.reportValidity())return;persist();updateResult();$('#brief-form').hidden=true;$('#request-result').hidden=false;$('#request-result').scrollIntoView({block:'nearest'});$('#copy-request').focus({preventScroll:true});});
  $('#edit-brief').addEventListener('click',()=>{$('#request-result').hidden=true;$('#brief-form').hidden=false;$('#purpose').focus();});
  $('#copy-request').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText($('#request-text').value);toast('Текст подборки скопирован');}
    catch (_) {$('#request-text').focus();$('#request-text').select();toast('Нажмите Ctrl+C, чтобы скопировать выделенный текст');}
  });
  $('#download-request').addEventListener('click',()=>{const blob=new Blob(['\ufeff'+$('#request-text').value],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Феликс — подборка мебели.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Файл подборки подготовлен');});
  $('.menu-toggle').addEventListener('click',()=>{const open=$('.menu-toggle').getAttribute('aria-expanded')!=='true';$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');$('#mobile-nav').hidden=!open;});
  $$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Открыть меню');}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#mobile-nav').hidden){$('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').focus();}});
  renderCatalog();renderSelection();
  if(motionAllowed) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target;
      const delay=Number(el.dataset.motionDelay||0);
      el.animate([{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
      observer.unobserve(el);
    }),{threshold:.08});
    $$('.hero-copy h1,.hero-copy>p,.hero-actions,.hero-photo,.section-heading,.planning-photo,.planning-copy,.contact-top').forEach((el,i)=>{if(el.closest('.hero'))el.dataset.motionDelay=String((i%4)*90);observer.observe(el);});
  }
})();
