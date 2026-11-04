document.addEventListener('DOMContentLoaded',()=>{
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior=reduced?'instant':'smooth';
  const nav=document.getElementById('nav'),burger=document.getElementById('burger');
  function toggleNav(open){nav.classList.toggle('open',open);burger.setAttribute('aria-expanded',String(open));document.body.style.overflow=open?'hidden':'';}
  burger.setAttribute('aria-controls','nav');burger.setAttribute('aria-expanded','false');burger.onclick=()=>toggleNav(!nav.classList.contains('open'));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleNav(false)));
  document.addEventListener('click',e=>{if(nav.classList.contains('open')&&!nav.contains(e.target)&&!burger.contains(e.target))toggleNav(false)});
  const track=document.getElementById('doctorTrack'),prev=document.getElementById('doctorPrev'),next=document.getElementById('doctorNext'),all=document.getElementById('allDoctors');
  const total=track.children.length;
  function updateCarousel(){
    if(track.classList.contains('expanded'))return;
    const step=track.firstElementChild.getBoundingClientRect().width+18;
    const first=Math.round(track.scrollLeft/step)+1,visible=Math.max(1,Math.floor((track.clientWidth+18)/step)),last=Math.min(total,first+visible-1);
    document.getElementById('doctorCount').textContent=first===last?`${first} из ${total}`:`${first}–${last} из ${total}`;
    prev.disabled=track.scrollLeft<5;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-5;
  }
  function move(d){track.scrollBy({left:d*(track.firstElementChild.getBoundingClientRect().width+18),behavior})}
  prev.onclick=()=>move(-1);next.onclick=()=>move(1);track.addEventListener('scroll',updateCarousel,{passive:true});
  track.addEventListener('keydown',e=>{if(e.target===track&&['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
  all.onclick=()=>{const expanded=all.getAttribute('aria-expanded')!=='true';all.setAttribute('aria-expanded',String(expanded));all.textContent=expanded?'Свернуть фотографии':`Все фотографии · ${total}`;track.classList.toggle('expanded',expanded);document.querySelector('.carousel-footer').hidden=expanded;if(!expanded){track.scrollLeft=0;updateCarousel()}};
  new ResizeObserver(updateCarousel).observe(track);updateCarousel();
  document.querySelectorAll('.comparison__range').forEach(input=>{const update=()=>{input.parentElement.style.setProperty('--split',input.value+'%');input.setAttribute('aria-valuetext',input.value+'% фотографии до лечения')};input.addEventListener('input',update);update()});
  const cards=[...document.querySelectorAll('.work-card')],more=document.getElementById('moreWorks');let filter='all',expandedWorks=false;
  function updateWorks(){const matching=cards.filter(c=>filter==='all'||c.dataset.category===filter);cards.forEach(c=>c.hidden=!matching.includes(c)||(!expandedWorks&&matching.indexOf(c)>1));more.hidden=matching.length<=2;more.textContent=expandedWorks?'Свернуть работы':`Показать все работы · ${matching.length}`;more.setAttribute('aria-expanded',String(expandedWorks))}
  document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{filter=button.dataset.filter;expandedWorks=false;document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});updateWorks()});
  more.onclick=()=>{expandedWorks=!expandedWorks;updateWorks();if(!expandedWorks)document.getElementById('works').scrollIntoView({behavior})};updateWorks();
  const reviewButton=document.getElementById('moreReviews'),reviews=[...document.querySelectorAll('.review-card')];
  reviewButton.onclick=()=>{const expanded=reviewButton.getAttribute('aria-expanded')!=='true';reviewButton.setAttribute('aria-expanded',String(expanded));reviewButton.textContent=expanded?'Свернуть отзывы':`Все отзывы · ${reviews.length}`;reviews.forEach((r,i)=>r.hidden=!expanded&&i>2)};
  // Native dialog keeps keyboard focus inside the full-size photo viewer.
  const viewer=document.getElementById('photoViewer'),viewerImage=document.getElementById('viewerImage'),caption=document.getElementById('photoCaption');let gallery=[],photoIndex=0;
  function showPhoto(i){photoIndex=i;const item=gallery[i];viewerImage.src=item.dataset.full;viewerImage.alt=item.dataset.caption;caption.textContent=item.dataset.caption;document.getElementById('photoCount').textContent=`${i+1} / ${gallery.length}`;document.getElementById('photoOriginal').href=item.dataset.full;document.getElementById('photoPrev').disabled=i===0;document.getElementById('photoNext').disabled=i===gallery.length-1}
  document.querySelectorAll('[data-gallery]').forEach(button=>button.addEventListener('click',()=>{gallery=[...document.querySelectorAll('[data-gallery]')].filter(b=>b.dataset.gallery===button.dataset.gallery);showPhoto(gallery.indexOf(button));viewer.showModal();document.body.style.overflow='hidden'}));
  document.querySelector('[data-close-viewer]').onclick=()=>viewer.close();document.getElementById('photoPrev').onclick=()=>showPhoto(Math.max(0,photoIndex-1));document.getElementById('photoNext').onclick=()=>showPhoto(Math.min(gallery.length-1,photoIndex+1));
  viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();showPhoto(Math.max(0,Math.min(gallery.length-1,photoIndex+(e.key==='ArrowRight'?1:-1))))}});
  viewer.addEventListener('close',()=>document.body.style.overflow='');
  const modal=document.getElementById('modal');let opener;
  function closeModal(){modal.hidden=true;document.body.style.overflow='';opener?.focus()}
  function openModal(trigger,service=''){
    toggleNav(false);opener=trigger;document.getElementById('modalTitle').textContent=service?`Запись: ${service}`:'Запись на консультацию';
    const form=document.getElementById('modalForm');let field=form.querySelector('[name=branch]');if(!field){field=document.createElement('input');field.type='hidden';field.name='branch';form.append(field)}field.value=service;
    form.querySelector('.form-status')?.remove();modal.hidden=false;document.body.style.overflow='hidden';form.querySelector('input[type=text]').focus();
  }
  document.querySelectorAll('[data-open-modal]').forEach(b=>b.onclick=()=>openModal(b));modal.querySelectorAll('[data-close-modal]').forEach(b=>b.onclick=closeModal);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!modal.hidden)closeModal();else if(nav.classList.contains('open'))toggleNav(false)}if(e.key==='Tab'&&!modal.hidden){const items=[...modal.querySelectorAll('button,input:not([type=hidden]),a[href]')].filter(e=>!e.hidden),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  const serviceDialog=document.getElementById('serviceDialog'),serviceData=JSON.parse(document.getElementById('serviceData').textContent);let selectedService='',serviceOpener;
  document.querySelectorAll('[data-service]').forEach(button=>button.onclick=()=>{const [title,description]=serviceData[Number(button.dataset.service)];selectedService=title;serviceOpener=button;document.getElementById('serviceTitle').textContent=title;document.getElementById('serviceDescription').textContent=description;serviceDialog.showModal();document.body.style.overflow='hidden'});
  document.querySelector('[data-close-service]').onclick=()=>serviceDialog.close();serviceDialog.addEventListener('click',e=>{if(e.target===serviceDialog){const rect=serviceDialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)serviceDialog.close()}});
  serviceDialog.addEventListener('close',()=>{if(modal.hidden)document.body.style.overflow=''});
  document.getElementById('bookService').onclick=()=>{serviceDialog.close();document.querySelector('#consultForm select').value=selectedService;openModal(serviceOpener,selectedService)};
  document.getElementById('seePrices').onclick=()=>serviceDialog.close();
  document.querySelectorAll('input[type=tel]').forEach(i=>i.addEventListener('input',()=>i.setCustomValidity('')));
  ['consultForm','modalForm'].forEach(id=>{const form=document.getElementById(id);form.onsubmit=e=>{
    e.preventDefault();const tel=form.querySelector('input[type=tel]'),digits=tel.value.replace(/\D/g,'');if(!/^[78]\d{10}$/.test(digits)){tel.setCustomValidity('Введите телефон из 11 цифр, начиная с +7 или 8.');tel.reportValidity();return}
    const values=new FormData(form),message=`Здравствуйте! Хочу записаться в Almeda Stom. Имя: ${String(values.get('name')).trim()}. Телефон: ${tel.value}. Направление: ${values.get('branch')||'Уточню у администратора'}. Удобная связь: ${values.get('way')==='whatsapp'?'WhatsApp':'Звонок'}.`;
    let status=form.querySelector('.form-status');if(!status){status=document.createElement('div');status.className='form-status';status.setAttribute('role','status');form.append(status)}status.replaceChildren();const text=document.createElement('p');text.textContent='Сообщение готово. Отправьте его администратору в WhatsApp, чтобы согласовать запись.';const link=document.createElement('a');link.className='btn btn--light';link.textContent='Открыть WhatsApp';link.href='https://wa.me/77476358924?text='+encodeURIComponent(message);link.target='_blank';link.rel='noopener';status.append(text,link);status.scrollIntoView({behavior,block:'nearest'});
  }});
  const updateHeader=()=>document.getElementById('header').classList.toggle('scrolled',scrollY>40);addEventListener('scroll',updateHeader,{passive:true});updateHeader();
});
