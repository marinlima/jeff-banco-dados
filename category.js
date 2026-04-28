const CATS = [
  { id: 'editorial-makeup',  label: 'Editorial Makeup',  folder: 'Editorial-makeup',  json: 'content/Editorial-makeup.json'  },
  { id: 'editorial-fashion', label: 'Editorial Fashion', folder: 'Editorial-fashion', json: 'content/Editorial-fashion.json' },
  { id: 'beauty-portraits',  label: 'Beauty Portraits',  folder: 'Beauty-portraits',  json: 'content/Beauty-portraits.json'  },
  { id: 'advertising',       label: 'Advertising',       folder: 'Advertising',       json: 'content/Advertising.json'       },
  { id: 'overview',          label: 'Overview',          folder: null,                json: null                             },
];

let currentIndex = 0;
let allData = {};

async function loadAllData() {
  for (const cat of CATS) {
    if (!cat.json) continue;
    try {
      const res = await fetch(cat.json);
      if (!res.ok) continue;
      const data = await res.json();
      allData[cat.id] = data.fotos || [];
    } catch (err) {
      allData[cat.id] = [];
    }
  }
}

function getImgSrc(arquivo, folder) {
  if (!arquivo) return '';
  if (arquivo.startsWith('http')) return arquivo;
  if (arquivo.startsWith('/')) return arquivo.replace(/^\//, '');
  if (arquivo.includes('/')) return arquivo;
  return `assets/img/${folder}/${arquivo}`;
}

function makeImg(foto, folder) {
  const img = document.createElement('img');
  img.src = getImgSrc(foto.arquivo, folder);
  img.alt = foto.legenda || foto.arquivo;
  if (foto.legenda) img.dataset.caption = foto.legenda;
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

function renderFotos(fotos, folder, container, append = false) {
  if (!append) container.innerHTML = '';
  let i = 0;
  while (i < fotos.length) {
    const foto = fotos[i];
    if (foto.tipo === 'single') {
      const div = document.createElement('div');
      div.className = 'ph-grid-single';
      div.appendChild(makeImg(foto, folder));
      container.appendChild(div);
      i++;
    } else {
      const next = fotos[i + 1];
      if (next && next.tipo !== 'single') {
        const div = document.createElement('div');
        div.className = 'ph-grid-multi';
        div.appendChild(makeImg(foto, folder));
        div.appendChild(makeImg(next, folder));
        container.appendChild(div);
        i += 2;
      } else {
        const div = document.createElement('div');
        div.className = 'ph-grid-single';
        div.appendChild(makeImg(foto, folder));
        container.appendChild(div);
        i++;
      }
    }
  }
}

function renderPanel(cat) {
  const panel = document.getElementById('panel-' + cat.id);
  if (!panel) return;

  if (cat.id === 'overview') {
    renderOverview();
    return;
  }

  const fotos = allData[cat.id] || [];
  renderFotos(fotos, cat.folder, panel);
}

function renderOverview() {
  const panel = document.getElementById('panel-overview');
  if (!panel) return;
  panel.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'overview-grid';

  for (const cat of CATS) {
    if (!cat.folder) continue;
    const fotos = allData[cat.id] || [];
    renderFotos(fotos, cat.folder, wrapper, true);
  }

  panel.appendChild(wrapper);
}

function showCat(index) {
  currentIndex = ((index % CATS.length) + CATS.length) % CATS.length;
  const cat = CATS[currentIndex];

  document.getElementById('catTitle').textContent = cat.label;

  document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('active'));

  const panel = document.getElementById('panel-' + cat.id);
  if (panel) panel.classList.add('active');

  history.replaceState(null, '', '#' + cat.id);

  renderPanel(cat);
  buildLightboxPool();
}

document.getElementById('arrowPrev')?.addEventListener('click', () => showCat(currentIndex - 1));
document.getElementById('arrowNext')?.addEventListener('click', () => showCat(currentIndex + 1));

document.addEventListener('keydown', e => {
  if (lightboxOpen) return;
  if (e.key === 'ArrowLeft') showCat(currentIndex - 1);
  if (e.key === 'ArrowRight') showCat(currentIndex + 1);
});

window.addEventListener('DOMContentLoaded', async () => {
  await loadAllData();
  const hash = location.hash.replace('#', '');
  const idx = CATS.findIndex(c => c.id === hash);
  showCat(idx !== -1 ? idx : 0);
});

const catMenuBtn = document.getElementById('catMenuBtn');
const catMenu = document.getElementById('catMenu');
let catCloseTimeout = null;

catMenuBtn?.addEventListener('mouseenter', () => { clearTimeout(catCloseTimeout); catMenu.classList.add('open'); });
catMenu?.addEventListener('mouseenter', () => { clearTimeout(catCloseTimeout); });
catMenuBtn?.addEventListener('mouseleave', () => { catCloseTimeout = setTimeout(() => catMenu.classList.remove('open'), 400); });
catMenu?.addEventListener('mouseleave', () => { catCloseTimeout = setTimeout(() => catMenu.classList.remove('open'), 400); });

document.querySelectorAll('.cat-menu a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const idx = CATS.findIndex(c => c.id === link.dataset.cat);
    if (idx !== -1) showCat(idx);
    catMenu.classList.remove('open');
  });
});

const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCounter = document.getElementById('lbCounter');

let lightboxOpen = false;
let lbImages = [];
let lbCurrent = 0;

let scale = 1, posX = 0, posY = 0;
let startX = 0, startY = 0;
let isDragging = false;
let initialDistance = null, initialScale = 1;

function buildLightboxPool() {
  const activePanel = document.querySelector('.cat-panel.active');
  if (!activePanel) return;
  lbImages = Array.from(activePanel.querySelectorAll('img')).map(img => ({
    src: img.src,
    alt: img.alt,
    caption: img.dataset.caption || ''
  }));
}

function openLightbox(src) {
  lbCurrent = lbImages.findIndex(i => i.src === src) || 0;
  renderLb();
  lightbox.classList.add('open');
  lightboxOpen = true;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxOpen = false;
  document.body.style.overflow = '';
  resetZoom();
}

function renderLb() {
  const item = lbImages[lbCurrent];
  lbImg.src = item.src;
  lbImg.alt = item.alt;
  const caption = document.getElementById('lbCaption');
  caption.textContent = item.caption;
  caption.style.display = item.caption ? '' : 'none';
  lbCounter.textContent = `${lbCurrent + 1} / ${lbImages.length}`;
  resetZoom();
}

function lbStep(dir) {
  lbCurrent = (lbCurrent + dir + lbImages.length) % lbImages.length;
  renderLb();
}

function resetZoom() { scale = 1; posX = 0; posY = 0; applyTransform(); }
function applyTransform() { lbImg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`; }

lbImg.addEventListener('click', e => {
  e.stopPropagation();
  const rect = lbImg.getBoundingClientRect();
  if (scale === 1) {
    scale = 2.5;
    posX -= (e.clientX - rect.left - rect.width / 2);
    posY -= (e.clientY - rect.top - rect.height / 2);
  } else { resetZoom(); return; }
  applyTransform();
});

lbImg.addEventListener('mousedown', e => {
  if (scale === 1) return;
  isDragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  applyTransform();
});
window.addEventListener('mouseup', () => { isDragging = false; });

let touchStartX = 0, touchStartY = 0, touchStartDist = null, touchInitialScale = 1, isPinching = false;

lbImg.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    isPinching = true;
    touchStartDist = getDistance(e.touches);
    touchInitialScale = scale;
    isDragging = false;
  } else if (e.touches.length === 1) {
    isPinching = false;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    if (scale > 1) { isDragging = true; startX = touchStartX - posX; startY = touchStartY - posY; }
    else isDragging = false;
  }
}, { passive: true });

lbImg.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && isPinching) {
    e.preventDefault();
    scale = Math.min(Math.max(1, touchInitialScale * (getDistance(e.touches) / touchStartDist)), 4);
    applyTransform();
  } else if (e.touches.length === 1 && isDragging && scale > 1) {
    e.preventDefault();
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
    applyTransform();
  }
}, { passive: false });

lbImg.addEventListener('touchend', e => {
  if (isPinching) { isPinching = false; touchStartDist = null; if (scale < 1.05) resetZoom(); return; }
  if (isDragging) { isDragging = false; return; }
  if (scale === 1) {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      deltaX < 0 ? lbStep(1) : lbStep(-1);
    }
  }
  isDragging = false; touchStartDist = null;
});

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

document.addEventListener('click', e => {
  const img = e.target.closest('img');
  if (!img || !img.closest('.cat-panel')) return;
  buildLightboxPool();
  openLightbox(img.src);
});

lightbox?.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.getElementById('lbClose')?.addEventListener('click', closeLightbox);
document.getElementById('lbPrev')?.addEventListener('click', e => { e.stopPropagation(); lbStep(-1); });
document.getElementById('lbNext')?.addEventListener('click', e => { e.stopPropagation(); lbStep(1); });

document.addEventListener('keydown', e => {
  if (!lightboxOpen) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lbStep(-1);
  if (e.key === 'ArrowRight') lbStep(1);
});

window.addEventListener('load', () => { document.body.classList.add('page-loaded'); });

document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', e => {
    const url = link.getAttribute('href');
    if (!url || url.startsWith('#') || link.target === '_blank') return;
    e.preventDefault();
    document.body.classList.add('fade-out');
    setTimeout(() => { window.location.href = url; }, 300);
  });
});

const hamburgerBtn = document.getElementById('hamburgerBtn');
const dropdown = document.getElementById('dropdown');
let dropCloseTimeout = null;

hamburgerBtn?.addEventListener('mouseenter', () => { clearTimeout(dropCloseTimeout); dropdown.classList.add('open'); });
dropdown?.addEventListener('mouseenter', () => { clearTimeout(dropCloseTimeout); });
hamburgerBtn?.addEventListener('mouseleave', () => { dropCloseTimeout = setTimeout(() => dropdown.classList.remove('open'), 400); });
dropdown?.addEventListener('mouseleave', () => { dropCloseTimeout = setTimeout(() => dropdown.classList.remove('open'), 400); });