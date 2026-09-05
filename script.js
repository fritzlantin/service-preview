/* =========================================================
   CONTENT — this is the only part you need to edit to add
   your own work. Everything below it is behavior.
   ========================================================= */

// Your own raw clips for the looping strip under the hero.
// Add as many as you want — the list is duplicated automatically
// (as many times as needed) so the loop always stays seamless.
const carouselClips = [
  { src: 'assets/carousel/clip-1.mp4' },
  { src: 'assets/carousel/clip-2.mp4' },
  { src: 'assets/carousel/clip-3.mp4' },
  { src: 'assets/carousel/clip-4.mp4' },
  { src: 'assets/carousel/clip-5.mp4' },
  { src: 'assets/carousel/clip-6.mp4' },
];

// Your 6 featured pieces (vertical). "id" is the part of any
// YouTube URL after v= — e.g. youtube.com/watch?v=THIS_PART
const gridVideos = [
  // TODO: this id is 16 characters — real YouTube ids are always 11.
  // Re-copy this one from youtube.com/shorts/THIS_PART
  { id: 'tNU5B-J91Vw', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  // TODO: same here — re-check against the Shorts url.
  { id: 'L7Sap7xHXDQ', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute.' },
  { id: 'QWuWRI2heT8', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: 'T3350NVuiO4', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: 'EgMVPpOikRs', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: 'nOwOXrMM1Cc', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: 'TmT86ojJ5mI', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: 'cLlFcumIX88', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: 'sXoMiZ5Jcxk', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
];

// Your longer-form pieces (horizontal). Add or remove freely —
// the row scrolls sideways to fit however many you list.
const horizontalVideos = [
  { id: 'oB4l0d1KtJs', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: 'X9QSW_WGAQ0', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
  { id: '9Q2Dl4yeZsk&t', title: 'Turn on audio', subtitle: 'For desktop user press this to unmute' },
];

/* =========================================================
   Below here is behavior — you shouldn't need to touch it.
   ========================================================= */

// Pulls a clean 11-character video id out of whatever you paste:
// a bare id, a full watch url, a youtu.be link, a Shorts url
// (youtube.com/shorts/ID), or an id with playlist params stuck
// to the end. Means you can paste a full url straight into the
// arrays above and it'll just work.
function extractVideoId(raw) {
  if (!raw) return '';
  const value = String(raw).trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value; // already clean

  try {
    const url = new URL(value);
    if (url.searchParams.has('v')) return url.searchParams.get('v');
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length) return segments[segments.length - 1];
  } catch (e) {
    // not a full url — probably a bare id with something stuck to it
  }

  return value.split(/[&?]/)[0]; // cut off at the first stray & or ?
}

function placeholderMarkup() {
  return `
    <div class="placeholder">
      <svg class="placeholder__icon" width="22" height="22" viewBox="0 0 48 48" fill="none">
        <rect x="3" y="10" width="30" height="28" rx="2" stroke="currentColor" stroke-width="2"/>
        <path d="M33 18l12-7v26l-12-7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>
    </div>`;
}

/* ---------- Hero text reveal ---------- */
function revealHeroText() {
  const elements = document.querySelectorAll('[data-reveal-text]');
  let wordIndex = 0;

  elements.forEach((element) => {
    const text = element.textContent.trim();
    const words = text.split(/\s+/);

    element.textContent = '';

    words.forEach((word, index) => {
      const wordWrap = document.createElement('span');
      wordWrap.className = 'reveal-word';
      wordWrap.style.setProperty('--word-delay', `${wordIndex * 90}ms`);

      const wordInner = document.createElement('span');
      wordInner.textContent = word;

      wordWrap.appendChild(wordInner);
      element.appendChild(wordWrap);

      if (index < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }

      wordIndex++;
    });
  });
}

/* ---------- Carousel ---------- */
// Each slot starts as just a placeholder — no <video> yet. A real <video>
// is only mounted once a slot scrolls near the visible strip (see the
// IntersectionObserver in initCarouselMotion). This is what actually fixes
// clips only playing in the first few slots: creating a real <video> for
// every duplicate copy at once (up to 12 full sets) asks the browser to
// decode far more simultaneous videos than it's willing to, so only the
// first handful ever actually play — mounting on demand keeps the number
// of *real* video elements small no matter how many slots exist for the loop.
function buildCarouselSlot(src) {
  const wrap = document.createElement('div');
  wrap.className = 'carousel-clip';
  wrap.dataset.src = src;
  wrap.innerHTML = placeholderMarkup();
  return wrap;
}

function mountCarouselVideo(wrap) {
  if (wrap.dataset.mounted === '1') return;
  wrap.dataset.mounted = '1';
  const video = document.createElement('video');
  video.src = wrap.dataset.src;
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('aria-hidden', 'true');
  video.addEventListener('error', () => wrap.classList.add('is-empty'));
  wrap.prepend(video);
}

function unmountCarouselVideo(wrap) {
  if (wrap.dataset.mounted !== '1') return;
  wrap.dataset.mounted = '0';
  const video = wrap.querySelector('video');
  if (!video) return;
  video.pause();
  video.removeAttribute('src');
  video.load(); // actually releases the decoder/buffer, not just pauses it
  video.remove();
}

function renderCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track || carouselClips.length === 0) return;
  carouselClips.forEach(({ src }) => track.appendChild(buildCarouselSlot(src)));
  // Extra copies for a seamless, direction-aware loop are added later by
  // initCarouselMotion(), once it knows how wide one set of clips actually is.
}

/* ---------- Video cards: thumbnail until hover, iframe on interaction ---------- */
// NOTE on "error 153": YouTube's embedded player requires a real HTTP(S)
// origin to identify the embedding site. Opening this file directly
// (file:///...) gives it no origin at all, so playback fails with error 153
// even though the code is correct — see warnIfLocalFile() below. Once this
// site is served over http(s) (a local dev server, or real hosting), it
// works with no changes needed. The `origin` param here is an extra bit of
// identification YouTube recommends once you're off file://.
function buildEmbedUrl(id, { muted }) {
  const params = new URLSearchParams({
    autoplay: '1',
    mute: muted ? '1' : '0',
    controls: muted ? '0' : '1',
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
  });
  if (muted) {
    params.set('loop', '1');
    params.set('playlist', id); // YouTube requires this to loop a single video
  }
  if (location.protocol.startsWith('http')) {
    params.set('origin', location.origin);
  }
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

function createVideoCard({ id: rawId, title, subtitle }, variant) {
  const id = extractVideoId(rawId);
  const card = document.createElement('article');
  card.className = `video-card video-card--${variant}`;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Play ${title}`);

  const player = document.createElement('div');
  player.className = 'video-card__player';
  player.innerHTML = placeholderMarkup();

  const thumb = document.createElement('img');
  thumb.className = 'video-card__thumb';
  thumb.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  thumb.loading = 'lazy';
  thumb.alt = '';
  thumb.addEventListener('error', () => player.classList.add('is-empty'));

  const playIcon = document.createElement('div');
  playIcon.className = 'video-card__play';
  playIcon.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  player.append(thumb, playIcon);

  let iframe = null;
  let state = 'idle'; // idle -> preview (hover, muted) -> active (clicked, sound on)

  function mount(url) {
    if (iframe) iframe.remove();
    iframe = document.createElement('iframe');
    iframe.className = 'video-card__iframe';
    iframe.src = url;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.title = title;
    player.appendChild(iframe);
    player.classList.add('is-playing');
  }

  function unmount() {
    if (iframe) { iframe.remove(); iframe = null; }
    player.classList.remove('is-playing');
  }

  function showPreview() {
    if (state !== 'idle') return;
    state = 'preview';
    mount(buildEmbedUrl(id, { muted: true }));
  }

  function stopPreview() {
    if (state !== 'preview') return;
    state = 'idle';
    unmount();
  }

  function playWithSound() {
    state = 'active';
    mount(buildEmbedUrl(id, { muted: false }));
  }

  // Hover only applies where hover actually exists (skips touch devices,
  // so nothing gets stuck "previewing" on a phone).
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover) {
    card.addEventListener('mouseenter', showPreview);
    card.addEventListener('mouseleave', stopPreview);
    card.addEventListener('focus', showPreview);
    card.addEventListener('blur', stopPreview);
  }
  card.addEventListener('click', () => { if (state !== 'active') playWithSound(); });
  card.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && state !== 'active') {
      e.preventDefault();
      playWithSound();
    }
  });

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  const subtitleEl = document.createElement('p');
  subtitleEl.textContent = subtitle;

  card.append(player, titleEl, subtitleEl);
  return card;
}

function renderCards(list, containerId, variant) {
  const container = document.getElementById(containerId);
  if (!container) return;
  list.forEach((video) => container.appendChild(createVideoCard(video, variant)));
}

/* ---------- Carousel motion: follows scroll, bounces at the ends when idle ----------
   Tune these to taste: */
const CAROUSEL_COPIES = 2.5;                   // 6 clips × 4 = 24 total slots — fixed, not viewport-based
const CAROUSEL_SCROLL_MULTIPLIER = 1;        // 1px scrolled = 1px of carousel motion
const CAROUSEL_MAX_DELTA_PER_FRAME = 120;    // caps big jumps (anchor-link jumps, fast flings)
const CAROUSEL_IDLE_DELAY_MS = 500;          // how long scrolling must stop before idle drift starts
const CAROUSEL_IDLE_BLEND_MS = 400;          // fade time into/out of idle drift
const CAROUSEL_IDLE_SPEED = 0.02;            // px/ms — how fast it drifts when idle (slow, ambient)

function initCarouselMotion() {
  const section = document.querySelector('.carousel-section');
  const wrap = document.querySelector('.carousel-wrap');
  const track = document.getElementById('carouselTrack');
  if (!section || !wrap || !track || !track.children.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // A fixed 6×CAROUSEL_COPIES slots — not "however many it takes to fill any
  // screen width". It bounces back and forth between the two ends instead of
  // looping infinitely, so the number of real <video> elements that can ever
  // exist is small and predictable (this — plus mounting on demand below —
  // is what keeps this from re-fetching far more clips than a visit needs).
  for (let i = 1; i < CAROUSEL_COPIES; i++) {
    carouselClips.forEach(({ src }) => track.appendChild(buildCarouselSlot(src)));
  }

  // Only mount a real <video> for slots within ~300px of the visible strip;
  // unmount it once a slot scrolls back out. Rooted to .carousel-wrap (the
  // actual clipping element) rather than the whole page viewport.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) mountCarouselVideo(entry.target);
        else unmountCarouselVideo(entry.target);
      });
    }, { root: wrap, rootMargin: '300px' });
    track.querySelectorAll('.carousel-clip').forEach((clip) => observer.observe(clip));
  } else {
    track.querySelectorAll('.carousel-clip').forEach(mountCarouselVideo);
  }

  // position is a translateX in px, bounded to [minPos, 0]: 0 shows the very
  // first slot, minPos shows the very last slot flush against the right edge.
  let position = 0;
  let minPos = 0;
  function computeBounds() {
    minPos = Math.min(0, wrap.clientWidth - track.scrollWidth);
    position = Math.max(minPos, Math.min(0, position));
  }
  computeBounds();
  window.addEventListener('resize', computeBounds);

  let driftDir = 1; // idle drift direction: 1 = toward the last slot, -1 = back toward the first
  let lastScrollY = window.scrollY;
  let lastScrollTime = performance.now() - CAROUSEL_IDLE_DELAY_MS; // start in idle drift
  let lastFrameTime = performance.now();
  let idleWeight = 1;
  let isHovering = false;

  section.addEventListener('mouseenter', () => { isHovering = true; });
  section.addEventListener('mouseleave', () => { isHovering = false; });

  function frame(now) {
    const dt = Math.min(now - lastFrameTime, 50);
    lastFrameTime = now;

    const scrollY = window.scrollY;
    let scrollDelta = scrollY - lastScrollY;
    lastScrollY = scrollY;
    scrollDelta = Math.max(-CAROUSEL_MAX_DELTA_PER_FRAME, Math.min(CAROUSEL_MAX_DELTA_PER_FRAME, scrollDelta));

    if (Math.abs(scrollDelta) > 0.5) lastScrollTime = now;
    const sinceScroll = now - lastScrollTime;
    const targetIdleWeight = (!isHovering && sinceScroll > CAROUSEL_IDLE_DELAY_MS) ? 1 : 0;
    idleWeight += (targetIdleWeight - idleWeight) * Math.min(dt / CAROUSEL_IDLE_BLEND_MS, 1);

    // Scrolling down moves the strip left-to-right (position toward 0);
    // scrolling up moves it right-to-left (position toward minPos). Scroll
    // motion simply stops at either end — nothing more to show past it.
    position += scrollDelta * CAROUSEL_SCROLL_MULTIPLIER * (1 - idleWeight);

    // Slow drift while idle, reversing direction whenever it hits an end.
    position += driftDir * CAROUSEL_IDLE_SPEED * dt * idleWeight;

    if (position >= 0) { position = 0; driftDir = -1; }
    else if (position <= minPos) { position = minPos; driftDir = 1; }

    track.style.transform = `translateX(${position}px)`;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* ---------- Horizontal row: prev/next buttons + best-effort wheel ----------
   Buttons are the reliable path here: these cards mount a YouTube iframe on
   hover (showPreview, above), and once that iframe covers the card, mouse
   wheel input over it is handled by YouTube's own page — it never reaches
   our listener at all, since cross-origin iframes own their own input.
   That's not fixable from our side without giving up the hover-preview, so
   buttons are the dependable control; the wheel listener below still helps
   whenever the cursor isn't directly over an active iframe. */
function initHorizontalScrollControls() {
  const el = document.getElementById('horizontalScroll');
  const prevBtn = document.querySelector('.h-scroll-btn--prev');
  const nextBtn = document.querySelector('.h-scroll-btn--next');
  if (!el) return;

  function step() {
    const card = el.querySelector('.video-card');
    return card ? card.getBoundingClientRect().width + 32 : el.clientWidth * 0.8;
  }

  function updateButtons() {
    if (!prevBtn || !nextBtn) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    prevBtn.disabled = el.scrollLeft <= 1;
    nextBtn.disabled = el.scrollLeft >= maxScroll - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => el.scrollBy({ left: -step(), behavior: 'smooth' }));
  if (nextBtn) nextBtn.addEventListener('click', () => el.scrollBy({ left: step(), behavior: 'smooth' }));
  el.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();

  el.addEventListener('wheel', (e) => {
    if (el.scrollWidth <= el.clientWidth) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const atStart = el.scrollLeft <= 0;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    if ((atStart && delta < 0) || (atEnd && delta > 0)) return;
    e.preventDefault();
    el.scrollLeft += delta;
  }, { passive: false });
}

/* ---------- Dev-only heads-up when opened via file:// (see buildEmbedUrl note) ---------- */
function warnIfLocalFile() {
  if (location.protocol !== 'file:') return;
  const notice = document.createElement('div');
  notice.className = 'local-file-notice';
  notice.innerHTML =
    '<strong>Heads up —</strong> this page is open as a local file, so the ' +
    'embedded YouTube players (hero reel and project cards) will fail with ' +
    '"error 153" when played (thumbnails are fine). Run a local server to ' +
    'preview playback — e.g. <code>python3 -m http.server</code> in this ' +
    'folder, then open <code>http://localhost:8000</code> — or just upload ' +
    'the files to your host; it works there automatically.' +
    '<button type="button" aria-label="Dismiss">&times;</button>';
  document.body.appendChild(notice);
  notice.querySelector('button').addEventListener('click', () => notice.remove());
}

/* ---------- Hero: empty-state watcher + real timecode readout ---------- */
function watchHeroVideo() {
  const player = document.querySelector('.hero__player');
  const video = document.querySelector('.hero__video');
  if (!player || !video) return;
  video.addEventListener('error', () => player.classList.add('is-empty'));
}

function syncTimecode() {
  const el = document.getElementById('heroTimecode');
  const video = document.querySelector('.hero__video');
  if (!el || !video) return;
  const fps = 24; // only used to format the frame column
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  video.addEventListener('timeupdate', () => {
    const t = video.currentTime;
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const f = Math.floor((t % 1) * fps);
    el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
  });
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  revealHeroText();
  renderCarousel();
  initCarouselMotion();
  renderCards(gridVideos, 'videoGrid', 'vertical');
  renderCards(horizontalVideos, 'horizontalScroll', 'horizontal');
  watchHeroVideo();
  initHorizontalScrollControls();
  warnIfLocalFile();
});
