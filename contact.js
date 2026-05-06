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