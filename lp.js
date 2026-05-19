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













// =========================
// ELEMENTOS
// =========================
const modal = document.getElementById("modalPrecos");
const closeModal = document.querySelector(".close-modal");

// =========================
// DADOS
// =========================
let selectedServices = [];
let total = 0;

const data = {
  facial: [
    { name: "Buço", price: 15 },
    { name: "Sobrancelha", price: 25 },
    { name: "Barba feminina", price: 20 }
  ],
  corporal: [
    { name: "Axila", price: 30 },
    { name: "Perna", price: 50 }
  ],
  combos: [
    { name: "Combo 1", price: 70 }
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
    selectedServices.push({ name, price });
  }

  total = selectedServices.reduce((sum, item) => sum + item.price, 0);

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
    const time = document.getElementById("time").value;

    if (!name || !phone || !date || !time) {
      alert("Preencha todos os campos");
      return;
    }

    const services = selectedServices.map(item => item.name).join(", ");

    const message =
      `Olá, Cida! Quero agendar depilação na(s) área(s): ${services} no dia ${date} às ${time}. Meu nome é ${name}`;

    const url =
      `https://wa.me/55${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };
}

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