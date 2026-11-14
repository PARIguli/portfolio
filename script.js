document.addEventListener("DOMContentLoaded", async () => {
  // Mobile navigation
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => nav.classList.remove("open")));

  // Gentle scroll reveals. Content remains visible if IntersectionObserver is unavailable.
  const revealTargets = document.querySelectorAll(".intro-section, .work-card, .feature-inner, .design-heading, .design-columns > div, .dev-heading, .code-window, .project-row, .ai-content, .contact-content");
  revealTargets.forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.12, rootMargin: "0px 0px -35px 0px"});
    revealTargets.forEach(el => observer.observe(el));
  } else revealTargets.forEach(el => el.classList.add("is-visible"));

  // Top reading progress indicator
  const progress = document.getElementById("scrollProgress");
  const updateProgress = () => {
    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener("scroll", updateProgress, {passive:true});
  updateProgress();

  // Rotating terminal-style line, using a calm typing effect.
  const typing = document.getElementById("typingText");
  if (typing) {
    const phrases = (typing.dataset.phrases || "creating with curiosity").split("|");
    let phraseIndex = 0, charIndex = 0, deleting = false;
    const type = () => {
      const phrase = phrases[phraseIndex];
      charIndex += deleting ? -1 : 1;
      typing.textContent = phrase.slice(0, charIndex);
      let delay = deleting ? 35 : 65;
      if (!deleting && charIndex === phrase.length) { deleting = true; delay = 1450; }
      else if (deleting && charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; delay = 350; }
      window.setTimeout(type, delay);
    };
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) type();
    else typing.textContent = phrases[0];
  }

  // Supabase content is optional: the portfolio's motion works without a connection.
  const cfg = window.PORTFOLIO_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY || !window.supabase) return;
  const client = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const {data, error} = await client.from("portfolio_items").select("*").eq("published", true).order("created_at", {ascending:false});
  if (error || !data) return;


  const makeCard = item => {
    const card = document.createElement("article"); card.className = "uploaded-card reveal is-visible";
    const image = document.createElement("img"); image.src = item.image_url; image.alt = item.title; image.loading = "lazy";
    const meta = document.createElement("div"); meta.className = "uploaded-meta";
    const title = document.createElement("h3"); title.textContent = item.title;
    const desc = document.createElement("p"); desc.textContent = item.description || "";
    meta.append(title, desc); card.append(image, meta); return card;
  };
  const addGroup = (id, items) => {
    const host = document.getElementById(id); if (!host || !items.length) return;
    host.replaceChildren(...items.map(makeCard));
  };
  addGroup("artGallery", data.filter(x => x.category === "art"));
  addGroup("designGallery", data.filter(x => ["graphic","uiux"].includes(x.category)));
  addGroup("projectGallery", data.filter(x => ["development","ai"].includes(x.category)));
});
