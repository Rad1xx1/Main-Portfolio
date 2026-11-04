'use strict';

const area = document.getElementById('room-area');
const areaValue = document.getElementById('area-value');
const powerValue = document.getElementById('power-value');
const context = document.getElementById('selected-context');
const phone = document.getElementById('customer-phone');
const requestType = document.getElementById('request-type');
let selectedProduct = null;
let selectedBrand = 'all';
let includeArea = false;

const products = {
  almacom: { brand: 'ALMACOM', name: 'Серия Inverter', image: 'assets/almacom-inverter.webp', description: 'Линейка настенных кондиционеров Almacom с инверторным управлением. Подберём модель и комплектацию под помещение. Точные характеристики зависят от выбранной модели.', source: 'https://silverclimat.kz/shop/ach-18i-2/' },
  gree: { brand: 'GREE', name: 'Bora GWH07AAA-K3NNA1A', image: 'assets/gree-bora.webp', description: 'Бытовая настенная сплит-система для охлаждения и обогрева. В каталоге компании для этой модели указана рекомендуемая площадь 20 м². Перед заказом уточним соответствие вашей задаче.', source: 'https://silverclimat.kz/shop/gree-07-bora-gwh07aaa-k3nna1a/' },
  lg: { brand: 'LG', name: 'ARTCOOL Mirror AM09BP', image: 'assets/lg-artcool.webp', description: 'Настенная сплит-система с чёрной зеркальной панелью и инверторным компрессором. В каталоге компании для AM09BP указана рекомендуемая площадь 25 м². Уточним подходящую комплектацию.', source: 'https://silverclimat.kz/shop/am09bp/' }
};
const brandSources = { SAMSUNG: 'https://silverclimat.kz/product-category/kondicionery-samsung/', OTEX: 'https://silverclimat.kz/product-category/kondicionery-otex/' };

function updateArea() {
  const value = Number(area.value);
  const power = (value / 10).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  areaValue.textContent = `${value} м²`;
  powerValue.textContent = `${power} кВт`;
  const progress = ((value - Number(area.min)) / (Number(area.max) - Number(area.min))) * 100;
  area.style.background = `linear-gradient(to right,var(--lime) 0%,var(--lime) ${progress}%,#dce6e1 ${progress}%,#dce6e1 100%)`;
  updateContext();
}

function updateContext() {
  const parts = [];
  if (selectedProduct) parts.push(`${selectedProduct.brand} · ${selectedProduct.name}`);
  else if (selectedBrand !== 'all') parts.push(`Бренд: ${selectedBrand}`);
  if (includeArea) parts.push(`Площадь: ${area.value} м²`);
  context.textContent = parts.join(' · ');
  context.hidden = parts.length === 0;
}

area.addEventListener('input', () => { includeArea = true; updateArea(); });
document.getElementById('discuss-selection').addEventListener('click', () => { includeArea = true; updateContext(); });

document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    selectedBrand = button.dataset.brand;
    selectedProduct = null;
    document.querySelectorAll('.filter').forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    const isRequestBrand = Object.hasOwn(brandSources, selectedBrand);
    document.querySelectorAll('.product').forEach(product => { product.hidden = selectedBrand !== 'all' && product.dataset.brand !== selectedBrand; });
    document.getElementById('product-grid').hidden = isRequestBrand;
    document.getElementById('brand-request').hidden = !isRequestBrand;
    if (isRequestBrand) {
      document.getElementById('brand-request-title').textContent = `Оборудование ${selectedBrand}`;
      document.getElementById('brand-catalog-link').href = brandSources[selectedBrand];
    }
    updateContext();
  });
});

const productDialog = document.getElementById('product-dialog');
let openProduct = null;
document.querySelectorAll('.product-details').forEach(button => {
  button.addEventListener('click', () => {
    openProduct = products[button.dataset.id];
    document.getElementById('dialog-brand').textContent = openProduct.brand;
    document.getElementById('product-dialog-title').textContent = openProduct.name;
    document.getElementById('dialog-description').textContent = openProduct.description;
    const image = document.getElementById('dialog-product-image');
    image.src = openProduct.image;
    image.alt = `${openProduct.brand} ${openProduct.name}`;
    document.getElementById('product-source').href = openProduct.source;
    productDialog.showModal();
  });
});
document.getElementById('choose-product').addEventListener('click', () => {
  selectedProduct = openProduct;
  requestType.value = 'Подбор кондиционера';
  updateContext();
  productDialog.close();
  document.getElementById('contacts').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  document.getElementById('customer-name').focus({ preventScroll: true });
});

document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => document.getElementById(button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
});

const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
function closeMenu() {
  mobileMenu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  menuButton.querySelector('use').setAttribute('href', '#menu');
}
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  mobileMenu.hidden = expanded;
  menuButton.setAttribute('aria-expanded', String(!expanded));
  menuButton.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
  menuButton.querySelector('use').setAttribute('href', expanded ? '#menu' : '#close');
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', event => { if (!mobileMenu.hidden && !event.target.closest('.site-header')) closeMenu(); });
matchMedia('(min-width: 701px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

phone.addEventListener('input', () => { phone.setCustomValidity(''); phone.removeAttribute('aria-invalid'); document.getElementById('phone-error').textContent = ''; });
document.getElementById('request-form').addEventListener('submit', event => {
  event.preventDefault();
  const digits = phone.value.replace(/\D/g, '');
  if (!((digits.length === 11 && /^[78]/.test(digits)) || digits.length === 10)) {
    phone.setAttribute('aria-invalid', 'true');
    document.getElementById('phone-error').textContent = 'Укажите номер в формате +7 707 123 45 67.';
    phone.setCustomValidity('Проверьте номер телефона.');
    phone.reportValidity();
    return;
  }
  const nameInput = document.getElementById('customer-name');
  const name = nameInput.value.trim();
  if (name.length < 2) {
    nameInput.setCustomValidity('Укажите имя — минимум 2 символа.');
    nameInput.reportValidity();
    return;
  }
  nameInput.setCustomValidity('');
  const normalizedPhone = '+7' + (digits.length === 11 ? digits.slice(1) : digits);
  const lines = ['Здравствуйте, Silver Climat!', '', `Меня зовут ${name}.`, `Телефон: ${normalizedPhone}`, `Интересует: ${requestType.value}.`];
  if (selectedProduct) lines.push(`Модель / серия: ${selectedProduct.brand} ${selectedProduct.name}.`);
  else if (selectedBrand !== 'all') lines.push(`Бренд: ${selectedBrand}.`);
  if (includeArea && requestType.value !== 'Сервисное обслуживание') lines.push(`Площадь помещения: ${area.value} м².`);
  lines.push('', 'Подскажите, пожалуйста, варианты, стоимость и условия.');
  const text = lines.join('\n');
  document.getElementById('request-preview').value = text;
  document.getElementById('whatsapp-draft').href = `https://wa.me/77073471974?text=${encodeURIComponent(text)}`;
  document.getElementById('request-dialog').showModal();
});
document.getElementById('customer-name').addEventListener('input', event => event.target.setCustomValidity(''));
updateArea();
