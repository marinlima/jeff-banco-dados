const btn = document.getElementById('hamburgerBtn');
const dropdown = document.getElementById('dropdown');
let dropCloseTimeout = null;

btn.addEventListener('mouseenter', () => {
  clearTimeout(dropCloseTimeout);
  dropdown.classList.add('open');
});

dropdown.addEventListener('mouseenter', () => {
  clearTimeout(dropCloseTimeout);
});

btn.addEventListener('mouseleave', () => {
  dropCloseTimeout = setTimeout(() => {
    dropdown.classList.remove('open');
  }, 400);
});

dropdown.addEventListener('mouseleave', () => {
  dropCloseTimeout = setTimeout(() => {
    dropdown.classList.remove('open');
  }, 400);
});

dropdown.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => dropdown.classList.remove('open'));
});

window.addEventListener('load', () => {
  document.body.classList.add('page-loaded');
});

async function loadSiteTexts() {
  try {
    const res = await fetch('content/site-texts.json');
    if (!res.ok) return;
    const data = await res.json();

    const navLogo = document.getElementById('navLogo');
    const heroName = document.getElementById('heroName');
    const heroSub = document.getElementById('heroSub');
    const aboutBtn = document.getElementById('aboutBtn');

    if (navLogo && data.siteName) navLogo.textContent = data.siteName;
    if (heroName && data.siteName) heroName.textContent = data.siteName;
    if (heroSub && data.tagline) heroSub.textContent = data.tagline;
    if (aboutBtn && data.aboutButtonLabel) aboutBtn.textContent = data.aboutButtonLabel;
  } catch (err) {
    // mantém o texto fixo do HTML como fallback
  }
}

document.addEventListener('DOMContentLoaded', loadSiteTexts);

document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener('click', e => {
    const url = link.getAttribute('href');

    if (!url || url.startsWith('#') || link.target === '_blank') return;

    e.preventDefault();

    document.body.classList.add('fade-out');

    setTimeout(() => {
      window.location.href = url;
    }, 300);
  });
}); 
