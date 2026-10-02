const app = document.createElement("div");

app.classList.add("app");

const header = document.createElement("header");

header.classList.add("header");

const title = document.createElement("h1");

title.textContent = "The Forgotten Library";

const controls = document.createElement("div");

controls.classList.add("header__controls");

const newGameButton = document.createElement("button");

newGameButton.classList.add("button");

newGameButton.textContent = "New Game";

const leaderboardButton = document.createElement("button");

leaderboardButton.classList.add("button");

leaderboardButton.textContent = "Leaderboard";

controls.append(newGameButton, leaderboardButton);

const stats = document.createElement("div");

stats.classList.add("stats");

const moves = document.createElement("p");

moves.classList.add("stats__item");

moves.textContent = "Moves: 0";

const pairs = document.createElement("p");

pairs.classList.add("stats__item");

pairs.textContent = "Pairs: 0/8";

stats.append(moves, pairs);

header.append(title, controls, stats);

app.append(header);

const gameBoard = document.createElement("main");

gameBoard.classList.add("game-board");

const cards = [
  "key",
  "candle",
  "crystal",
  "feather",
  "scroll",
  "moon",
  "potion",
  "mirror",
];

const cardPairs = [...cards, ...cards];

function shuffleCards(array) {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
}

let firstCard = null;
let secondCard = null;
let movesCount = 0;
let pairsCount = 0;
let isChecking = false;
let mismatchTimer = null;

function saveResult() {
  const results = JSON.parse(localStorage.getItem("memoryGameResults")) || [];

  const result = {
    moves: movesCount,
    date: new Date().toISOString(),
  };

  results.push(result);

  results.sort((first, second) => {
    if (first.moves !== second.moves) {
      return first.moves - second.moves;
    }

    return new Date(first.date) - new Date(second.date);
  });

  const bestResults = results.slice(0, 10);

  localStorage.setItem("memoryGameResults", JSON.stringify(bestResults));
}

function createModal() {
  const overlay = document.createElement("div");

  overlay.classList.add("modal");
  
  document.body.classList.add("modal-open");

  const content = document.createElement("div");

  content.classList.add("modal__content");

  const closeIcon = document.createElement("button");

  closeIcon.classList.add("modal__close");

  closeIcon.textContent = "×";
  closeIcon.setAttribute("aria-label", "Close modal");

  content.append(closeIcon);

  overlay.append(content);

  document.body.append(overlay);

  function closeModal() {
  overlay.remove();
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleEscape);
  }

  function handleEscape(event) {
    if (event.key === "Escape") {
      closeModal();
    }
  }

  closeIcon.addEventListener("click", closeModal);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", handleEscape);

  return {
    content,
    closeModal,
  };
}

function createVictoryModal() {
  const modal = createModal();

  const heading = document.createElement("h2");

  heading.classList.add("modal__title");

  heading.textContent = "The Library Remembers";

  const message = document.createElement("p");

  message.classList.add("modal__message");

  message.textContent = `You found all 8 pairs in ${movesCount} moves.`;

  const buttons = document.createElement("div");

  buttons.classList.add("modal__buttons");

  const newGameModalButton = document.createElement("button");

  newGameModalButton.classList.add("button");

  newGameModalButton.textContent = "New Game";

  const closeButton = document.createElement("button");

  closeButton.classList.add("button");

  closeButton.textContent = "Close";

  buttons.append(newGameModalButton, closeButton);

  modal.content.append(heading, message, buttons);

  closeButton.addEventListener("click", modal.closeModal);

  newGameModalButton.addEventListener("click", () => {
    modal.closeModal();
    startNewGame();
  });
}

function formatDate(date) {
  const formattedDate = new Date(date);

  const day = String(formattedDate.getDate()).padStart(2, "0");
  const month = String(formattedDate.getMonth() + 1).padStart(2, "0");
  const year = formattedDate.getFullYear();

  return `${day}.${month}.${year}`;
}

function createLeaderboardModal() {
  const modal = createModal();

  const heading = document.createElement("h2");

  heading.classList.add("modal__title");

  heading.textContent = "Archive of Scholars";

  const results = JSON.parse(localStorage.getItem("memoryGameResults")) || [];

  if (results.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.classList.add("modal__message");

    emptyMessage.textContent = "No completed games yet.";

    modal.content.append(heading, emptyMessage);

    return;
  }

  const table = document.createElement("table");

  table.classList.add("leaderboard");

  const tableHead = document.createElement("thead");

  const headerRow = document.createElement("tr");

  const rankHeader = document.createElement("th");

  rankHeader.textContent = "Rank";

  const movesHeader = document.createElement("th");

  movesHeader.textContent = "Moves";

  const dateHeader = document.createElement("th");

  dateHeader.textContent = "Date";

  headerRow.append(rankHeader, movesHeader, dateHeader);

  tableHead.append(headerRow);

  const tableBody = document.createElement("tbody");

  results.forEach((result, index) => {
    const row = document.createElement("tr");

    const rankCell = document.createElement("td");

    rankCell.textContent = String(index + 1);

    const movesCell = document.createElement("td");

    movesCell.textContent = String(result.moves);

    const dateCell = document.createElement("td");

    dateCell.textContent = formatDate(result.date);

    row.append(rankCell, movesCell, dateCell);

    tableBody.append(row);
  });

  table.append(tableHead, tableBody);

  modal.content.append(heading, table);
}

function createGameBoard() {
  gameBoard.replaceChildren();

  const shuffledCards = shuffleCards(cardPairs);

  shuffledCards.forEach((cardName) => {
    const card = document.createElement("button");

    card.classList.add("card");

    card.dataset.card = cardName;

    const cardBack = document.createElement("span");

    cardBack.classList.add("card__back");

    cardBack.textContent = "✦";

    const cardFront = document.createElement("span");

    cardFront.classList.add("card__front");

    const cardImage = document.createElement("img");

    cardImage.src = `images/${cardName}.png`;
    cardImage.alt = `Enchanted ${cardName}`;

    cardFront.append(cardImage);

    card.append(cardBack, cardFront);

    gameBoard.append(card);

    card.addEventListener("click", () => {
      if (isChecking) {
        return;
      }

      if (card === firstCard) {
        return;
      }

      if (card.classList.contains("card--open")) {
        return;
      }

      card.classList.add("card--open");

      if (!firstCard) {
        firstCard = card;
        return;
      }

      secondCard = card;
      movesCount += 1;
      moves.textContent = `Moves: ${movesCount}`;

      isChecking = true;

      if (firstCard.dataset.card === secondCard.dataset.card) {
        pairsCount += 1;
        pairs.textContent = `Pairs: ${pairsCount}/8`;

        firstCard = null;
        secondCard = null;
        isChecking = false;

        if (pairsCount === 8) {
          saveResult();
          createVictoryModal();
        }
      } else {
        mismatchTimer = setTimeout(() => {
          firstCard.classList.remove("card--open");
          secondCard.classList.remove("card--open");

          firstCard = null;
          secondCard = null;
          isChecking = false;
          mismatchTimer = null;
        }, 1000);
      }
    });
  });
}

function startNewGame() {
  if (mismatchTimer) {
    clearTimeout(mismatchTimer);
    mismatchTimer = null;
  }

  firstCard = null;
  secondCard = null;
  movesCount = 0;
  pairsCount = 0;
  isChecking = false;

  moves.textContent = "Moves: 0";
  pairs.textContent = "Pairs: 0/8";

  createGameBoard();
}

newGameButton.addEventListener("click", startNewGame);

leaderboardButton.addEventListener("click", createLeaderboardModal);

app.append(gameBoard);

document.body.append(app);

createGameBoard();

console.log("Welcome to The Forgotten Library!");