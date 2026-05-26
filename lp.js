// ================================
// MEDIA QUERIES
//=================================
// MENU DE NAVEGAÇÃO //
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const heroSection = document.querySelector('.hero'); // Certifique-se que sua section tem a classe .hero

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('open');

  // Removida a lógica de empurrar a hero para garantir a sobreposição limpa
});

// ==================================================================================================

// =========================
// SLIDES DA SEÇÃO DE DEPOIMENTOS
// =========================

const track = document.getElementById('sliderTrack');
const cards = document.querySelectorAll('.testimonial-card');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const dotsContainer = document.getElementById('dotsContainer');

let index = 0;

// Cria os dots dinamicamente
cards.forEach((_, i) => {
  const dot = document.createElement('div');
  dot.classList.add('dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => moveToSlide(i));
  dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dot');

function updateDots() {
  dots.forEach(dot => dot.classList.remove('active'));
  if (dots[index]) dots[index].classList.add('active');
}

function moveToSlide(i) {
  index = i;
  // Pega a largura exata de UM card para calcular o deslocamento
  // Isso evita que o carrossel "vaze" por causa de gaps ou paddings
  const cardWidth = cards[0].offsetWidth;
  track.style.transform = `translateX(-${index * cardWidth}px)`;
  updateDots();
}

// Escuta redimensionamento da tela para recalcular o deslocamento
// Essencial para quando o usuário vira o celular (orientação)
window.addEventListener('resize', () => moveToSlide(index));

nextBtn.addEventListener('click', () => {
  index = (index + 1) % cards.length;
  moveToSlide(index);
});

prevBtn.addEventListener('click', () => {
  index = (index - 1 + cards.length) % cards.length;
  moveToSlide(index);
});

// Auto-play com proteção para não bugar durante a interação
let autoPlay = setInterval(() => {
  nextBtn.click();
}, 5000);

// Para o auto-play se o usuário clicar nos botões (melhora a UX)
[nextBtn, prevBtn, dotsContainer].forEach(el => {
  el.addEventListener('mouseenter', () => clearInterval(autoPlay));
});
// ======================================================================================================


// =========================
// DADOS COLETADOS PARA GERAR O AGENDAMENTO 
// =========================
let selectedServices = [];
let total = 0;

//INFORMA OS TIPOS DE AREAS COM SEUS RESPECTIVOS VALORES E TEMPO DE SERVIÇO
const data = {
  facial: [
    { id: "buco", name: "Buço", sexo: ["f"], price: 15, time: 15 },
    { id: "sobrancelha", name: "Sobrancelha", sexo: ["f", "m"], price: 25, time: 30 },
    { id: "barba", name: "Barba", sexo: ["m"], price: 20, time: 30 },
  ],
  corporal: [
    { id: "axila", name: "Axila", sexo: ["f", "m"], price: 30, time: 15 },
    { id: "perna", name: "Perna", sexo: ["f", "m"], price: 50, time: 45 },
    { id: "bracos", name: "Braços", sexo: ["f", "m"], price: 40, time: 30 },
    { id: "bumbum", name: "Bumbum", sexo: ["f", "m"], price: 35, time: 30 },
    { id: "costas", name: "Costas", sexo: ["f", "m"], price: 45, time: 30 },
    { id: "virilha", name: "Virilha", sexo: ["f", "m"], price: 60, time: 45 }
  ],
  combos: [
    { id: "facial-feminino", name: "Combo Facial Feminino <br/> <span class='combos'> (Buço e Sobrancelha) </span>", sexo: ["f"], price: 35, time: 45 },
    { id: "facial-masculino", name: "Combo Facial Masculino <br/> <span class='combos'> (Sobrancelha e barba) </span>", sexo: ["m"],price: 50, time: 60 },
    { id: "corporal-feminino", name: "Combo Corporal Feminino <br/> <span class='combos'> (Axila, perna, braços, virilha/bumbum) </span>", sexo: ["f"], price: 180, time: 165 },
    { id: "corporal-masculino", name: "Combo Corporal Masculino <br/> <span class='combos'> (Costas, axila, perna, braços, virilha/bumbum) </span>", sexo: ["m"], price: 200, time: 180 },
    { id: "corporal-completo", name: "Pacote Completo <br/> <span class='combos'>  (facial e corporal) </span>", sexo: ["f","m"], price: 240, time: 180 }
  ]
};

// ==========================================
// ESTADO GLOBAL DO AGENDAMENTO
// ==========================================
// Função para bloquear datas passadas no calendário
function configurarDataMinima() {
  const campoData = document.getElementById("date");
  if (!campoData) return;

  const hoje = new Date();

  // Pegamos o ano, mês e dia no fuso horário local
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Mês começa em 0, por isso +1
  const dia = String(hoje.getDate()).padStart(2, '0');

  // O formato exigido pelo input type="date" é estritamente AAAA-MM-DD
  const dataFormatada = `${ano}-${mes}-${dia}`;

  // Aplica o limite mínimo no input
  campoData.min = dataFormatada;
}

// Executa a função assim que a página terminar de carregar
window.addEventListener("DOMContentLoaded", configurarDataMinima);

let agendamento = {
  sexo: null
};

// Vinculando o container correto do seu modal
const modal = document.getElementById("modalAgendamento");
const closeModal = document.getElementById("closeModal");

// =========================
// LÓGICA DE ABRIR MODAL
// =========================
document.querySelectorAll(".js-abrir-modal").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    // Mostra o modal em formato flexbox
    if (modal) modal.style.display = "flex";

    // RESET DE DADOS ANTERIORES
    selectedServices = [];
    total = 0;
    totalTime = 0;
    agendamento.sexo = null;

    document.getElementById("selectedService").innerText = "Nenhum selecionado";
    document.getElementById("total").innerText = "Total: R$ 0";

    // Desmarca opções antigas de sexo
    document.querySelectorAll('input[name="sexo"]').forEach(radio => radio.checked = false);

    // O SEGREDO CORRIGIDO: Só a Etapa 0 (Gênero) começa visível!
    document.getElementById("step0").style.display = "block";
    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "none";

    // Define o título inicial correto
    document.getElementById("modalTitle").innerText = "Selecione o seu sexo para começar:";

    // Guarda temporariamente qual categoria o botão pediu (corporal, combos ou facial)
    const servicoAbra = btn.getAttribute("data-servico") || "facial";
    modal.dataset.abaInicial = servicoAbra;
  });
});

// =========================
// LOGICA DE FECHAR MODAL
// =========================
if (closeModal) {
  closeModal.onclick = () => {
    modal.style.display = "none";
  };
}

window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// ==========================================
// NAVEGAÇÃO ENTRE ETAPAS (Avançar e Voltar)
// ==========================================
function irParaEtapa(etapaAnterior, etapaAtual) {
  document.getElementById(etapaAnterior).style.display = "none";
  document.getElementById(etapaAtual).style.display = "block";

  // Altera os títulos dinamicamente para cada etapa fazer sentido
  const modalTitle = document.getElementById("modalTitle");
  if (etapaAtual === "step0") modalTitle.innerText = "Por favor, selecione o seu sexo antes de começar";
  if (etapaAtual === "step1") modalTitle.innerText = "Escolha as áreas que deseja depilar";
  if (etapaAtual === "step2") modalTitle.innerText = "Finalizar agendamento";
}

// VALIDAÇÃO DA ETAPA 0: Salva o gênero e carrega os serviços certos
function selecionarSexoEContinuar() {
  const sexo = document.querySelector('input[name="sexo"]:checked')?.value;
  if (!sexo) {
    alert("Por favor, selecione seu gênero antes de avançar.");
    return;
  }

  // Salva na memória global para o filtro usar
  agendamento.sexo = sexo;

  // Esconde o step0 e mostra o step1
  irParaEtapa("step0", "step1");

  // Carrega a aba padrão ou a aba que o botão clicado na LP solicitou
  const abaPreDefinida = modal.dataset.abaInicial || "facial";
  changeTab(abaPreDefinida);
}

// ==========================================
// FILTRO INTELIGENTE E RENDERIZAÇÃO
// ==========================================
function obterServicosPorSexo(categoria, sexoSelecionado) {
  return data[categoria].filter(item => {
    if (Array.isArray(item.sexo)) {
      return item.sexo.includes(sexoSelecionado);
    }
    return item.sexo === sexoSelecionado;
  });
}

function changeTab(tab) {
  const container = document.getElementById("services");
  if (!container) return;

  // Ativar aba visualmente
  document.querySelectorAll(".tabs button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase() === tab || btn.getAttribute("onclick")?.includes(tab)) {
      btn.classList.add("active");
    }
  });

  container.innerHTML = "";

  // Busca os dados filtrados pela nossa função
  const servicosFiltrados = obterServicosPorSexo(tab, agendamento.sexo);

  servicosFiltrados.forEach(item => {
    const div = document.createElement("div");
    div.className = "service-item";

    // Mantém selecionado se o usuário já tiver clicado antes e mudado de aba
    const jaSelecionado = selectedServices.some(s => s.name === item.name);
    if (jaSelecionado) div.classList.add("selected");

    div.innerHTML = `
      <span>${item.name} - R$ ${item.price}</span>
      <button class="btn-select">${jaSelecionado ? '✓' : '+'}</button>
    `;

    const btn = div.querySelector(".btn-select");
    btn.addEventListener("click", () => {
      div.classList.toggle("selected");
      selectService(item.name, item.price);
      btn.innerText = div.classList.contains("selected") ? "✓" : "+";
    });

    container.appendChild(div);
  });
}



// =========================
// AGENDAMENTO
// Faz o monitoramento do campo de data (input type="date" id="date"). 
// Assim que a cliente escolher um dia, o JavaScript vai entrar em ação para validar o dia da semana e 
// buscar no localStorage os agendamentos já existentes para essa data.
// =========================

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");

  if (dateInput) {
    dateInput.addEventListener("change", (e) => {
      const dataSelecionada = e.target.value; // Formato: "YYYY-MM-DD"
      if (!dataSelecionada) return;

      // ========================================================
      // PASSO 1: SEGURANÇA - EVITAR DATAS NO PASSADO
      // ========================================================
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias
      
      // Converte a data selecionada para um objeto Date para comparação pura de dias
      const [ano, mes, dia] = dataSelecionada.split('-').map(Number);
      const dataDigitada = new Date(ano, mes - 1, dia);

      if (dataDigitada < hoje) {
        alert("Você não pode selecionar uma data no passado!");
        e.target.value = ""; // Limpa o campo de data
        document.getElementById("container-horarios").innerHTML = ""; // Limpa os horários na tela
        return; // Para a execução aqui e não carrega nada
      }

      // ========================================================
      // PASSO 2: REGRA DE NEGÓCIO - EVITAR DOMINGOS
      // ========================================================
      // Adicionamos "T00:00:00" para garantir a data exata que a cliente clicou sem erro de fuso.
      const dataObjeto = new Date(`${dataSelecionada}T00:00:00`);
      const diaDaSemana = dataObjeto.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

      if (diaDaSemana === 0) {
        alert("A Cida não realiza atendimentos aos domingos. Por favor, escolha outra data.");
        e.target.value = ""; // Limpa o campo de data
        document.getElementById("container-horarios").innerHTML = ""; // Limpa os horários na tela
        return; // Para a execução aqui
      }

      // ========================================================
      // PASSO 3: CARREGAR AGENDAMENTOS E GERAR HORÁRIOS
      // ========================================================
      // Busca os agendamentos do LocalStorage (se não existirem, cria um array vazio)
      const todosAgendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

      // Filtra trazendo apenas os agendamentos que pertencem ao dia escolhido
      const agendamentosDoDia = todosAgendamentos.filter(agendamento => agendamento.date === dataSelecionada);

      // Se passou em todas as barreiras acima, o motor calcula e exibe os horários livres!
      calcularHorariosDisponiveis(dataSelecionada, diaDaSemana, agendamentosDoDia);
    });
  }
});


// PASSO 3: Motor de Geração e Filtro de Horários
function calcularHorariosDisponiveis(dataSelecionada, diaDaSemana, agendamentosDoDia) {
  // 1. Definição do expediente padrão da Cida
  const horaAbertura = 8;
  const horaFechamento = (diaDaSemana === 6) ? 12 : 18; // Sábado fecha às 12h, dias de semana às 18h
  const inicioAlmocoPadrao = 12;
  const fimAlmocoPadrao = 13;

  const horariosResultado = [];

  // 2. Laço que gera as fatias de 15 em 15 minutos (convertendo tudo para minutos para facilitar o cálculo)
  const minutosInicio = horaAbertura * 60;
  const minutosFim = horaFechamento * 60;

  for (let minutosAtuais = minutosInicio; minutosAtuais < minutosFim; minutosAtuais += 15) {
    // Transforma os minutos atuais de volta para o formato de texto "HH:MM"
    const hrs = Math.floor(minutosAtuais / 60).toString().padStart(2, "0");
    const mins = (minutosAtuais % 60).toString().padStart(2, "0");
    const horarioTexto = `${hrs}:${mins}`;

    // Calcula em que minuto esse atendimento terminaria com base no serviço selecionado atualmente
    const minutosTermino = minutosAtuais + totalTime;

    let estaBloqueado = false;
    let motivoBloqueio = "";

    // REGRA A: Bloqueio Padrão do Almoço (12:00 às 13:00)
    // Se o serviço começar entre 12h e 13h, bloqueia por padrão
    if (minutosAtuais >= (inicioAlmocoPadrao * 60) && minutosAtuais < (fimAlmocoPadrao * 60)) {
      estaBloqueado = true;
      motivoBloqueio = "Horário de almoço.";
    }

    // REGRA B: Almoço Dinâmico (Sua ideia inteligente!)
    // Se o serviço começar antes das 12:00, mas o tempo dele invadir o almoço (passar de 12:00), bloqueia!
    if (minutosAtuais < (inicioAlmocoPadrao * 60) && minutosTermino > (inicioAlmocoPadrao * 60)) {
      estaBloqueado = true;
      motivoBloqueio = " Tempo insuficiente para depilar esta área. Por favor, selecione outro horário.";
    }

    // REGRA C: Fim do Expediente Dinâmico
    // Se o serviço ultrapassar o horário de fechamento da Cida, ele não cabe na agenda
    if (minutosTermino > minutosFim) {
      estaBloqueado = true;
      motivoBloqueio = "Fora do expediente (Seg a Sex: 8h-18h / Sáb: 8h-12h)";
    }

    // REGRA D: Choque com Agendamentos Ocupados Anteriormente
    // Varre os agendamentos salvos no dia para ver se este novo serviço bate de frente com algum deles
    agendamentosDoDia.forEach(agendamento => {
      const [agHrs, agMins] = agendamento.time.split(":").map(Number);
      const agInicioMinutos = (agHrs * 60) + agMins;
      const agTerminoMinutos = agInicioMinutos + agendamento.duration;

      // Existe sobreposição se o novo serviço começar antes do antigo terminar 
      // E terminar depois que o antigo começou
      if (minutosAtuais < agTerminoMinutos && minutosTermino > agInicioMinutos) {
        estaBloqueado = true;
        motivoBloqueio = "Já existe outro agendamento neste horário. Por favor, selecione outro.";
      }
    });

    // Guarda o horário gerado com o seu respectivo status
    horariosResultado.push({
      time: horarioTexto,
      blocked: estaBloqueado,
      reason: motivoBloqueio
    });
  }

  // Aqui o Passo 3 termina e envia a lista processada para o Passo 4 (Renderizar na tela)
  renderizarBotoesHorario(horariosResultado);
}

// PASSO 4: RENDERIZAR NA TELA O AGENDAMENTO
function renderizarBotoesHorario(horariosResultado) {
  const container = document.getElementById("container-horarios");
  if (!container) return;

  container.innerHTML = "";

  horariosResultado.forEach(item => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.classList.add("btn-fatia-horario");
    botao.innerText = item.time;

    if (item.blocked) {
      botao.disabled = true;
      botao.classList.add("horario-indisponivel");

      if (item.reason.includes("almoço")) {
        botao.innerText = `${item.time} (Almoço)`;
      } else if (item.reason.includes("expediente")) {
        botao.innerText = `${item.time} (Fora)`;
      } else {
        botao.innerText = `${item.time} (Ocupado)`;
      }
    } else {
      botao.addEventListener("click", () => {
        document.querySelectorAll(".btn-fatia-horario").forEach(b => b.classList.remove("selecionado"));
        botao.classList.add("selecionado");
        container.dataset.horarioSelecionado = item.time;
      });
    }

    container.appendChild(botao);
  });
}

// ==========================================
// FUNÇÃO DE SELEÇÃO DE SERVIÇOS
// ==========================================
function selectService(name, price) {
  const index = selectedServices.findIndex(s => s.name === name);

  if (index > -1) {
    // Se já estava selecionado, remove da lista
    selectedServices.splice(index, 1);
  } else {
    // Se não estava, adiciona
    selectedServices.push({ name, price });
  }

  // Recalcula o valor total
  total = selectedServices.reduce((sum, service) => sum + service.price, 0);

  // Atualiza os textos do resumo no modal
  const txtServico = document.getElementById("selectedService");
  const txtTotal = document.getElementById("total");

  if (selectedServices.length === 0) {
    txtServico.innerText = "Nenhum selecionado";
  } else {
    txtServico.innerText = selectedServices.map(s => s.name).join(", ");
  }

  txtTotal.innerText = `Total: R$ ${total}`;
}

// Lógica de avançar da Etapa 1 para a Etapa 2
document.getElementById("nextStep")?.addEventListener("click", () => {
  if (selectedServices.length === 0) {
    alert("Por favor, selecione ao menos um serviço antes de avançar.");
    return;
  }
  irParaEtapa("step1", "step2");
});

// =========================
// CONFIRMAR
// =========================
const confirmBtn = document.getElementById("confirm");

if (confirmBtn) {
  confirmBtn.onclick = () => {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const date = document.getElementById("date").value;

    // Busca o horário selecionado no container de botões dinâmicos
    const containerHorarios = document.getElementById("container-horarios");
    const time = containerHorarios ? containerHorarios.dataset.horarioSelecionado : "";

    if (!name || !phone || !date || !time) {
      alert("Preencha todos os campos (Não esqueça de selecionar um horário disponível)");
      return;
    }

    const services = selectedServices.map(item => item.name).join(", ");

    // Formata a data para o padrão brasileiro (DD/MM/YYYY) para a mensagem ficar mais bonita
    const [ano, mes, dia] = date.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`;

    const message =
      `Olá, Cida! Quero agendar depilação na(s) área(s): ${services} no dia ${date} às ${time}. Meu nome é ${name}`;

    const url =
      `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };
}
