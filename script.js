// Iegūst uid no URL (piemēram, play.html?uid=XYZ)
const uid = new URLSearchParams(window.location.search).get('uid') || "";

let questions = [];
let currentQuestionIndex = 0;

// Izgūst jautājumus no Google Sheets, izmantojot jūsu Google Apps Script web app
function fetchQuestions() {
  const url = "https://script.google.com/macros/s/AKfycbwICZRQ3SSzIHi3_pVvromAYMnC7_Fz9S4TB7ftxel31bbYj7prsoQRbzZ_itraI0jj/exec?action=getQuestions&uid=" + uid;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      questions = data.questions;
      showQuestion();
    })
    .catch(error => console.error("Error fetching questions:", error));
}

// Parāda pašreizējo jautājumu ar palielinātu fontu un pogām
function showQuestion() {
  const container = document.getElementById("question-container");
  container.classList.remove("fade-in");
  container.classList.remove("fade-out");
  
  const questionTextElem = document.getElementById("question-text");
  const answerButtonsElem = document.getElementById("answer-buttons");
  answerButtonsElem.innerHTML = ""; // notīra atbilžu pogas
  
  if (currentQuestionIndex < questions.length) {
    const q = questions[currentQuestionIndex];
    questionTextElem.innerText = q.text;
    questionTextElem.style.fontSize = "2em";
    
    q.answers.forEach(answer => {
      const btn = document.createElement("button");
      btn.innerText = answer;
      btn.classList.add("answer-btn");
      // Ja atbilde jau ir saglabāta, iezīmē to ar sirds emoji
      if (q.selected && q.selected === answer) {
        btn.innerHTML = "❤️ " + answer;
      }
      btn.addEventListener("click", () => {
        selectAnswer(q, answer, btn);
      });
      answerButtonsElem.appendChild(btn);
    });
  } else {
    // Ja jautājumi ir beigušies, parāda rezultātu pogu
    questionTextElem.innerText = "Aptauja ir pabeigta!";
    const resultsBtn = document.createElement("button");
    resultsBtn.innerText = "Skatīt rezultātus";
    resultsBtn.classList.add("results-btn");
    resultsBtn.addEventListener("click", () => {
      window.location.href = "results.html" + (uid ? ("?uid=" + uid) : "");
    });
    answerButtonsElem.appendChild(resultsBtn);
  }
}

// Kad lietotājs izvēlas atbildi, atjaunina lokālo objektu, izceļ izvēlēto pogu ar sirds emoji,
// sūta atbildi uz Google Sheets un izpilda fade out/up animāciju, lai parādītu nākamo jautājumu.
function selectAnswer(question, selectedAnswer, buttonElem) {
  question.selected = selectedAnswer;
  
  // Atjaunina pogu UI: noņem visus iepriekšējos marķējumus un pievieno "❤️" izvēlētajai pogai
  const buttons = document.querySelectorAll("#answer-buttons .answer-btn");
  buttons.forEach(btn => btn.innerHTML = btn.innerText);
  buttonElem.innerHTML = "❤️ " + selectedAnswer;
  
  updateAnswer(question.row, selectedAnswer);
  
  // Pievieno fade out animāciju – jautājuma lodziņš paceļas un izgaist kā mākonis
  const container = document.getElementById("question-container");
  container.classList.add("fade-out");
  
  setTimeout(() => {
    currentQuestionIndex++;
    container.classList.remove("fade-out");
    container.classList.add("fade-in");
    showQuestion();
  }, 1000);
}

// Nosūta POST pieprasījumu, lai atjauninātu izvēlēto atbildi Google Sheets
function updateAnswer(row, answer) {
  const updateUrl = "https://script.google.com/macros/s/AKfycbwICZRQ3SSzIHi3_pVvromAYMnC7Fz9S4TB7ftxel31bbYj7prsoQRbzZ_itraI0jj/exec";
  const data = {
    action: "updateAnswer",
    uid: uid,
    row: row,
    answer: answer
  };
  
  fetch(updateUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(() => console.log("Answer updated at row " + row))
  .catch(error => console.error("Error updating answer:", error));
}

fetchQuestions();
