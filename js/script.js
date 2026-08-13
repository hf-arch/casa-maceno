/* ===========================================================
   Casa Maceno — script.js
   Funcionalidades:
   1. Menu mobile (abrir/fechar)
   2. Fechar menu ao clicar em um link
   3. Modal "Ver detalhes" dos produtos (dados editáveis abaixo)
   4. Destaque do link ativo no menu conforme o scroll (âncoras da home)
   5. Alternar tema claro/escuro (com preferência salva)
   6. Pesquisa (índice editável abaixo)
   7. Carrossel do hero da home
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- 0. TEMA CLARO/ESCURO ---------- */
  // O atributo data-theme já é aplicado no <head> (script inline) para evitar
  // "flash" de tema errado. Aqui só cuidamos do clique no botão e do texto acessível.
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "casaMacenoTheme";

  function updateThemeButtonState(theme) {
    if (!themeToggle) return;
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"
    );
  }

  updateThemeButtonState(document.documentElement.getAttribute("data-theme") || "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem(THEME_KEY, next);
      updateThemeButtonState(next);
    });
  }

  /* ---------- 0b. HERO / CARROSSEL ---------- */
  const heroTrack = document.getElementById("heroTrack");
  const heroDots = document.getElementById("heroDots");
  const heroPrev = document.getElementById("heroPrev");
  const heroNext = document.getElementById("heroNext");

  if (heroTrack && heroDots) {
    const heroSlides = heroTrack.querySelectorAll(".hero-slide");
    const heroDotButtons = heroDots.querySelectorAll("button");
    let heroIndex = 0;
    let heroTimer = null;

    function heroRender() {
      heroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;
      heroDotButtons.forEach((dot, i) => dot.classList.toggle("is-active", i === heroIndex));
      heroSlides.forEach((slide, i) => slide.setAttribute("aria-hidden", String(i !== heroIndex)));
    }

    function heroGoTo(index) {
      heroIndex = (index + heroSlides.length) % heroSlides.length;
      heroRender();
    }

    function heroRestartAutoplay() {
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(() => heroGoTo(heroIndex + 1), 7000);
    }

    if (heroPrev) heroPrev.addEventListener("click", () => { heroGoTo(heroIndex - 1); heroRestartAutoplay(); });
    if (heroNext) heroNext.addEventListener("click", () => { heroGoTo(heroIndex + 1); heroRestartAutoplay(); });
    heroDotButtons.forEach((dot, i) => {
      dot.addEventListener("click", () => { heroGoTo(i); heroRestartAutoplay(); });
    });

    // Arrastar com o dedo no celular: a faixa acompanha o dedo e, ao soltar,
    // avança/volta se o arraste passou de ~12% da largura, ou volta pro lugar.
    let touchStartX = 0;
    let touchCurrentX = 0;
    let isDragging = false;
    let trackWidth = 0;

    heroTrack.addEventListener("touchstart", (e) => {
      isDragging = true;
      touchStartX = e.touches[0].clientX;
      touchCurrentX = touchStartX;
      trackWidth = heroTrack.getBoundingClientRect().width;
      heroTrack.style.transition = "none";
      if (heroTimer) clearInterval(heroTimer);
    }, { passive: true });

    heroTrack.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      touchCurrentX = e.touches[0].clientX;
      const deltaX = touchCurrentX - touchStartX;
      const basePercent = -heroIndex * 100;
      const dragPercent = (deltaX / trackWidth) * 100;
      heroTrack.style.transform = `translateX(${basePercent + dragPercent}%)`;
    }, { passive: true });

    function heroEndDrag() {
      if (!isDragging) return;
      isDragging = false;
      heroTrack.style.transition = "";
      const deltaX = touchCurrentX - touchStartX;
      const threshold = trackWidth * 0.12;
      if (deltaX > threshold) {
        heroGoTo(heroIndex - 1);
      } else if (deltaX < -threshold) {
        heroGoTo(heroIndex + 1);
      } else {
        heroRender();
      }
      heroRestartAutoplay();
    }

    heroTrack.addEventListener("touchend", heroEndDrag);
    heroTrack.addEventListener("touchcancel", heroEndDrag);

    if (heroSlides.length > 1) {
      heroRestartAutoplay();
    }
  }

  /* ---------- 1. MENU MOBILE ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    /* ---------- 2. Fechar menu ao clicar em um link ---------- */
    // Só em links reais (<a>) — o botão "Conteúdos" não deve fechar o menu inteiro.
    mainNav.querySelectorAll("a.nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 2b. DROPDOWN "CONTEÚDOS" ---------- */
  document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
    const wrapper = toggle.closest(".has-dropdown");
    if (!wrapper) return;

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = wrapper.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  });

  document.addEventListener("click", (e) => {
    document.querySelectorAll(".has-dropdown.is-open").forEach((wrapper) => {
      if (!wrapper.contains(e.target)) {
        wrapper.classList.remove("is-open");
        const toggle = wrapper.querySelector(".dropdown-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".has-dropdown.is-open").forEach((wrapper) => {
      wrapper.classList.remove("is-open");
      const toggle = wrapper.querySelector(".dropdown-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- 3. MODAL "VER DETALHES" ---------- */
  // Edite/adicione aqui as informações reais de cada produto.
  // A chave precisa bater com o atributo data-product do card no HTML.
  const productData = {
    "9-de-janeiro": {
      title: "9 de Janeiro — Dia do Fico",
      text: "Apostila sobre o Dia do Fico: contexto histórico, personagens e sua importância para a Independência do Brasil."
    },
    "ouviram-do-ipiranga": {
      title: "Ouviram do Ipiranga",
      text: "Contexto, personagens e consequências do Grito do Ipiranga, explicados de forma simples e ilustrada."
    },
    "15-de-novembro": {
      title: "15 de Novembro — Golpe da República",
      text: "Entenda como se deu a Proclamação da República e o que mudou na vida dos brasileiros."
    },
    "tiradentes": {
      title: "Tiradentes — Herói ou vilão?",
      text: "Uma apostila que convida à reflexão sobre a Inconfidência Mineira e o papel de Tiradentes na nossa história."
    },
    "sabedoria-para-criancas": {
      title: "Sabedoria para crianças",
      text: "Um convite para as crianças aprenderem princípios de sabedoria bíblica de forma leve, ilustrada e fácil de entender.",
      link: "apostila-sabedoria-para-criancas.html"
    },
    "poesia-latim-caligrafia": {
      title: "Estudando Poesia, Latim e Caligrafia com Salmos",
      text: "Atividades que unem os Salmos ao estudo de poesia, noções de latim e prática de caligrafia.",
      link: "apostila-poesia-latim-caligrafia.html"
    },
    "bandeiras-e-bandeirantes": {
      title: "Bandeiras e Bandeirantes",
      text: "Uma apostila sobre os bandeirantes e a formação do território brasileiro, com atividades para fixar o conteúdo.",
      link: "apostila-bandeiras-e-bandeirantes.html"
    }
  };

  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const modalLink = document.getElementById("modalLink");

  function openModal(productKey) {
    const product = productData[productKey];
    if (!product || !modal) return;

    modalTitle.textContent = product.title;
    modalText.textContent = product.text;

    if (modalLink) {
      if (product.link) {
        modalLink.href = product.link;
        modalLink.style.display = "";
      } else {
        modalLink.removeAttribute("href");
        modalLink.style.display = "none";
      }
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".btn-details").forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest("[data-product]");
      if (card) openModal(card.dataset.product);
    });
  });

  // Best-sellers: o card inteiro (agora um <button>) abre o modal
  document.querySelectorAll(".feature-card[data-product]").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.product));
  });

  document.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  /* ---------- 3b. PESQUISA ---------- */
  // Índice de tudo que pode ser encontrado pela busca. "url" é sempre relativo
  // à raiz do site — o prefixo certo (nada, ou "../") é calculado automaticamente
  // a partir do src de script.js na própria página, então funciona em qualquer pasta.
  const searchIndex = [
    { title: "Sabedoria para crianças", category: "Apostilas", url: "apostilas/sabedoria-para-criancas.html" },
    { title: "Estudando Poesia, Latim e Caligrafia com Salmos", category: "Apostilas", url: "apostilas/poesia-latim-caligrafia.html" },
    { title: "Bandeiras e Bandeirantes", category: "Apostilas", url: "apostilas/bandeiras-e-bandeirantes.html" },
    { title: "Todas as Apostilas", category: "Categoria", url: "apostilas/index.html" },
    { title: "Planner 2025", category: "Planners", url: "planners/2025.html" },
    { title: "Planner 2026", category: "Planners", url: "planners/2026.html" },
    { title: "Planner 2027", category: "Planners", url: "planners/2027.html" },
    { title: "Todos os Planners", category: "Categoria", url: "planners/index.html" },
    { title: "Clube Maravilhamento", category: "Cursos", url: "cursos/clube-maravilhamento.html" },
    { title: "Pais Educadores", category: "Cursos", url: "cursos/pais-educadores.html" },
    { title: "Aprendendo Poesia com Fábulas", category: "Cursos", url: "cursos/aprendendo-poesia-com-fabulas.html" },
    { title: "Todos os Cursos", category: "Categoria", url: "cursos/index.html" },
    { title: "História do Brasil — 2 a 4 anos", category: "Categoria", url: "historia-do-brasil/2-a-4.html" },
    { title: "13 de Maio — A História Bem Contada", category: "História do Brasil", url: "historia-do-brasil/13-de-maio.html" },
    { title: "O Descobrimento do Brasil", category: "História do Brasil", url: "historia-do-brasil/descobrimento-do-brasil.html" },
    { title: "História do Brasil — 5 a 7 anos", category: "Categoria", url: "historia-do-brasil/5-a-7.html" },
    { title: "A Chegada da Família Real", category: "História do Brasil", url: "historia-do-brasil/chegada-familia-real.html" },
    { title: "A Bandeira do Brasil", category: "História do Brasil", url: "historia-do-brasil/bandeira-do-brasil.html" },
    { title: "História do Brasil — 8 a 11 anos", category: "Categoria", url: "historia-do-brasil/8-a-11.html" },
    { title: "A Revolução de 1930", category: "História do Brasil", url: "historia-do-brasil/revolucao-de-1930.html" },
    { title: "A Semana de Arte Moderna", category: "História do Brasil", url: "historia-do-brasil/semana-de-arte-moderna.html" },
    { title: "Toda a História do Brasil para Pequenos", category: "Categoria", url: "historia-do-brasil/index.html" },
    { title: "9 de Janeiro — Dia do Fico", category: "Best-seller", url: "index.html#best-sellers" },
    { title: "Ouviram do Ipiranga", category: "Best-seller", url: "index.html#best-sellers" },
    { title: "15 de Novembro — Golpe da República", category: "Best-seller", url: "index.html#best-sellers" },
    { title: "Tiradentes", category: "Best-seller", url: "index.html#best-sellers" },
    { title: "Sobre nós", category: "Página", url: "sobre.html" }
  ];

  function normalize(str) {
    return str
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  // Descobre o prefixo relativo certo ("" na raiz, "../" dentro de uma pasta)
  // reaproveitando o src do próprio script.js, que já está correto em cada página.
  function getBasePrefix() {
    const scriptEl = document.querySelector('script[src$="js/script.js"]');
    if (!scriptEl) return "";
    return scriptEl.getAttribute("src").replace(/js\/script\.js$/, "");
  }

  const searchToggle = document.getElementById("searchToggle");
  const searchModal = document.getElementById("searchModal");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchToggle && searchModal && searchInput && searchResults) {
    const basePrefix = getBasePrefix();

    function renderResults(query) {
      const q = normalize(query.trim());

      if (!q) {
        searchResults.innerHTML = '<p class="search-empty">Digite para pesquisar apostilas, planners, cursos e mais.</p>';
        return;
      }

      const matches = searchIndex.filter((item) => normalize(item.title).includes(q) || normalize(item.category).includes(q));

      if (!matches.length) {
        searchResults.innerHTML = '<p class="search-empty">Nada encontrado. Tente outra palavra.</p>';
        return;
      }

      searchResults.innerHTML = "";
      matches.forEach((item) => {
        const a = document.createElement("a");
        a.className = "search-result";
        a.href = basePrefix + item.url;
        a.innerHTML = `<span class="search-result-title">${item.title}</span><span class="search-result-category">${item.category}</span>`;
        searchResults.appendChild(a);
      });
    }

    function openSearch() {
      searchModal.classList.add("is-open");
      searchModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      renderResults("");
      searchInput.value = "";
      setTimeout(() => searchInput.focus(), 50);
    }

    function closeSearch() {
      searchModal.classList.remove("is-open");
      searchModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    searchToggle.addEventListener("click", openSearch);
    searchInput.addEventListener("input", () => renderResults(searchInput.value));

    searchModal.querySelectorAll("[data-close-search]").forEach((el) => {
      el.addEventListener("click", closeSearch);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeSearch();
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !searchModal.classList.contains("is-open")) {
        const active = document.activeElement;
        const isTyping = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
        if (!isTyping) {
          e.preventDefault();
          openSearch();
        }
      }
    });
  }

  /* ---------- 4. LINK ATIVO NO MENU CONFORME SCROLL ---------- */
  // Só mexe em links que são âncoras da própria página (href começando com "#").
  // Links para outras páginas (ex: "apostilas.html") já vêm com a classe "is-active"
  // marcada direto no HTML quando é a página atual, e não devem ser tocados aqui.
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  const anchorLinks = Array.from(navLinks).filter((link) => (link.getAttribute("href") || "").startsWith("#"));

  if (sections.length && anchorLinks.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            anchorLinks.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
  }

});
