const questions = [
    { text: "Kas būtu tavs sapņu ceļojuma galamērķis? 🏝️", answers: ["Bali", "Parīze", "Jaunzēlande", "Mājās ar tevi 💖"] },
    { text: "Kādu filmu vislabāk skatīties kopā? 🎬", answers: ["Romantisku", "Komēdiju", "Trilleri", "Multfilmu"] },
    { text: "Kas ir tavs mīļākais randiņa formāts? 🌹", answers: ["Pikniks parkā", "Vakariņas sveču gaismā", "Piedzīvojumu ceļojums", "Vienkārši mājās kopā"] },
];

let questionIndex = 0;
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");
const nextBtn = document.getElementById("next-btn");

function showQuestion() {
    resetState();
    let currentQuestion = questions[questionIndex];
    questionText.innerText = currentQuestion.text;
    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.innerText = answer;
        button.classList.add("answer-btn");
        button.addEventListener("click", selectAnswer);
        answerButtons.appendChild(button);
    });
}

function resetState() {
    nextBtn.style.display = "none";
    answerButtons.innerHTML = "";
}

function selectAnswer() {
    nextBtn.style.display = "block";
}

nextBtn.addEventListener("click", () => {
    questionIndex++;
    if (questionIndex < questions.length) {
        showQuestion();
    } else {
        window.location.href = "results.html"; // Pāreja uz kopsavilkumu
    }
});

showQuestion();
