const questions = [
  { text: "Kas būtu tavs sapņu ceļojuma galamērķis? 🏝️", answers: ["Bali", "Parīze", "Jaunzēlande", "Mājās ar tevi 💖"] },
  { text: "Kādu filmu vislabāk skatīties kopā? 🎬", answers: ["Romantisku", "Komēdiju", "Trilleri", "Multfilmu"] },
  { text: "Kas ir tavs ideālais randiņš? 🌹", answers: ["Pikniks parkā", "Vakariņas sveču gaismā", "Piedzīvojumu ceļojums", "Mājās, apskaujoties"] },
];

let questionIndex = 0;
const questionContainer = document.getElementById("question-container");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");

function showQuestion() {
  resetState();
  const currentQuestion = questions[questionIndex];
  questionText.innerText = currentQuestion.text;
  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.innerText = answer;
    button.classList.add("answer-btn");
    button.addEventListener("click", () => selectAnswer(button));
    answerButtons.appendChild(button);
  });
}

function resetState() {
  questionContainer.classList.remove("rise-away");
  answerButtons.innerHTML = "";
}

function selectAnswer(selectedButton) {
  // Var papildus ierakstīt atbildi vai sagrābt izvēlēto vērtību, ja nepieciešams.
  
  // Pievieno animācijas klasi, kas paceļ un izgaisa jautājuma bloku.
  questionContainer.classList.add("rise-away");

  // Pēc animācijas (1s) ielādē nākamo jautājumu.
  setTimeout(() => {
    questionIndex++;
    if (questionIndex < questions.length) {
      // Atjauno jautājuma bloku (bez animācijas) un rāda nākamo jautājumu.
      resetState();
      showQuestion();
    } else {
      // Ja jautājumi beidzas, var pāriet uz rezultātu lapu vai parādīt kopsavilkumu.
      window.location.href = "results.html";
    }
  }, 1000);
}

showQuestion();
