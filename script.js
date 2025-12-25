document.addEventListener("DOMContentLoaded", () => {
  /* ------------------ Mobile menu ------------------ */
  const menuBtn = document.getElementById("menu-btn");
  const navLinks = document.getElementById("nav-links");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {
      const expanded = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
    });
  }

  /* ------------------ Smooth scroll for anchor links ------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return; // safety
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // close mobile menu if open
      if (navLinks && navLinks.classList.contains("active")) {
        navLinks.classList.remove("active");
        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ------------------ Contact form (simulasi) ------------------ */
  const form = document.getElementById("contact-form");
  const status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // small UX: show loading then success
      status.textContent = "Mengirim...";
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;
      setTimeout(() => {
        status.textContent = "Pesan berhasil dikirim!.";
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => (status.textContent = ""), 4000);
      }, 900);
    });
  }

  /* ------------------ Scroll to top button ------------------ */
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      // use class for fade-in via CSS if desired
      if (window.scrollY > 200) {
        scrollTopBtn.style.display = "block";
      } else {
        scrollTopBtn.style.display = "none";
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------ Theme (Dark Mode) ------------------ */
  const themeToggle = document.getElementById("themeToggle");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  // init theme: check localStorage > system preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.body.classList.add("dark");
    if (themeToggle) {
      themeToggle.textContent = "☀️";
      themeToggle.setAttribute("aria-pressed", "true");
    }
  } else {
    if (themeToggle) {
      themeToggle.textContent = "🌙";
      themeToggle.setAttribute("aria-pressed", "false");
    }
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.body.classList.toggle("dark");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  /* ------------------ About: Read More toggle ------------------ */
  const aboutToggle = document.getElementById("aboutToggle");
  const moreText = document.getElementById("moreText");
  if (aboutToggle && moreText) {
    aboutToggle.addEventListener("click", () => {
      const expanded = aboutToggle.getAttribute("aria-expanded") === "true";
      aboutToggle.setAttribute("aria-expanded", String(!expanded));
      if (expanded) {
        moreText.hidden = true;
        aboutToggle.textContent = "Baca selengkapnya";
      } else {
        moreText.hidden = false;
        aboutToggle.textContent = "Sembunyikan";
      }
      // smooth scroll to keep context (hanya jika elemen tersembunyi menjadi terlihat)
      if (!expanded) {
        // Scroll setelah DOM diperbarui
        setTimeout(() => {
             moreText.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 0);
      }
    });
  }

  /* ------------------ Testimonials (manual slider) ------------------ */
  const testiList = document.querySelector(".testimonial-list");
  const testiCards = document.querySelectorAll(".testimonial-card");
  const prevBtn = document.querySelector(".testi-nav.prev");
  const nextBtn = document.querySelector(".testi-nav.next");
  const dotsWrap = document.querySelector(".testi-dots");
  let currentTesti = 0;
  let testiAutoplay = null;
  const totalTesti = testiCards.length || 0;
  const cardWidth = testiCards.length > 0 ? testiCards[0].offsetWidth : 0;
  const cardsPerView = window.innerWidth > 768 ? 2 : 1;
  const maxIndex = totalTesti - cardsPerView;

  // Build dots
  if (dotsWrap && totalTesti > 0) {
    for (let i = 0; i < totalTesti - (cardsPerView - 1); i++) {  
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testi-dot" + (i === 0 ? " active" : "");
      dot.dataset.index = String(i);
      dot.setAttribute("aria-label", `Lihat testimoni ${i + 1}`);
      dot.addEventListener("click", () => {
        goToTesti(i);
        restartAutoplay();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = document.querySelectorAll(".testi-dot");
    dots.forEach((d, idx) =>
      d.classList.toggle("active", idx === currentTesti)
    );
  }
  function goToTesti(index) {
    if (!testiList || totalTesti === 0) return;
    let newIndex = Math.max(0, Math.min(index, maxIndex));
    currentTesti = newIndex;
    const pergeseran = currentTesti * (testiCards[0].offsetWidth + (testiList.clientWidth / (cardsPerView > 1 ? cardsPerView : 1)) * 0.04); // Estimasi pergeseran
    // smooth scroll by element offset
    testiList.scroll({
        left: currentTesti * testiCards[0].offsetWidth * 1.1, 
        behavior: 'smooth'
    });
    
    updateDots();
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      goToTesti(currentTesti - 1);
      restartAutoplay();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToTesti(currentTesti + 1);
      restartAutoplay();
    });
  }
  
  window.addEventListener('resize', () => {
    goToTesti(currentTesti);
  });


  // autoplay
  function startAutoplay() {
    if (testiAutoplay) clearInterval(testiAutoplay);
    if (totalTesti > cardsPerView) { 
        testiAutoplay = setInterval(() => {
          goToTesti(currentTesti < maxIndex ? currentTesti + 1 : 0);
        }, 5000);
    }
  }
  function restartAutoplay() {
    startAutoplay();
  }
  if (totalTesti > 0) startAutoplay();


  /* ------------------ Fade-in on scroll ------------------ */
    const fadeEls = document.querySelectorAll(".fade-in");
    const observerOptions = {
      threshold: 0.30 
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible"); 
        }
      });
    }, observerOptions);

    fadeEls.forEach((el) => observer.observe(el));
  });