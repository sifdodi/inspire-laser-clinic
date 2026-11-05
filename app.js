const state = { lang: localStorage.getItem('inspire-lang') || 'ar' };
const serviceNames = {
  ar: { fillers:'الفيلر وتنسيق الملامح', skin:'العناية بالبشرة', booster:'Skin Booster', peeling:'تقشير البشرة', hair:'عناية بفروة الرأس', rhinoplasty:'استشارة تجميل الأنف الجراحي', other:'استشارة عامة' },
  en: { fillers:'Fillers & facial contouring', skin:'Skin care', booster:'Skin booster', peeling:'Skin peeling', hair:'Scalp care', rhinoplasty:'Surgical rhinoplasty consultation', other:'General consultation' }
};

function applyLanguage(lang){
  state.lang = lang;
  localStorage.setItem('inspire-lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-ar][data-en]').forEach(el => { el.textContent = el.dataset[lang]; });
  const toggle = document.getElementById('languageToggle');
  toggle.textContent = lang === 'ar' ? 'EN' : 'ع';
  toggle.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  document.getElementById('patientName').placeholder = lang === 'ar' ? 'اكتبي الاسم' : 'Enter patient name';
}

document.getElementById('languageToggle').addEventListener('click', () => applyLanguage(state.lang === 'ar' ? 'en' : 'ar'));
applyLanguage(state.lang);

const dateInput = document.getElementById('requestedDate');
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
dateInput.min = localToday;

document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
  document.getElementById('requestedService').value = link.dataset.service;
}));

document.getElementById('bookingForm').addEventListener('submit', event => {
  event.preventDefault();
  const name = document.getElementById('patientName').value.trim();
  const date = dateInput.value;
  const service = document.getElementById('requestedService').value;
  if (!name || !date || !service) return;
  const formattedDate = new Intl.DateTimeFormat(state.lang === 'ar' ? 'ar-EG' : 'en-GB', { dateStyle:'long' }).format(new Date(`${date}T12:00:00`));
  const params = new URLSearchParams(location.search);
  const campaign = params.get('utm_campaign') || params.get('ttclid');
  const message = state.lang === 'ar'
    ? `مرحبًا Inspire Laser Clinic،\nأرغب في طلب موعد.\n\nالاسم: ${name}\nالتاريخ المطلوب: ${formattedDate}\nالخدمة: ${serviceNames.ar[service]}\n${campaign ? `مرجع الحملة: ${campaign}\n` : ''}\nأفهم أن الطلب غير مؤكد حتى ترد العيادة وتؤكد الموعد.`
    : `Hello Inspire Laser Clinic,\nI would like to request an appointment.\n\nName: ${name}\nRequested date: ${formattedDate}\nService: ${serviceNames.en[service]}\n${campaign ? `Campaign reference: ${campaign}\n` : ''}\nI understand that this request is not confirmed until the clinic replies and confirms the appointment.`;
  window.open(`https://wa.me/201008610703?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
});

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const filter = button.dataset.filter;
  document.querySelectorAll('.result-card').forEach(card => { card.hidden = filter !== 'all' && card.dataset.category !== filter; });
}));

document.querySelectorAll('.compare-range').forEach(range => {
  const frame = range.closest('.compare-frame');
  const updateComparison = () => frame.style.setProperty('--comparison', `${range.value}%`);
  range.addEventListener('input', updateComparison, { passive:true });
  range.addEventListener('change', updateComparison, { passive:true });
  updateComparison();
});

const reviewCarousel = document.getElementById('reviewCarousel');
if (reviewCarousel) {
  const moveReviews = direction => {
    const readingDirection = document.documentElement.dir === 'rtl' ? -1 : 1;
    reviewCarousel.scrollBy({ left: direction * readingDirection * reviewCarousel.clientWidth * .9, behavior:'smooth' });
  };
  document.querySelector('[data-review-prev]')?.addEventListener('click', () => moveReviews(-1));
  document.querySelector('[data-review-next]')?.addEventListener('click', () => moveReviews(1));
}

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
}), { threshold:.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
document.getElementById('year').textContent = new Date().getFullYear();

// Optional TikTok Pixel hook: set window.INSPIRE_TIKTOK_PIXEL_ID before this file once an ID is supplied.
if (window.INSPIRE_TIKTOK_PIXEL_ID) document.documentElement.dataset.tiktokPixelReady = 'true';
