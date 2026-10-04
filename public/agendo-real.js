/* Liga as páginas do agendo ao banco de dados Supabase e controle de planos */
(function () {
  var inFrame = window.parent && window.parent !== window;

  function go(path) {
    if (inFrame) {
      window.parent.postMessage({ type: "agendo:go", path: path }, "*");
    } else {
      window.location.href = path;
    }
  }

  // Intercepta cliques em links de rotas internas no iframe para navegar no app pai
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('javascript:')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http://') || href.startsWith('https://')) return;

    var cleanHref = href.split('?')[0].split('#')[0];
    if (
      cleanHref === '/planos' ||
      cleanHref === '/adm' ||
      cleanHref === '/admin' ||
      cleanHref === '/painel-agenda' ||
      cleanHref === '/agenda' ||
      cleanHref === '/app-cliente' ||
      cleanHref === '/funil' ||
      cleanHref === '/landingpage' ||
      cleanHref === '/'
    ) {
      if (inFrame) {
        e.preventDefault();
        go(href);
      }
    }
  }, true);

  window.setStudioPlan = function (planKey) {
    if (planKey) {
      try { localStorage.setItem('agendo_active_plan', planKey); } catch (e) {}
    }
    go("/planos");
  };

  window.executePlanUpgradeToPro = function () {
    go("/planos");
  };

  window.confirmFunnelPixPayment = function () {
    go("/planos");
  };

  // Guarda as listas da página (clientes, serviços, agenda, banners, crm...) para salvar no banco Supabase
  var LISTS = [
    "clients",
    "services",
    "crmClientsData",
    "crmClientsList",
    "banners",
    "daySchedule",
    "affiliatesList",
    "saasAds"
  ];

  var last = {};

  function snap() {
    LISTS.forEach(function (n) {
      var v;
      try {
        v = (0, eval)("typeof " + n + " !== 'undefined' ? " + n + " : undefined");
      } catch (e) {
        return;
      }
      if (v === undefined) return;
      var j;
      try {
        j = JSON.stringify(v);
      } catch (e) {
        return;
      }
      if (last[n] === undefined) {
        last[n] = j;
        return;
      }
      if (j !== last[n]) {
        last[n] = j;
        try {
          localStorage.setItem("agendo_data_" + n, j);
          window.dispatchEvent(new Event("storage"));
          if (inFrame) {
            window.parent.postMessage({ type: "agendo:data_changed", key: "agendo_data_" + n, value: j }, window.location.origin);
          }
        } catch (e) {}
      }
    });
  }

  setInterval(snap, 1200);
  window.addEventListener("beforeunload", snap);

  // Indicadores reais do painel do administrador
  try {
    var subs = JSON.parse(localStorage.getItem("agendo_data_admin_subscriptions") || "[]");
    var el = function (id) { return document.getElementById(id); };
    if (el("kpi-real-mrr")) {
      var active = subs.filter(function (x) { return x.status === "Ativa" || x.status === "active"; });
      var mrr = active.reduce(function (t, x) { return t + (x.cents || 0); }, 0) / 100;
      el("kpi-real-mrr").textContent = mrr.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      el("kpi-real-active").textContent = active.length + " contas";
      el("kpi-real-trial").textContent = subs.filter(function (x) { return x.status === "Teste" || x.status === "trialing"; }).length + " em teste";
    }
  } catch (e) {}
})();

// Verificação de permissões por plano (Matriz configurada pelo Super Admin)
(function () {
  function getActivePlan() {
    return localStorage.getItem("agendo_active_plan") || "plan-basic";
  }

  function isFeatureBlocked(featureKey) {
    try {
      var raw = localStorage.getItem("agendo_plan_matrix");
      if (!raw) {
        // Padrão: no plano básico alguns recursos avançados ficam bloqueados
        if (getActivePlan() === "plan-basic") {
          return ["client_crm", "anamnese_sheet", "gallery_public_media", "client_app_all", "affiliate_program"].includes(featureKey);
        }
        return false;
      }
      var matrix = JSON.parse(raw);
      var current = matrix[getActivePlan()];
      if (!current || !current.features) return false;
      var feat = current.features[featureKey];
      return feat && feat.enabled === false;
    } catch (e) {
      return false;
    }
  }

  window.isFeatureBlocked = isFeatureBlocked;

  // Bloqueio de Capa Cinema se não liberado no plano
  var S = Storage.prototype, oSet = S.setItem, oGet = S.getItem;
  S.setItem = function (k, v) {
    if (this === localStorage && k === "pageCoverLayout" && v === "cinema" && isFeatureBlocked("public_profile_3_formats")) {
      v = "classic";
    }
    return oSet.call(this, k, v);
  };
  S.getItem = function (k) {
    var v = oGet.call(this, k);
    if (this === localStorage && k === "pageCoverLayout" && v === "cinema" && isFeatureBlocked("public_profile_3_formats")) {
      return "classic";
    }
    return v;
  };

  document.addEventListener("click", function (e) {
    var cinemaBtn = e.target && e.target.closest && e.target.closest('[data-layout="cinema"],[onclick*="Cinema"]');
    if (cinemaBtn && isFeatureBlocked("public_profile_3_formats")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (confirm("A capa Cinema com foto e vídeo está bloqueada no plano atual. Deseja conhecer os planos disponíveis?")) {
        window.location.href = "/planos";
      }
      return;
    }
  }, true);
})();

// ========================================================
// SISTEMA DE ESTÉTICA DO APP, PALETA DO LOJISTA & MODO LIGHT
// ========================================================
(function () {
  function getLojistaTheme() {
    try {
      var raw = localStorage.getItem('agendo_custom_theme');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Padrão Light Mode com fundo branco, cards suaves e destaque rosa chic
    return {
      bgMode: 'light',
      bgColor: '#ffffff',
      cardColor: '#f4f4f6',
      accentColor: '#ff2d87',
      gradA: '#ff5f8a',
      gradB: '#ef1f4d'
    };
  }

  function isColorDark(hex) {
    if (!hex || typeof hex !== 'string') return false;
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    if (hex.length !== 6) return false;
    var r = parseInt(hex.substr(0, 2), 16) || 0;
    var g = parseInt(hex.substr(2, 2), 16) || 0;
    var b = parseInt(hex.substr(4, 2), 16) || 0;
    var brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 130;
  }

  function isClientAppPage() {
    var p = window.location.pathname.toLowerCase();
    var h = window.location.hash.toLowerCase();
    return p.includes('app-cliente') || p.includes('cliente') || h.includes('clientapp') || Boolean(document.querySelector('.app-viewport'));
  }

  function applyLojistaTheme(theme) {
    // Modo claro e personalização de cores somente no app do cliente; as demais páginas permanecem como o original
    if (!isClientAppPage()) {
      return;
    }

    theme = theme || getLojistaTheme();
    var isDark = theme.bgMode === 'dark' || isColorDark(theme.bgColor);
    var ink = isDark ? '#fafafa' : '#111113';
    var inkSoft = isDark ? '#d4d4d8' : '#27272a';
    var muted = isDark ? 'rgba(255,255,255,0.60)' : 'rgba(0,0,0,0.58)';
    var faint = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    var hairline = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';
    var hairlineSoft = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    var ctaFill = isDark ? '#ffffff' : '#111113';
    var ctaText = isDark ? '#000000' : '#ffffff';

    var root = document.documentElement;
    if (root) {
      root.style.setProperty('--canvas', theme.bgColor || '#ffffff');
      root.style.setProperty('--canvas-soft', theme.cardColor || '#f4f4f6');
      root.style.setProperty('--field', theme.cardColor || '#f4f4f6');
      root.style.setProperty('--raised', isDark ? '#1f1f28' : '#ffffff');
      root.style.setProperty('--component-bg', theme.cardColor || '#f4f4f6');
      root.style.setProperty('--ink', ink);
      root.style.setProperty('--ink-soft', inkSoft);
      root.style.setProperty('--muted', muted);
      root.style.setProperty('--faint', faint);
      root.style.setProperty('--hairline', hairline);
      root.style.setProperty('--hairline-soft', hairlineSoft);
      root.style.setProperty('--accent', theme.accentColor || '#ff2d87');
      root.style.setProperty('--pink', theme.accentColor || '#ff2d87');
      root.style.setProperty('--grad-a', theme.gradA || '#ff5f8a');
      root.style.setProperty('--grad-b', theme.gradB || '#ef1f4d');
      root.style.setProperty('--cta-fill', ctaFill);
      root.style.setProperty('--cta-text', ctaText);
      root.style.setProperty('--header-bg', isDark ? 'rgba(14, 14, 18, 0.92)' : 'rgba(255, 255, 255, 0.92)');
      root.style.setProperty('--nav-bg', isDark ? 'rgba(18, 18, 22, 0.94)' : 'rgba(255, 255, 255, 0.94)');
      root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }

    if (document.body) {
      document.body.style.backgroundColor = theme.bgColor || '#ffffff';
      document.body.style.color = ink;
    }

    var viewport = document.querySelector('.app-viewport');
    if (viewport) {
      viewport.style.backgroundColor = theme.bgColor || '#ffffff';
      viewport.style.color = ink;
    }
  }

  window.getLojistaTheme = getLojistaTheme;
  window.applyLojistaTheme = applyLojistaTheme;
  window.isColorDark = isColorDark;
  window.isClientAppPage = isClientAppPage;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { applyLojistaTheme(); });
  } else {
    applyLojistaTheme();
  }

  window.addEventListener('storage', function (e) {
    if (!e.key || e.key === 'agendo_custom_theme') {
      applyLojistaTheme();
    }
  });

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'agendo:theme_updated') {
      applyLojistaTheme(e.data.theme);
    }
  });
})();

