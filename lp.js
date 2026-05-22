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
    if(dots[index]) dots[index].classList.add('active');
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
// ELEMENTOS
// =========================
const modal = document.getElementById("modalPrecos");
const closeModal = document.querySelector(".close-modal");

// =========================
// DADOS COLETADOS PARA GERAR O AGENDAMENTO 
// =========================
let selectedServices = [];
let total = 0;

//INFORMA OS TIPOS DE AREAS COM SEUS RESPECTIVOS VALORES E TEMPO DE SERVIÇO
const data = {
  facial: [
    { id: "buco", name: "Buço", price: 15, time: 15 },
    { id: "sobrancelha", name: "Sobrancelha", price: 25, time: 30 },
    { id: "barba-feminina", name: "Barba feminina", price: 20, time: 30 },
    { id: "barba-masculina", name: "Barba masculina", price: 20, time: 30 }
  ],
  corporal: [
    { id: "axila", name: "Axila", price: 30, time: 15 },
    { id: "perna", name: "Perna", price: 50, time: 45 },
    { id: "bracos", name: "Braços", price: 40, time: 30 },
    { id: "bumbum", name: "Bumbum", price: 35, time: 30 },
    { id: "costas", name: "Costas", price: 45, time: 30 },
    { id: "virilha", name: "Virilha", price: 60, time: 45 }
  ],
  combos: [
    { id: "facial-feminino", name: "Combo Facial Feminino", price: 35, time: 45 },
    { id: "facial-masculino", name: "Combo Facial Masculino", price: 50, time: 60 },
    { id: "corporal-feminino", name: "Combo Corporal Feminino", price: 180, time: 165 },
    { id: "corporal-feminino-completo", name: "Combo Corporal Feminino Completo", price: 220, time: 180 },
    { id: "corporal-masculino", name: "Combo Corporal Masculino", price: 200, time: 180 },
    { id: "corporal-masculino-completo", name: "Combo Corporal Masculino Completo", price: 240, time: 180 }
  ]
};

// =========================
// ABRIR MODAL
// =========================
document.querySelectorAll(".js-abrir-modal").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    modal.style.display = "flex";

    // RESET
    selectedServices = [];
    total = 0;

    document.getElementById("selectedService").innerText = "Nenhum selecionado";
    document.getElementById("total").innerText = "Total: R$ 0";

    document.getElementById("step1").style.display = "block";
    document.getElementById("step2").style.display = "none";

    document.getElementById("modalTitle").innerText = "Escolha seu serviço";

    const servico = btn.getAttribute("data-servico");

    if (servico === "corporal") {
      changeTab("corporal");
    } else if (servico === "combos") {
      changeTab("combos");
    } else {
      changeTab("facial");
    }
  });
});

// =========================
// FECHAR MODAL
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

// =========================
// FUNÇÕES
// =========================
function changeTab(tab) {
  const container = document.getElementById("services");
  if (!container) return;

  // ativar aba
  document.querySelectorAll(".tabs button").forEach(btn => {
    btn.classList.remove("active");
    if (btn.textContent.toLowerCase() === tab) {
      btn.classList.add("active");
    }
  });

  container.innerHTML = "";

  data[tab].forEach(item => {
    const div = document.createElement("div");
    div.className = "service-item";

    div.innerHTML = `
      <span>${item.name} - R$ ${item.price}</span>
      <button class="btn-select">+</button>
    `;

    const btn = div.querySelector(".btn-select");

    btn.addEventListener("click", () => {
      div.classList.toggle("selected");
      selectService(item.name, item.price);
    });

    container.appendChild(div);
  });
}

// =========================
// SELEÇÃO MÚLTIPLA
// =========================
function selectService(name, price) {
  const index = selectedServices.findIndex(item => item.name === name);

  if (index !== -1) {
    selectedServices.splice(index, 1);
  } else {
    // Procura o serviço nas categorias do objeto "data" para achar o tempo dele
    let serviceData = null;
    ['facial', 'corporal', 'combos'].forEach(tab => {
      const found = data[tab].find(item => item.name === name);
      if (found) serviceData = found;
    });

    selectedServices.push({ 
      name, 
      price, 
      time: serviceData ? serviceData.time : 15 // Padrão 15 min caso não ache
    });
  }

  total = selectedServices.reduce((sum, item) => sum + item.price, 0);

  // Calcula a soma dos minutos dos serviços selecionados
  let rawTime = selectedServices.reduce((sum, item) => sum + item.time, 0);
  // Limita o bloco da agenda em até 3 horas (180 minutos)
  totalTime = rawTime > 180 ? 180 : rawTime;

  const names = selectedServices.map(item => item.name).join(", ");

  document.getElementById("selectedService").innerText =
    selectedServices.length > 0
      ? "Selecionado: " + names
      : "Nenhum selecionado";

  document.getElementById("total").innerText =
    "Total: R$ " + total;
}

// =========================
// ETAPA 2
// =========================
const nextStepBtn = document.getElementById("nextStep");

if (nextStepBtn) {
  nextStepBtn.onclick = () => {
    if (selectedServices.length === 0) {
      alert("Selecione pelo menos um serviço");
      return;
    }

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";

    document.getElementById("modalTitle").innerText =
      "Finalizar agendamento";
  };
}

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
// =======================================================================================================

// =========================
// AGENDAMENTO
// Faz o monitoramento do campo de data (input type="date" id="date"). 
// Assim que a cliente escolher um dia, o JavaScript vai entrar em ação para validar o dia da semana e 
// buscar no localStorage os agendamentos já existentes para essa data.
// =========================

// PASSO 2: Esta função guarda o carregamento do documento para garantir que os elementos existem
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");

 if (dateInput) {
    dateInput.addEventListener("change", (e) => {
      const dataSelecionada = e.target.value; // Formato: "YYYY-MM-DD"
      if (!dataSelecionada) return;

      // O "new Date" puro pode dar erro de fuso horário. 
      // Adicionamos "T00:00:00" para garantir a data exata que a cliente clicou.
      const dataObjeto = new Date(`${dataSelecionada}T00:00:00`);
      const diaDaSemana = dataObjeto.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

      // Regra 1: Bloquear Domingo completamente
      if (diaDaSemana === 0) {
        alert("A Cida não realiza atendimentos aos domingos. Por favor, escolha outra data.");
        e.target.value = ""; // Limpa o campo
        return;
      }

      // Busca os agendamentos do LocalStorage (se não existirem, cria um array vazio)
      const todosAgendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];

      // Filtra trazendo apenas os agendamentos que pertencem ao dia escolhido
      const agendamentosDoDia = todosAgendamentos.filter(agendamento => agendamento.date === dataSelecionada);

      // Aqui chamamos o Passo 3 (O motor de cálculo), passando os dados que ele precisa
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
  // Busca o container onde os horários serão desenhados
  // (Criaremos esse id "container-horarios" no HTML logo em seguida)
  const container = document.getElementById("container-horarios");
  if (!container) return;

  // Limpa os botões gerados na consulta anterior para não acumular
  container.innerHTML = "";

  // Percorre cada fração de tempo calculada pelo motor
  horariosResultado.forEach(item => {
    // Cria o elemento do botão
    const botao = document.createElement("button");
    botao.type = "button";
    botao.classList.add("btn-fatia-horario");
    
    // Define o texto inicial do botão (ex: "08:15")
    botao.innerText = item.time;

    // Se o motor marcou que este horário está bloqueado pelas regras
    if (item.blocked) {
      botao.disabled = true;
      botao.classList.add("horario-indisponivel");
      
      // Se o motivo for porque o serviço não cabe antes do almoço ou do fim do expediente,
      // ou se já estiver ocupado por outra pessoa, adicionamos a observação curta
      if (item.reason === "Tempo insuficiente antes do almoço") {
        botao.innerText = `${item.time} (Tempo insuficiente)`;
      } else if (item.reason === "Ocupado") {
        botao.innerText = `${item.time} (Ocupado)`;
      } else {
        botao.innerText = `${item.time} (Reservado)`;
      }
    } else {
      // Se o horário estiver livre, adicionamos o evento de clique para a cliente selecionar
      botao.addEventListener("click", () => {
        // Remove a seleção visual de qualquer outro botão de horário que foi clicado antes
        document.querySelectorAll(".btn-fatia-horario").forEach(b => b.classList.remove("selecionado"));
        
        // Destaca apenas o botão atual que foi escolhido
        botao.classList.add("selecionado");
        
        // Guarda o horário selecionado numa variável oculta ou atributo para o Passo 5 salvar
        container.dataset.horarioSelecionado = item.time;
      });
    }

    // Adiciona o botão construído dentro do container do modal
    container.appendChild(botao);
  });
}