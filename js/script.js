/* ===========================================================
   Casa Maceno — script.js
   Funcionalidades:
   1. Menu mobile (abrir/fechar)
   2. Fechar menu ao clicar em um link
   3. Modal "Ver detalhes" dos produtos (dados editáveis abaixo)
   4. Destaque do link ativo no menu conforme o scroll (âncoras da home)
   5. Alternar tema claro/escuro (com preferência salva)
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
