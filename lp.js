// ============================================================
// lp.js — Cida Fialho Depilação
// Boas práticas aplicadas:
//   - Nomes de variáveis e funções descritivos
//   - Sem variáveis globais vazadas no escopo window
//   - Estado do agendamento encapsulado num único objeto
//   - Erros inline em vez de alert()
//   - Swipe touch no carrossel
//   - Esc no hambúrguer só ativa com dispositivo apontador (mouse/teclado físico)
// ============================================================


// ============================================================
// 1. DADOS DE SERVIÇOS
//    Fonte única da verdade — usada pelo modal de agendamento
//    e pelo modal de preços.
// ============================================================
const SERVICOS = {
  facial: [
    { id: "buco",        name: "Buço",        sexo: ["f"],      price: 15,  time: 15 },
    { id: "sobrancelha", name: "Sobrancelha", sexo: ["f", "m"], price: 25,  time: 30 },
    { id: "barba",       name: "Barba",       sexo: ["m"],      price: 20,  time: 30 },
  ],
  corporal: [
    { id: "axila",   name: "Axila",   sexo: ["f", "m"], price: 30, time: 15 },
    { id: "peito",   name: "Peito",   sexo: ["m"],      price: 45, time: 20 },
    { id: "perna",   name: "Perna",   sexo: ["f", "m"], price: 50, time: 45 },
    { id: "bracos",  name: "Braços",  sexo: ["f", "m"], price: 40, time: 30 },
    { id: "bumbum",  name: "Bumbum",  sexo: ["f", "m"], price: 35, time: 30 },
    { id: "costas",  name: "Costas",  sexo: ["f", "m"], price: 45, time: 30 },
    { id: "virilha", name: "Virilha", sexo: ["f", "m"], price: 60, time: 45 },
  ],
  combos: [
    { id: "facial-feminino",    name: "Combo Facial Feminino",    sexo: ["f"],      price: 35,  time: 45,  desc: "Buço e Sobrancelha" },
    { id: "facial-masculino",   name: "Combo Facial Masculino",   sexo: ["m"],      price: 50,  time: 60,  desc: "Sobrancelha e Barba" },
    { id: "corporal-feminino",  name: "Combo Corporal Feminino",  sexo: ["f"],      price: 180, time: 165, desc: "Axila, perna, braços, virilha/bumbum" },
    { id: "corporal-masculino", name: "Combo Corporal Masculino", sexo: ["m"],      price: 200, time: 180, desc: "Costas, axila, perna, braços, virilha/bumbum" },
    { id: "pacote-completo",    name: "Pacote Completo",          sexo: ["f", "m"], price: 240, time: 180, desc: "Facial e corporal" },
  ],
};


// ============================================================
// 2. ESTADO GLOBAL DO AGENDAMENTO
//    Tudo que o usuário vai preenchendo fica aqui.
//    Os getters calculam o total automaticamente a partir da lista.
// ============================================================
const agendamento = {
  sexo: null,
  servicos: [],  // cada item: { id, name, price, time }

  // "get" cria uma propriedade calculada — não precisa chamar como função
  get precoTotal() { return this.servicos.reduce((acumulador, servico) => acumulador + servico.price, 0); },
  get tempoTotal()  { return this.servicos.reduce((acumulador, servico) => acumulador + servico.time,  0); },

  reset() {
    this.sexo = null;
    this.servicos = [];
  },
};


// ============================================================
// 3. UTILITÁRIOS
// ============================================================

/**
 * Busca um elemento pelo ID e avisa no console se não existir.
 * Evita repetir document.getElementById() em todo o código.
 */
function buscarElemento(id) {
  const elemento = document.getElementById(id);
  if (!elemento) console.warn(`[lp.js] Elemento #${id} não encontrado no HTML.`);
  return elemento;
}

/** Formata um número como moeda brasileira: 35 → "R$ 35" */
function formatarMoedaBR(valor) {
  return `R$ ${valor.toFixed(0)}`;
}

/** Retorna a data de hoje no formato YYYY-MM-DD usando o fuso local (não UTC). */
function obterDataHojeISO() {
  const hoje = new Date();
  const ano  = hoje.getFullYear();
  const mes  = String(hoje.getMonth() + 1).padStart(2, "0"); // getMonth() começa em 0
  const dia  = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Exibe uma mensagem de erro dentro de um container, sem usar alert().
 * Cria o parágrafo de erro se ainda não existir, e some após 4 segundos.
 */
function exibirErroInline(containerElemento, mensagem) {
  if (!containerElemento) return;

  let elementoErro = containerElemento.querySelector(".erro-inline");
  if (!elementoErro) {
    elementoErro = document.createElement("p");
    elementoErro.className = "erro-inline";
    containerElemento.appendChild(elementoErro);
  }

  elementoErro.textContent = mensagem;
  elementoErro.style.display = "block";

  setTimeout(() => { elementoErro.style.display = "none"; }, 4000);
}

/** Esconde a mensagem de erro de um container (chamado ao navegar para outra etapa). */
function limparErroInline(containerElemento) {
  const elementoErro = containerElemento?.querySelector(".erro-inline");
  if (elementoErro) elementoErro.style.display = "none";
}


// ============================================================
// 4. MENU HAMBÚRGUER
//    - Abre/fecha ao clicar no ícone
//    - Fecha ao clicar em qualquer link do menu (comportamento mobile)
//    - Fecha com Esc SOMENTE quando há dispositivo apontador (tablet/desktop
//      com teclado físico). Em celulares sem teclado físico, Esc não existe.
// ============================================================
(function iniciarMenuHamburguer() {
  const botaoHamburguer = buscarElemento("hamburger");
  const listaLinks      = buscarElemento("nav-links");
  if (!botaoHamburguer || !listaLinks) return;

  // Detecta se o dispositivo tem mouse ou teclado físico (hover preciso)
  // Em celulares touch puros, matchMedia("(hover: hover)") retorna false
  const dispositivoTemTeclado = window.matchMedia("(hover: hover)").matches;

  function alternarMenu() {
    const estaAberto = listaLinks.classList.toggle("active");
    botaoHamburguer.classList.toggle("open");
    botaoHamburguer.setAttribute("aria-expanded", estaAberto);
  }

  function fecharMenu() {
    listaLinks.classList.remove("active");
    botaoHamburguer.classList.remove("open");
    botaoHamburguer.setAttribute("aria-expanded", "false");
  }

  botaoHamburguer.addEventListener("click", alternarMenu);

  // Esc só faz sentido com teclado físico conectado
  if (dispositivoTemTeclado) {
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && listaLinks.classList.contains("active")) {
        fecharMenu();
      }
    });
  }

  // Fecha ao clicar em qualquer link (scroll para seção no mobile)
  listaLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (listaLinks.classList.contains("active")) fecharMenu();
    });
  });
})();


// ============================================================
// 5. CARROSSEL DE DEPOIMENTOS
//    - Dots de navegação criados dinamicamente
//    - Autoplay pausado por interação e retomado após 8 s
//    - Pausa quando a aba do navegador fica em segundo plano
//    - Swipe touch (arrastar para o lado no celular)
//    - Respeita a preferência "reduzir animações" do sistema
// ============================================================
(function iniciarCarrossel() {
  const trilha         = buscarElemento("sliderTrack");
  const containerDots  = buscarElemento("dotsContainer");
  const botaoProximo   = buscarElemento("nextBtn");
  const botaoAnterior  = buscarElemento("prevBtn");
  if (!trilha || !containerDots || !botaoProximo || !botaoAnterior) return;

  const cartoes = trilha.querySelectorAll(".testimonial-card");
  if (cartoes.length === 0) return;

  let indiceAtual          = 0;
  let idAutoPlay           = null;
  let pausadoPorInteracao  = false;

  // --- Cria os dots de navegação ---
  cartoes.forEach((_, indice) => {
    const dot = document.createElement("button");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Depoimento ${indice + 1}`);
    dot.classList.add("dot");
    dot.setAttribute("aria-selected", indice === 0 ? "true" : "false");
    if (indice === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      irParaCartao(indice);
      pausarAutoPlay();
    });
    containerDots.appendChild(dot);
  });

  const dots = containerDots.querySelectorAll(".dot");

  function atualizarDotsAtivos() {
    dots.forEach((dot, indice) => {
      dot.classList.toggle("active", indice === indiceAtual);
      dot.setAttribute("aria-selected", indice === indiceAtual ? "true" : "false");
    });
  }

  function irParaCartao(indiceDestino) {
    // O "%" garante que ao passar do último, volta para o primeiro (e vice-versa)
    indiceAtual = (indiceDestino + cartoes.length) % cartoes.length;
    const larguraCartao = cartoes[0].offsetWidth;
    trilha.style.transform = `translateX(-${indiceAtual * larguraCartao}px)`;
    atualizarDotsAtivos();
  }

  function pausarAutoPlay() {
    clearInterval(idAutoPlay);
    pausadoPorInteracao = true;
    // Retoma automaticamente após 8 segundos sem interação
    setTimeout(() => {
      if (pausadoPorInteracao) {
        pausadoPorInteracao = false;
        iniciarAutoPlay();
      }
    }, 8000);
  }

  function iniciarAutoPlay() {
    clearInterval(idAutoPlay);
    // Respeita a configuração "Reduzir movimento" do sistema operacional
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    idAutoPlay = setInterval(() => irParaCartao(indiceAtual + 1), 5000);
  }

  botaoProximo.addEventListener("click",   () => { irParaCartao(indiceAtual + 1); pausarAutoPlay(); });
  botaoAnterior.addEventListener("click",  () => { irParaCartao(indiceAtual - 1); pausarAutoPlay(); });

  // Recalcula posição ao girar o celular ou redimensionar janela
  window.addEventListener("resize", () => irParaCartao(indiceAtual));

  // Pausa o autoplay quando o usuário muda de aba
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(idAutoPlay);
    else if (!pausadoPorInteracao) iniciarAutoPlay();
  });

  // --- Suporte a swipe (arrastar dedo) ---
  let posicaoInicialTouch = 0;

  trilha.addEventListener("touchstart", (evento) => {
    posicaoInicialTouch = evento.touches[0].clientX;
  }, { passive: true }); // passive: true melhora performance da rolagem

  trilha.addEventListener("touchend", (evento) => {
    const posicaoFinal     = evento.changedTouches[0].clientX;
    const distanciaArrastad = posicaoInicialTouch - posicaoFinal;

    // Só muda de slide se o dedo andou mais de 50px (evita cliques acidentais)
    if (Math.abs(distanciaArrastad) > 50) {
      distanciaArrastad > 0
        ? irParaCartao(indiceAtual + 1)  // arrastou para esquerda → próximo
        : irParaCartao(indiceAtual - 1); // arrastou para direita  → anterior
      pausarAutoPlay();
    }
  });

  iniciarAutoPlay();
})();


// ============================================================
// 6. MODAL DE PREÇOS (separado do agendamento)
//    Abre ao clicar em .js-abrir-precos
//    Mostra tabela de preços filtrada por sexo (feminino/masculino)
// ============================================================
(function iniciarModalPrecos() {
  const modalPrecos    = buscarElemento("modalPrecos");
  const fecharPrecos   = buscarElemento("closeModalPrecos");
  if (!modalPrecos) return;

  function abrirModalPrecos() {
    modalPrecos.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  function fecharModalPrecos() {
    modalPrecos.style.display = "none";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".js-abrir-precos").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      abrirModalPrecos();
      // Começa sempre na aba feminino
      exibirTabelaPrecos("f");
    });
  });

  if (fecharPrecos) fecharPrecos.addEventListener("click", fecharModalPrecos);
  modalPrecos.addEventListener("click", (evento) => {
    if (evento.target === modalPrecos) fecharModalPrecos();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && modalPrecos.style.display === "flex") fecharModalPrecos();
  });

  // Botões de sexo dentro do modal de preços
  modalPrecos.querySelectorAll(".btn-sexo-preco").forEach((botao) => {
    botao.addEventListener("click", () => {
      modalPrecos.querySelectorAll(".btn-sexo-preco").forEach((b) => b.classList.remove("active"));
      botao.classList.add("active");
      exibirTabelaPrecos(botao.dataset.sexo);
    });
  });
})();

/**
 * Renderiza as linhas da tabela de preços filtrando por sexo.
 * @param {string} sexo - "f" para feminino, "m" para masculino
 */
function exibirTabelaPrecos(sexo) {
  const corpoTabela = buscarElemento("corpoTabelaPrecos");
  if (!corpoTabela) return;

  corpoTabela.innerHTML = "";

  // Percorre todas as categorias e junta os itens do sexo selecionado
  const categorias = ["facial", "corporal", "combos"];

  categorias.forEach((categoria) => {
    const itensDaCategoria = SERVICOS[categoria].filter((item) =>
      item.sexo.includes(sexo)
    );

    // Linha de cabeçalho da categoria
    if (itensDaCategoria.length > 0) {
      const linhaTitulo = document.createElement("tr");
      linhaTitulo.className = "linha-categoria";
      const nomesCategoria = { facial: "Facial", corporal: "Corporal", combos: "Combos e Pacotes" };
      linhaTitulo.innerHTML = `<td colspan="3">${nomesCategoria[categoria]}</td>`;
      corpoTabela.appendChild(linhaTitulo);
    }

    itensDaCategoria.forEach((item) => {
      const linha = document.createElement("tr");
      const ehCombo = categoria === "combos";
      if (ehCombo) linha.classList.add("linha-combo");

      const minutosParaTexto = (minutos) => {
        if (minutos < 60) return `${minutos} min`;
        const horas = Math.floor(minutos / 60);
        const resto = minutos % 60;
        return resto > 0 ? `~${horas}h${resto}` : `~${horas}h`;
      };

      linha.innerHTML = `
        <td>${item.name}${item.desc ? `<small>${item.desc}</small>` : ""}</td>
        <td class="preco-celula">${formatarMoedaBR(item.price)}</td>
        <td class="duracao-celula">${minutosParaTexto(item.time)}</td>
      `;
      corpoTabela.appendChild(linha);
    });
  });
}


// ============================================================
// 7. MODAL DE AGENDAMENTO (3 etapas)
// ============================================================
(function iniciarModalAgendamento() {
  const modalAgendamento = buscarElemento("modalAgendamento");
  const botaoFechar      = buscarElemento("closeModal");
  const tituloModal      = buscarElemento("modalTitle");
  if (!modalAgendamento) return;

  // Títulos de cada etapa — indexados por número da etapa
  const titulosEtapa = [
    "Selecione o seu sexo para começar:",
    "Escolha as áreas que deseja depilar:",
    "Quase lá! Confirme seus dados:",
  ];

  function mostrarEtapa(idEtapa) {
    ["step0", "step1", "step2"].forEach((id) => {
      const etapaElemento = buscarElemento(id);
      if (etapaElemento) etapaElemento.style.display = id === idEtapa ? "block" : "none";
    });
    atualizarBarraProgresso(idEtapa);
  }

  function atualizarBarraProgresso(idEtapa) {
    // Extrai o número do id: "step2" → 2
    const numeroEtapa = parseInt(idEtapa.replace("step", ""), 10);

    document.querySelectorAll(".progress-step").forEach((passo, indice) => {
      passo.classList.toggle("active",   indice <= numeroEtapa);
      passo.classList.toggle("completo", indice <  numeroEtapa);
    });

    if (tituloModal) tituloModal.textContent = titulosEtapa[numeroEtapa] ?? "";
  }

  // --- Abrir modal de agendamento ---
  document.querySelectorAll(".js-abrir-modal").forEach((botao) => {
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      agendamento.reset();
      atualizarResumoServicos();

      // Desmarca opções de sexo de sessões anteriores
      document.querySelectorAll('input[name="sexo"]').forEach((radio) => (radio.checked = false));

      mostrarEtapa("step0");
      modalAgendamento.style.display = "flex";
      document.body.style.overflow = "hidden";

      // Coloca o foco no primeiro elemento interativo (acessibilidade)
      setTimeout(() => { modalAgendamento.querySelector("input, button")?.focus(); }, 50);
    });
  });

  // --- Fechar modal de agendamento ---
  function fecharModalAgendamento() {
    modalAgendamento.style.display = "none";
    document.body.style.overflow = "";
  }

  if (botaoFechar) botaoFechar.addEventListener("click", fecharModalAgendamento);

  modalAgendamento.addEventListener("click", (evento) => {
    if (evento.target === modalAgendamento) fecharModalAgendamento();
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && modalAgendamento.style.display === "flex") {
      fecharModalAgendamento();
    }
  });

  // --- Etapa 0 → 1: validar sexo selecionado ---
  window.selecionarSexoEContinuar = function () {
    const sexoSelecionado = document.querySelector('input[name="sexo"]:checked')?.value;
    if (!sexoSelecionado) {
      exibirErroInline(buscarElemento("step0"), "Por favor, selecione uma opção antes de avançar.");
      return;
    }
    agendamento.sexo = sexoSelecionado;
    mostrarEtapa("step1");
    window.changeTab("facial");
  };

  // --- Etapa 1 → 2: validar ao menos um serviço escolhido ---
  buscarElemento("nextStep")?.addEventListener("click", () => {
    if (agendamento.servicos.length === 0) {
      exibirErroInline(buscarElemento("step1"), "Selecione ao menos uma área para continuar.");
      return;
    }
    mostrarEtapa("step2");
    configurarDataMinima();
  });

  // --- Botões "Voltar" navegam entre etapas ---
  window.irParaEtapa = function (idEtapaAtual, idEtapaDestino) {
    mostrarEtapa(idEtapaDestino);
    limparErroInline(buscarElemento(idEtapaAtual));
  };

  // --- Confirmar agendamento e abrir WhatsApp ---
  buscarElemento("confirm")?.addEventListener("click", () => {
    const nome     = (buscarElemento("name")?.value  || "").trim();
    const telefone = (buscarElemento("phone")?.value || "").replace(/\D/g, ""); // remove tudo que não é dígito
    const data     = buscarElemento("date")?.value   || "";
    const horario  = buscarElemento("container-horarios")?.dataset.horarioSelecionado || "";
    const etapa2   = buscarElemento("step2");

    // Valida cada campo separadamente para dar mensagem específica
    if (!nome)                   { exibirErroInline(etapa2, "Por favor, informe seu nome."); return; }
    if (telefone.length < 10)    { exibirErroInline(etapa2, "Informe um WhatsApp válido com DDD."); return; }
    if (!data)                   { exibirErroInline(etapa2, "Escolha uma data para o atendimento."); return; }
    if (!horario)                { exibirErroInline(etapa2, "Selecione um horário disponível."); return; }

    const [ano, mes, dia] = data.split("-");
    const dataFormatada   = `${dia}/${mes}/${ano}`;
    const listaNomes      = agendamento.servicos.map((servico) => servico.name).join(", ");
    const totalFormatado  = formatarMoedaBR(agendamento.precoTotal);

    const mensagemWhatsApp =
      `Olá, Cida! 👋 Quero agendar:\n` +
      `📋 Serviço(s): ${listaNomes}\n` +
      `📅 Data: ${dataFormatada} às ${horario}\n` +
      `💰 Total estimado: ${totalFormatado}\n` +
      `👤 Nome: ${nome}`;

    // TODO: substituir pelo número real da Cida antes de publicar
    const urlWhatsApp = `https://wa.me/5531988762922?text=${encodeURIComponent(mensagemWhatsApp)}`;
    window.open(urlWhatsApp, "_blank", "noopener");
  });
})();


// ============================================================
// 8. RENDERIZAÇÃO DE SERVIÇOS NO MODAL DE AGENDAMENTO
// ============================================================

/** Atualiza o rodapé do modal com os serviços escolhidos e o total. */
function atualizarResumoServicos() {
  const textoServico = buscarElemento("selectedService");
  const textoTotal   = buscarElemento("total");
  if (!textoServico || !textoTotal) return;

  textoServico.textContent = agendamento.servicos.length === 0
    ? "Nenhum selecionado"
    : agendamento.servicos.map((servico) => servico.name).join(", ");

  textoTotal.textContent = `Total: ${formatarMoedaBR(agendamento.precoTotal)}`;
}

/**
 * Troca a aba ativa (Facial / Corporal / Combos) e renderiza os itens filtrados.
 * Exposta no window porque o HTML chama onclick="changeTab('facial')".
 */
window.changeTab = function (nomeAba) {
  const containerServicos = buscarElemento("services");
  if (!containerServicos) return;

  // Marca visualmente a aba ativa
  document.querySelectorAll(".tabs button").forEach((botaoAba) => {
    const nomeNormalizado = botaoAba.textContent
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // remove acentos para comparação
    const estaAtiva = nomeNormalizado === nomeAba
      || botaoAba.getAttribute("onclick")?.includes(`'${nomeAba}'`);
    botaoAba.classList.toggle("active", estaAtiva);
  });

  containerServicos.innerHTML = "";

  const itensFiltrados = (SERVICOS[nomeAba] || []).filter((item) =>
    item.sexo.includes(agendamento.sexo)
  );

  if (itensFiltrados.length === 0) {
    containerServicos.innerHTML = `<p class="sem-servicos">Nenhum serviço disponível nesta categoria.</p>`;
    return;
  }

  itensFiltrados.forEach((item) => {
    const cartaoServico = document.createElement("div");
    cartaoServico.className = "service-item";
    cartaoServico.setAttribute("role", "listitem");

    const jaSelecionado = agendamento.servicos.some((servico) => servico.id === item.id);
    if (jaSelecionado) cartaoServico.classList.add("selected");

    cartaoServico.innerHTML = `
      <span class="service-name">
        ${item.name}
        ${item.desc ? `<br><span class="combos">${item.desc}</span>` : ""}
      </span>
      <span class="service-price">${formatarMoedaBR(item.price)}</span>
      <button
        class="btn-select"
        aria-pressed="${jaSelecionado}"
        aria-label="${jaSelecionado ? "Remover" : "Adicionar"} ${item.name}"
      >${jaSelecionado ? "✓" : "+"}</button>
    `;

    cartaoServico.querySelector(".btn-select").addEventListener("click", function () {
      const indiceNaLista = agendamento.servicos.findIndex((servico) => servico.id === item.id);
      const estaSelecionado = indiceNaLista > -1;

      if (estaSelecionado) {
        agendamento.servicos.splice(indiceNaLista, 1);
        cartaoServico.classList.remove("selected");
        this.textContent = "+";
        this.setAttribute("aria-pressed", "false");
        this.setAttribute("aria-label", `Adicionar ${item.name}`);
      } else {
        agendamento.servicos.push({ id: item.id, name: item.name, price: item.price, time: item.time });
        cartaoServico.classList.add("selected");
        this.textContent = "✓";
        this.setAttribute("aria-pressed", "true");
        this.setAttribute("aria-label", `Remover ${item.name}`);
      }

      atualizarResumoServicos();
    });

    containerServicos.appendChild(cartaoServico);
  });
};


// ============================================================
// 9. CALENDÁRIO E GERAÇÃO DE HORÁRIOS
// ============================================================

/** Define a data mínima do input como hoje (impede selecionar datas passadas). */
function configurarDataMinima() {
  const campoData = buscarElemento("date");
  if (!campoData) return;
  campoData.min = obterDataHojeISO();
}

document.addEventListener("DOMContentLoaded", () => {
  configurarDataMinima();

  const campoDiaSelecionado = buscarElemento("date");
  if (!campoDiaSelecionado) return;

  campoDiaSelecionado.addEventListener("change", (evento) => {
    const dataSelecionada    = evento.target.value; // formato: "YYYY-MM-DD"
    const containerHorarios  = buscarElemento("container-horarios");
    if (!dataSelecionada) return;

    // VALIDAÇÃO 1: impede datas no passado (proteção extra além do atributo min)
    const [anoDigitado, mesDigitado, diaDigitado] = dataSelecionada.split("-").map(Number);
    const dataDigitada = new Date(anoDigitado, mesDigitado - 1, diaDigitado);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataDigitada < hoje) {
      exibirErroInline(buscarElemento("step2"), "Você não pode selecionar uma data no passado.");
      evento.target.value = "";
      if (containerHorarios) containerHorarios.innerHTML = "";
      return;
    }

    // VALIDAÇÃO 2: a Cida não atende aos domingos
    // "T00:00:00" garante que o fuso local seja usado (sem T, pode dar problema no Safari)
    const diaSemana = new Date(`${dataSelecionada}T00:00:00`).getDay(); // 0 = domingo
    if (diaSemana === 0) {
      exibirErroInline(buscarElemento("step2"), "A Cida não atende aos domingos. Escolha outra data.");
      evento.target.value = "";
      if (containerHorarios) containerHorarios.innerHTML = "";
      return;
    }

    // Busca agendamentos já salvos no localStorage para bloquear horários ocupados
    const todosAgendamentos    = JSON.parse(localStorage.getItem("agendamentos") || "[]");
    const agendamentosDoDia    = todosAgendamentos.filter((ag) => ag.date === dataSelecionada);
    calcularHorariosDisponiveis(dataSelecionada, diaSemana, agendamentosDoDia);
  });
});

/**
 * Gera todas as fatias de horário do dia e classifica cada uma como
 * disponível ou bloqueada, aplicando as regras de negócio da Cida.
 */
function calcularHorariosDisponiveis(dataSelecionada, diaSemana, agendamentosDoDia) {
  const ABERTURA_EM_MINUTOS   = 8 * 60;          // 08:00 → 480 min
  const FECHAMENTO_EM_MINUTOS = (diaSemana === 6 ? 12 : 18) * 60; // sáb: 720, sem: 1080
  const ALMOCO_INICIO         = 12 * 60;          // 12:00 → 720 min
  const ALMOCO_FIM            = 13 * 60;          // 13:00 → 780 min
  const DURACAO_SERVICO       = agendamento.tempoTotal;

  const listaHorarios = [];

  for (let minutoAtual = ABERTURA_EM_MINUTOS; minutoAtual < FECHAMENTO_EM_MINUTOS; minutoAtual += 15) {
    const minutoTermino = minutoAtual + DURACAO_SERVICO;

    // Converte minutos para texto "HH:MM"
    const horaTexto   = String(Math.floor(minutoAtual / 60)).padStart(2, "0");
    const minutoTexto = String(minutoAtual % 60).padStart(2, "0");
    const horarioFormatado = `${horaTexto}:${minutoTexto}`;

    let estaBloqueado = false;
    let motivoBloqueio = "";

    // REGRA A: horário dentro do almoço
    if (minutoAtual >= ALMOCO_INICIO && minutoAtual < ALMOCO_FIM) {
      estaBloqueado = true;
      motivoBloqueio = "almoco";

    // REGRA B: serviço começa antes do almoço mas invade o horário de almoço
    } else if (minutoAtual < ALMOCO_INICIO && minutoTermino > ALMOCO_INICIO) {
      estaBloqueado = true;
      motivoBloqueio = "insuficiente";

    // REGRA C: serviço ultrapassa o horário de fechamento
    } else if (minutoTermino > FECHAMENTO_EM_MINUTOS) {
      estaBloqueado = true;
      motivoBloqueio = "expediente";

    // REGRA D: colisão com agendamento já existente no dia
    } else {
      for (const agendamentoExistente of agendamentosDoDia) {
        const [horaAg, minutoAg] = agendamentoExistente.time.split(":").map(Number);
        const inicioAgendamento  = horaAg * 60 + minutoAg;
        const fimAgendamento     = inicioAgendamento + agendamentoExistente.duration;

        // Sobreposição: o novo começa antes de o antigo terminar E termina depois de o antigo começar
        if (minutoAtual < fimAgendamento && minutoTermino > inicioAgendamento) {
          estaBloqueado  = true;
          motivoBloqueio = "ocupado";
          break;
        }
      }
    }

    listaHorarios.push({ horario: horarioFormatado, bloqueado: estaBloqueado, motivo: motivoBloqueio });
  }

  renderizarBotoesHorario(listaHorarios);
}

/** Desenha os botões de horário na tela com base na lista calculada. */
function renderizarBotoesHorario(listaHorarios) {
  const containerHorarios = buscarElemento("container-horarios");
  if (!containerHorarios) return;

  delete containerHorarios.dataset.horarioSelecionado; // limpa seleção anterior
  containerHorarios.innerHTML = "";

  const legendaBloqueio = {
    almoco:       "Almoço",
    insuficiente: "Sem tempo",
    expediente:   "Fora do horário",
    ocupado:      "Ocupado",
  };

  listaHorarios.forEach((item) => {
    const botaoHorario = document.createElement("button");
    botaoHorario.type = "button";
    botaoHorario.classList.add("btn-fatia-horario");

    if (item.bloqueado) {
      botaoHorario.disabled = true;
      botaoHorario.classList.add("horario-indisponivel");
      botaoHorario.setAttribute("aria-label", `${item.horario} — ${legendaBloqueio[item.motivo] || "Indisponível"}`);
      botaoHorario.innerHTML = `${item.horario}<small>${legendaBloqueio[item.motivo] || "–"}</small>`;
    } else {
      botaoHorario.textContent = item.horario;
      botaoHorario.setAttribute("aria-label", `Selecionar horário ${item.horario}`);
      botaoHorario.addEventListener("click", () => {
        // Remove a marcação de todos os horários antes de marcar o novo
        containerHorarios.querySelectorAll(".btn-fatia-horario").forEach((b) => b.classList.remove("selecionado"));
        botaoHorario.classList.add("selecionado");
        containerHorarios.dataset.horarioSelecionado = item.horario;
      });
    }

    containerHorarios.appendChild(botaoHorario);
  });

  // Aviso especial: nenhum horário disponível no dia inteiro
  const todosOcupados = listaHorarios.every((item) => item.bloqueado);
  if (todosOcupados) {
    const avisoSemHorario = document.createElement("p");
    avisoSemHorario.className = "sem-servicos";
    avisoSemHorario.textContent = "Não há horários disponíveis neste dia. Por favor, escolha outra data.";
    containerHorarios.appendChild(avisoSemHorario);
  }
}
