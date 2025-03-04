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
    let currentQuestion = questions[questionIndex];
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
    questionContainer.classList.remove("fade-out");
    answerButtons.innerHTML = "";
}

function selectAnswer(selectedButton) {
    questionContainer.classList.add("fade-out");

    setTimeout(() => {
        questionIndex++;
        if (questionIndex < questions.length) {
            showQuestion();
            smoothScrollDown();
        } else {
            window.location.href = "results.html"; // Pāreja uz kopsavilkumu
        }
    }, 700);
}

function smoothScrollDown() {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
}

showQuestion();
