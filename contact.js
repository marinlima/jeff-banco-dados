const hbg = document.getElementById('hbg');
const drop = document.getElementById('drop');
const navLeft = document.getElementById('navLeft');

let timeout;

hbg.addEventListener('mouseenter', () => {
  clearTimeout(timeout);
  drop.classList.add('open');
});

drop.addEventListener('mouseenter', () => {
  clearTimeout(timeout);
});

hbg.addEventListener('mouseleave', () => {
  timeout = setTimeout(() => {
    drop.classList.remove('open');
  }, 400);
});

drop.addEventListener('mouseleave', () => {
  timeout = setTimeout(() => {
    drop.classList.remove('open');
  }, 400);
});

drop.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => drop.classList.remove('open'));
});

window.addEventListener('load', () => {
  document.body.classList.add('page-loaded');

  if (window.location.hash) {
    const el = document.querySelector(window.location.hash);
    if (el) {
      el.scrollIntoView();
    }
  }
});

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
 document.querySelectorAll('.tel-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(btn.dataset.tel).then(() => {
      const original = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = original, 1500);
    });
  });
});

async function loadSiteTexts() {
  try {
    const res = await fetch('content/site-texts.json');
    if (!res.ok) return;
    const data = await res.json();

    const navLogo = document.getElementById('navLogo');
    const vertName = document.getElementById('vertName');
    const bioTitle = document.getElementById('bioTitle');
    const bioParagraphs = document.getElementById('bioParagraphs');
    const s2Name = document.getElementById('s2Name');
    const s2Tag = document.getElementById('s2Tag');
    const telCopy = document.getElementById('telCopy');
    const emailLink = document.getElementById('emailLink');

    if (navLogo && data.siteName) navLogo.textContent = data.siteName;
    if (vertName && data.siteName) vertName.textContent = data.siteName;
    if (bioTitle && data.biographyTitle) bioTitle.textContent = data.biographyTitle;
    if (s2Name && data.siteName) s2Name.textContent = data.siteName;
    if (s2Tag && data.tagline) s2Tag.textContent = data.tagline;

    if (telCopy && data.phone) {
      telCopy.dataset.tel = data.phone;
      telCopy.textContent = data.phone;
    }
    if (emailLink && data.email) {
      emailLink.href = 'mailto:' + data.email;
      emailLink.textContent = data.email;
    }

    if (bioParagraphs && Array.isArray(data.biographyParagraphs) && data.biographyParagraphs.length) {
      bioParagraphs.innerHTML = '';
      data.biographyParagraphs.forEach(text => {
        const p = document.createElement('p');
        p.className = 'bio-text';
        p.textContent = text;
        bioParagraphs.appendChild(p);
      });
    }
  } catch (err) {
    // mantém o texto fixo do HTML como fallback
  }
}

document.addEventListener('DOMContentLoaded', loadSiteTexts);