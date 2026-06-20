const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.textContent = isOpen ? "x" : "+";
  });
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-links a").forEach((link) => {
  const href = link.getAttribute("href");
  if (href === currentPage || (currentPage === "index.html" && href === "index.html")) {
    link.classList.add("active");
  }
});

const visitKey = "site_visits";
const visits = Number(localStorage.getItem(visitKey) || "0") + 1;
localStorage.setItem(visitKey, String(visits));
document.querySelectorAll("[data-visitor-counter]").forEach((el) => {
  el.textContent = visits.toLocaleString("de-DE");
});

document.querySelectorAll("[data-like]").forEach((button) => {
  const id = button.dataset.like;
  const key = `like_${id}`;
  const base = Number(button.dataset.base || "24");
  const liked = localStorage.getItem(key) === "1";
  const render = () => {
    const total = base + (localStorage.getItem(key) === "1" ? 1 : 0);
    button.textContent = `Like (${total})`;
    button.classList.toggle("active", localStorage.getItem(key) === "1");
  };
  if (liked) button.classList.add("active");
  render();
  button.addEventListener("click", () => {
    localStorage.setItem(key, localStorage.getItem(key) === "1" ? "0" : "1");
    render();
  });
});

document.querySelectorAll("[data-comment-form]").forEach((form) => {
  const id = form.dataset.commentForm;
  const input = form.querySelector("input");
  const list = document.querySelector(`[data-comment-list="${id}"]`);
  const key = `comments_${id}`;
  const render = () => {
    const comments = JSON.parse(localStorage.getItem(key) || "[]");
    list.innerHTML = comments.map((item) => `<li>${item}</li>`).join("");
  };
  render();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const comments = JSON.parse(localStorage.getItem(key) || "[]");
    comments.push(text.replace(/[<>]/g, ""));
    localStorage.setItem(key, JSON.stringify(comments.slice(-5)));
    input.value = "";
    render();
  });
});

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = contactForm.querySelector("[data-form-status]");
    const privacy = contactForm.querySelector("#privacy");
    if (privacy && !privacy.checked) {
      status.textContent = "Bitte der Datenschutzerklaerung zustimmen.";
      return;
    }
    status.textContent = "Danke, die Nachricht wurde als Demo lokal verarbeitet. Fuer den Livebetrieb wird ein DSGVO-konformer Mailversand angebunden.";
    contactForm.reset();
  });
}

document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = form.querySelector("[data-newsletter-status]");
    const input = form.querySelector("input[type='email']");
    const saved = JSON.parse(localStorage.getItem("site_newsletter") || "[]");
    if (input.value.trim()) {
      saved.push(input.value.trim());
      localStorage.setItem("site_newsletter", JSON.stringify([...new Set(saved)]));
    }
    status.textContent = "Danke. Im Livebetrieb startet hier ein Double-Opt-in per Newsletter-Tool.";
    form.reset();
  });
});

document.querySelectorAll("[data-video-src]").forEach((placeholder) => {
  placeholder.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.className = "video-frame";
    iframe.src = placeholder.dataset.videoSrc;
    iframe.title = placeholder.dataset.videoTitle || "Video";
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    placeholder.replaceWith(iframe);
  });
});

const routeData = {
  route: {
    center: [14.6, -35],
    zoom: 3,
    points: [
      [53.5511, 9.9937, "Start: Hamburg"],
      [28.1144, -15.4301, "Las Palmas: Proviant und Wetterfenster"],
      [14.6032, -61.0242, "Martinique: aktueller Standort"],
      [9.359, -79.901, "Panamakanal: naechster grosser Abschnitt"],
      [-17.6509, -149.426, "Tahiti: Pazifik-Ziel"],
      [-33.9249, 18.4241, "Kapstadt: Rueckweg nach Europa"]
    ]
  },
  highlights: {
    center: [18, -48],
    zoom: 3,
    points: [
      [35.9, -5.3, "Gibraltar: Tor zum Atlantik"],
      [28.1144, -15.4301, "Kanaren: Crewwechsel"],
      [16.265, -61.551, "Guadeloupe: Film- und Fototage"],
      [14.6032, -61.0242, "Martinique: Reparatur und Story Update"],
      [9.359, -79.901, "Colon: Panamakanal Vorbereitung"]
    ]
  },
  events: {
    center: [22, -24],
    zoom: 3,
    points: [
      [48.3904, -4.4861, "Brest: Sturm abgewettert"],
      [32.6669, -16.9241, "Madeira: besonderer Dank an private Unterstuetzer"],
      [20.0, -38.0, "Atlantik: Walbeobachtung"],
      [14.6032, -61.0242, "Martinique: Live-Abend mit Sponsoren"]
    ]
  }
};

const mapElement = document.getElementById("world-map");
let activeMap;
let activeLayer;

function drawMap(type = "route") {
  if (!mapElement || typeof L === "undefined") return;
  const data = routeData[type];
  if (!activeMap) {
    activeMap = L.map("world-map", { scrollWheelZoom: false }).setView(data.center, data.zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(activeMap);
  }
  if (activeLayer) activeLayer.remove();
  activeLayer = L.layerGroup().addTo(activeMap);
  const latLngs = data.points.map((point) => [point[0], point[1]]);
  if (type === "route") {
    L.polyline(latLngs, { color: "#006f78", weight: 4, opacity: 0.85 }).addTo(activeLayer);
  }
  data.points.forEach((point, index) => {
    const icon = L.divIcon({
      className: "",
      html: `<span style="display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:${index === 2 ? "#e6a526" : "#006f78"};color:white;border:2px solid white;box-shadow:0 4px 12px rgba(0,0,0,.25);font-weight:800">${index + 1}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    L.marker([point[0], point[1]], { icon }).bindPopup(point[2]).addTo(activeLayer);
  });
  activeMap.setView(data.center, data.zoom);
}

document.querySelectorAll("[data-map-type]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-map-type]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    drawMap(button.dataset.mapType);
  });
});

drawMap("route");


// LIKE SYSTEM
document.querySelectorAll(".like-button").forEach(btn => {
  const postId = btn.dataset.like; // унікальний ID поста
  const key = "likes_" + postId;
  const base = parseInt(btn.dataset.base);

  const countSpan = btn.querySelector(".like-count");

  let count = parseInt(localStorage.getItem(key)) || base;
  countSpan.textContent = count;

  btn.addEventListener("click", () => {
    count++;
    countSpan.textContent = count;
    btn.classList.add("liked");
    localStorage.setItem(key, count);
  });
});


// COMMENT SYSTEM
document.querySelectorAll("[data-comment-form]").forEach(form => {
  const postId = form.dataset.commentForm;
  const list = document.querySelector(`[data-comment-list="${postId}"]`);
  const key = "comments_" + postId;

  // Load existing comments
  let saved = JSON.parse(localStorage.getItem(key) || "[]");
  saved.forEach(c => addCommentToList(c, list));

  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = form.querySelector("input[name='name']").value.trim();
    const email = form.querySelector("input[name='email']").value.trim();
    const comment = form.querySelector("textarea[name='comment']").value.trim();

    if (!name || !email || !comment) return;

    const entry = {
      name,
      email,
      comment,
      date: new Date().toLocaleString()
    };

    saved.push(entry);
    localStorage.setItem(key, JSON.stringify(saved));

    addCommentToList(entry, list);
    form.reset();
  });
});

function addCommentToList(entry, list) {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="meta">${entry.name} – <span>${entry.date}</span></div>
    <div class="text">${entry.comment}</div>
  `;
  list.appendChild(li);
}
