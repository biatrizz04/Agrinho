let fazendeira;
let bois = [];
let curral;
let boisResgatados = 0;
let totalBois = 15; // Quantidade de bois para resgatar
let tempoJogo = 60; // Em segundos
let tempoRestante;
let jogoIniciado = false;
let telaInicial = true;
let mensagemFinal = "";
let tempoInicioMillis; // Para controlar o tempo de jogo com millis()

// Emojis
const emojiFazendeira = "👩🏻‍🌾"; // Fazendeira ou um rosto simples: 😃
const emojiBoi = "🐂";      // Boi ou vaca: 🐄
const emojiCurral = "🏡";    // Casa/curral (pode ser um quadrado ou imagem de curral simples se quiser)

function setup() {
  createCanvas(800, 600);
  imageMode(CENTER);
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  // Tamanho do texto para os emojis
  textSize(36); // Um bom tamanho para os emojis aparecerem bem
  textFont("Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "sans-serif"); // Fontes para garantir que emojis apareçam

  // Inicializa a fazendeira
  fazendeira = {
    x: width / 2,
    y: height - 80,
    tamanho: 40, // O tamanho do emoji será controlado por textSize()
    velocidade: 5
  };

  // Define o curral
  curral = {
    x: width / 2 - 80,
    y: 50,
    largura: 160,
    altura: 100
  };

  // Prepara os bois, mas eles só aparecerão ao iniciar o jogo
  reiniciarBois();
}

function reiniciarBois() {
  bois = [];
  for (let i = 0; i < totalBois; i++) {
    bois.push({
      x: random(50, width - 50),
      y: random(height / 2, height - 100), // Começam mais abaixo no campo
      tamanho: 30, // O tamanho do emoji será controlado por textSize()
      velocidadeX: random(-1, 1) * 0.8, // Movimento aleatório e lento
      velocidadeY: random(-1, 1) * 0.8,
      seguindo: false, // Se o boi está seguindo a fazendeira
      tempoSeguindo: 0,
      tempoMaxSeguindo: 180, // Segue por 3 segundos (60 frames/segundo * 3)
      resgatado: false // Flag para saber se o boi já foi resgatado
    });
  }
  boisResgatados = 0;
  tempoRestante = tempoJogo;
}

function draw() {
  // Desenha o fundo (campo verde)
  background(100, 180, 100);

  if (telaInicial) {
    desenharTelaInicial();
  } else if (jogoIniciado) {
    atualizarJogo();
    desenharJogo();
  } else { // Jogo terminado
    desenharTelaFinal();
  }
}

function desenharTelaInicial() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  fill(255);
  textSize(32);
  text(" Os Bois Fujoes", width / 2, height / 2 - 50);
  textSize(20);
  text("Leve os bois de volta para o curral!", width / 2, height / 2);
  text("Pressione qualquer tecla para começar", width / 2, height / 2 + 50);
}

function desenharTelaFinal() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);
  fill(255);
  textSize(32);
  text(mensagemFinal, width / 2, height / 2 - 50);
  textSize(20);
  text("Bois resgatados: " + boisResgatados + " de " + totalBois, width / 2, height / 2);
  text("Pressione 'R' para jogar novamente", width / 2, height / 2 + 50);
}

function atualizarJogo() {
  // Atualiza tempo restante
  tempoRestante = tempoJogo - floor((millis() - tempoInicioMillis) / 1000);
  if (tempoRestante <= 0 && boisResgatados < totalBois) {
    jogoIniciado = false;
    mensagemFinal = "Tempo esgotado!";
  }

  // Move a fazendeira
  moverFazendeira();

  // Move e atualiza os bois
  for (let boi of bois) {
    if (boi.resgatado) {
      continue; // Pula bois já resgatados
    }

    if (boi.seguindo) {
      // Boi segue a fazendeira
      let dirX = fazendeira.x - boi.x;
      let dirY = fazendeira.y - boi.y;
      let distancia = dist(fazendeira.x, fazendeira.y, boi.x, boi.y);
      if (distancia > fazendeira.tamanho / 2 + boi.tamanho / 2 + 5) { // Mantém uma pequena distância
        boi.x += dirX * 0.03; // Velocidade de seguir
        boi.y += dirY * 0.03;
      }

      boi.tempoSeguindo++;
      if (boi.tempoSeguindo >= boi.tempoMaxSeguindo) {
        boi.seguindo = false;
        boi.tempoSeguindo = 0;
        // Reinicia o movimento aleatório do boi após parar de seguir
        boi.velocidadeX = random(-1, 1) * 0.8;
        boi.velocidadeY = random(-1, 1) * 0.8;
      }
    } else {
      // Movimento aleatório do boi
      boi.x += boi.velocidadeX;
      boi.y += boi.velocidadeY;

      // Colisão com as bordas
      if (boi.x < boi.tamanho / 2 || boi.x > width - boi.tamanho / 2) {
        boi.velocidadeX *= -1;
      }
      if (boi.y < boi.tamanho / 2 || boi.y > height - boi.tamanho / 2) {
        boi.velocidadeY *= -1;
      }
    }

    // Verifica se a fazendeira tocou no boi
    let d = dist(fazendeira.x, fazendeira.y, boi.x, boi.y);
    if (d < fazendeira.tamanho / 2 + boi.tamanho / 2) {
      if (!boi.seguindo) { // Só começa a seguir se não estiver já seguindo
        boi.seguindo = true;
        boi.tempoSeguindo = 0; // Reseta o contador para seguir por um tempo
      }
    }

    // Verifica se o boi está no curral
    if (boi.x > curral.x && boi.x < curral.x + curral.largura &&
        boi.y > curral.y && boi.y < curral.y + curral.altura) {
      if (!boi.resgatado) { // Garante que só conta uma vez
        boi.resgatado = true;
        boisResgatados++;
        // Move o boi para fora da tela
        boi.x = -100;
        boi.y = -100;
      }
    }
  }

  // Verifica condição de vitória
  if (boisResgatados === totalBois) {
    jogoIniciado = false;
    mensagemFinal = "Parabéns! Todos os bois resgatados!";
  }
}

function desenharJogo() {
  // Desenha o curral (agora com emoji opcional)
  fill(100, 50, 0); // Cor de madeira para o curral
  rect(curral.x, curral.y, curral.largura, curral.altura);
  fill(255);
  textSize(36); // Tamanho para o emoji do curral
  text(emojiCurral, curral.x + curral.largura / 2, curral.y + curral.altura / 2);
  textSize(24); // Volta ao tamanho padrão para textos

  // Desenha a fazendeira com emoji
  textSize(fazendeira.tamanho); // Define o tamanho do emoji da fazendeira
  text(emojiFazendeira, fazendeira.x, fazendeira.y);

  // Desenha os bois com emoji
  textSize(bois[0].tamanho); // Define o tamanho do emoji dos bois
  for (let boi of bois) {
    if (!boi.resgatado) {
      text(emojiBoi, boi.x, boi.y);
    }
  }

  // HUD: Bois resgatados e tempo
  fill(0);
  textSize(18);
  textAlign(LEFT, TOP);
  text("Bois: " + boisResgatados + "/" + totalBois, 10, 10);
  textAlign(RIGHT, TOP);
  text("Tempo: " + tempoRestante, width - 10, 10);
  textAlign(CENTER, CENTER); // Volta ao alinhamento padrão para outros textos
}

// Função para mover a fazendeira
function moverFazendeira() {
  if (keyIsDown(LEFT_ARROW)) {
    fazendeira.x -= fazendeira.velocidade;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    fazendeira.x += fazendeira.velocidade;
  }
  if (keyIsDown(UP_ARROW)) {
    fazendeira.y -= fazendeira.velocidade;
  }
  if (keyIsDown(DOWN_ARROW)) {
    fazendeira.y += fazendeira.velocidade;
  }

  // Limita a fazendeira à tela
  fazendeira.x = constrain(fazendeira.x, fazendeira.tamanho / 2, width - fazendeira.tamanho / 2);
  fazendeira.y = constrain(fazendeira.y, fazendeira.tamanho / 2, height - fazendeira.tamanho / 2);
}

function keyPressed() {
  if (telaInicial) {
    telaInicial = false;
    jogoIniciado = true;
    tempoInicioMillis = millis(); // Inicia a contagem do tempo
  } else if (!jogoIniciado && (key === 'r' || key === 'R')) {
    // Reinicia o jogo se estiver na tela final e 'R' for pressionado
    reiniciarBois();
    tempoInicioMillis = millis(); // Reseta o tempo inicial para o novo jogo
    jogoIniciado = true;
    mensagemFinal = "";
  }
}