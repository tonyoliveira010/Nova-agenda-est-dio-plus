/* Liga as páginas do agendo ao banco de dados Supabase e controle de planos */
(function () {
  var inFrame = window.parent && window.parent !== window;

  function go(path) {
    if (inFrame) {
      window.parent.postMessage({ type: "agendo:go", path: path }, window.location.origin);
    } else {
      window.location.href = path;
    }
  }

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
