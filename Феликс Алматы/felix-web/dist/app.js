(() => {
 'use strict';
 const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
 const products=window.FELIX_PRODUCTS,categories=window.FELIX_CATEGORIES;
 const config=window.FELIX_PAGE;
 if(config.product&&Array.isArray(config.gallery)){
  const current=products.find(p=>p.id===config.product);
  if(current)current.images=config.gallery;
 }
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lookup=new Map(products.map(p=>[p.id,p]));
 const key='felix-demo-selection-v1';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{}
 const state={ids:new Set(Array.isArray(saved.ids)?saved.ids.filter(id=>lookup.has(id)):[]),query:'',sort:'default',visible:12};
 let priorFocus,toastTimer;
 function message(text){$('#toast').textContent=text;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2500)}
 function persist(){try{localStorage.setItem(key,JSON.stringify({ids:[...state.ids],brief:{purpose:$('#purpose').value,seats:$('#seats').value,notes:$('#notes').value}}))}catch{}}
 function card(p){return `<article class="product-card"><a class="product-image-button" href="collection-${p.id}.html"><img src="${p.image}" alt="${esc(p.title)}" width="500" height="400" loading="lazy"></a><div class="product-info"><div><p class="product-category">${esc(p.label)}</p><h3><a class="product-title" href="collection-${p.id}.html">${esc(p.title)}</a></h3><p class="product-price">Стоимость по запросу</p></div><button class="add-button" data-add="${p.id}" aria-pressed="${state.ids.has(p.id)}" aria-label="${state.ids.has(p.id)?'Убрать':'Добавить'} ${esc(p.title)}">${state.ids.has(p.id)?'✓':'+'}</button></div></article>`}
 function render(){if(!$('#products'))return;
  let filtered=products.filter(p=>(!config.category||p.categories.includes(config.category))&&(!state.query||(p.title+' '+p.label+' '+p.sku).toLocaleLowerCase('ru').includes(state.query)));
  if(state.sort!=='default')filtered.sort((a,b)=>state.sort==='az'?a.title.localeCompare(b.title,'ru'):b.title.localeCompare(a.title,'ru'));
  if(config.home){filtered=config.featured.map(id=>lookup.get(id)).filter(Boolean);state.visible=filtered.length;}
  const shown=filtered.slice(0,state.visible);$('#products').innerHTML=shown.map(card).join('');
  if($('#catalog-count'))$('#catalog-count').textContent=`Показано ${shown.length} из ${filtered.length} товаров`;
  if($('#load-more'))$('#load-more').hidden=state.visible>=filtered.length;
  if($('#no-results'))$('#no-results').hidden=filtered.length>0;
  if(!reduce)$$('.product-card').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:380,delay:(i%3)*40,easing:'ease-out'}));
 }
 function selection(){
  $$('.selection-count').forEach(el=>el.textContent=state.ids.size);
  const chosen=products.filter(p=>state.ids.has(p.id));
  $('#selection-items').innerHTML=chosen.length?chosen.map(p=>`<div class="selection-item"><img src="${p.image}" alt="${esc(p.title)}" width="80" height="65"><div><strong>${esc(p.title)}</strong><small>${esc(p.label)}</small></div><button class="remove-item" data-add="${p.id}" aria-label="Убрать ${esc(p.title)}">Убрать</button></div>`).join(''):'<div class="selection-empty">Вы ещё не выбрали товары. Можно начать с описания задачи.<a class="text-button" href="catalog.html">Открыть каталог ↗</a></div>';
  $$('[data-detail-add]').forEach(b=>{const selected=state.ids.has(b.dataset.detailAdd);b.textContent=selected?'В подборке ✓':'Добавить в подборку +';b.setAttribute('aria-pressed',String(selected));});
 }
 function toggle(id){if(!lookup.has(id))return;const active=document.activeElement;const focusId=active?.dataset.add;const within=active?.closest('#selection-items');const remove=state.ids.has(id);if(remove)state.ids.delete(id);else state.ids.add(id);persist();render();selection();if(focusId&&!within)$(`[data-add="${focusId}"]`)?.focus({preventScroll:true});if(within)$('#purpose').focus({preventScroll:true});if(!$('#request-result').hidden)$('#request-text').value=requestText();message(remove?'Товар убран из подборки':'Товар добавлен в подборку');}
 function open(dialog){priorFocus=document.activeElement;$$('dialog[open]').forEach(d=>d.close());dialog.showModal();document.body.classList.add('modal-open');if(!reduce)dialog.animate([{opacity:0,transform:'translateY(15px)'},{opacity:1,transform:'translateY(0)'}],{duration:260,easing:'ease-out'});}
 $$('dialog').forEach(d=>{d.addEventListener('close',()=>{if(!$('dialog[open]')){document.body.classList.remove('modal-open');priorFocus?.isConnected&&priorFocus.focus();}});d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});});
 function openSelection(purpose){if(purpose)$('#purpose').value=purpose;$('#brief-form').hidden=false;$('#request-result').hidden=true;selection();open($('#selection-dialog'));}
 function requestText(){const purpose=$('#purpose').selectedOptions[0].textContent;const chosen=products.filter(p=>state.ids.has(p.id));const lines=['ПОДБОРКА — ФЕЛИКС АЛМАТЫ','Локальный черновик. Не заказ и не отправленная заявка.','',`Задача: ${purpose}`];if($('#seats').value)lines.push('Количество / мест: '+$('#seats').value);lines.push('','Товары:');if(!chosen.length)lines.push('Нужна помощь с выбором.');chosen.forEach((p,i)=>lines.push(`${i+1}. ${p.title}`,p.source));if($('#notes').value.trim())lines.push('','Пожелания:', $('#notes').value.trim());lines.push('','Цены, наличие, комплектацию и условия необходимо подтвердить у компании.');return lines.join('\n');}
 if(saved.brief){if([...$('#purpose').options].some(o=>o.value===saved.brief.purpose))$('#purpose').value=saved.brief.purpose;if(Number(saved.brief.seats)>=1&&Number(saved.brief.seats)<=10000)$('#seats').value=saved.brief.seats;if(typeof saved.brief.notes==='string')$('#notes').value=saved.brief.notes.slice(0,2000);}
 document.addEventListener('click',e=>{const el=e.target.closest('a,button');if(!el)return;
  if(el.matches('[data-add]'))toggle(el.dataset.add);
  else if(el.matches('[data-detail-add]'))toggle(el.dataset.detailAdd);
  else if(el.matches('.selection-toggle,.open-planner'))openSelection(el.dataset.purpose);
  else if(el.matches('.close-dialog'))el.closest('dialog').close();
  else if(el.matches('.open-credits'))open($('#credits-dialog'));
  else if(el.matches('[data-gallery]')){const p=lookup.get(config.product);const image=p.images[Number(el.dataset.gallery)];$('#gallery-main').src=image;$$('[data-gallery]').forEach(b=>b.setAttribute('aria-pressed',String(b===el)));}
 });
 $('#search')?.addEventListener('input',e=>{state.query=e.target.value.trim().toLocaleLowerCase('ru');state.visible=12;render()});
 $('#sort')?.addEventListener('change',e=>{state.sort=e.target.value;state.visible=12;render()});
 $('#load-more')?.addEventListener('click',()=>{state.visible+=12;render()});
 $('#reset-search')?.addEventListener('click',()=>{state.query='';state.visible=12;$('#search').value='';render();$('#search').focus()});
 $('#brief-form').addEventListener('input',persist);$('#brief-form').addEventListener('change',persist);
 $('#brief-form').addEventListener('submit',e=>{e.preventDefault();if(!e.target.reportValidity())return;persist();$('#request-text').value=requestText();$('#brief-form').hidden=true;$('#request-result').hidden=false;$('#copy-request').focus();});
 $('#edit-brief').addEventListener('click',()=>{$('#request-result').hidden=true;$('#brief-form').hidden=false;$('#purpose').focus()});
 $('#copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#request-text').value);message('Текст скопирован')}catch{$('#request-text').select();message('Для копирования нажмите Ctrl+C')}});
 $('#download-request').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\ufeff'+$('#request-text').value],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Феликс — подборка.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
 $('.menu-toggle').addEventListener('click',()=>{const show=$('#mobile-nav').hidden;$('#mobile-nav').hidden=!show;$('.menu-toggle').setAttribute('aria-expanded',String(show));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');}});
 const initialQuery=new URLSearchParams(location.search).get('q');if(initialQuery&&$('#search')){$('#search').value=initialQuery;state.query=initialQuery.toLocaleLowerCase('ru');}
 render();selection();
 if(!reduce){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.animate([{opacity:0,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'ease-out'});observer.unobserve(entry.target)}}),{threshold:.07});$$('.hero-copy,.hero-photo,.section-heading,.planning-copy,.category-directory,.contact-top').forEach(el=>observer.observe(el));}
})();
