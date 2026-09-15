const state = {
  messages: JSON.parse(localStorage.getItem("mini-messages") || "[]"),
  dark: localStorage.getItem("mini-theme") === "dark",
};
const messages = document.querySelector("#messages"),
  welcome = document.querySelector("#welcome"),
  input = document.querySelector("#input"),
  form = document.querySelector("#composer"),
  send = document.querySelector("#send");
document.documentElement.dataset.theme = state.dark ? "dark" : "light";
function save() {
  localStorage.setItem("mini-messages", JSON.stringify(state.messages));
}
function render() {
  messages.innerHTML = "";
  welcome.hidden = state.messages.length > 0;
  state.messages.forEach((item) => addMessage(item.role, item.text, false));
}
function addMessage(role, text, store = true) {
  const item = document.createElement("article");
  item.className = `message ${role}`;
  item.innerHTML = `<div class="message-avatar">${role === "user" ? "Y" : "M"}</div><div class="message-body"><div class="message-label">${role === "user" ? "You" : "Mini"}</div><div class="message-text"></div></div>`;
  item.querySelector(".message-text").textContent = text;
  messages.append(item);
  if (store) {
    state.messages.push({ role, text });
    save();
  }
  messages.parentElement.scrollTop = messages.parentElement.scrollHeight;
}
function replyFor(text) {
  const lower = text.toLowerCase();
  if (lower.includes("surprising"))
    return "Here is a good one: octopuses have three hearts, but two stop beating when they swim. Ask me a sharper question and we can keep going.";
  if (lower.includes("plan") || lower.includes("idea"))
    return "Let’s make it concrete. Start with the outcome you want, then list the smallest useful first step, the constraint most likely to slow you down, and how you will know it worked.";
  if (lower.includes("tech"))
    return "I can help you explore the latest technology news once a live Gemini connection is added. For now, tell me the topic, company, or question you want to investigate.";
  return `I’m ready to help you think through “${text}”. This static version keeps your conversation in this browser. Connect your own secure API endpoint when you want live Gemini answers.`;
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || send.disabled) return;
  addMessage("user", text);
  input.value = "";
  input.style.height = "auto";
  send.disabled = true;
  setTimeout(() => {
    addMessage("assistant", replyFor(text));
    send.disabled = false;
    input.focus();
  }, 420);
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});
document.querySelectorAll("[data-prompt]").forEach((button) =>
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
    form.requestSubmit();
  }),
);
document.querySelector("#new-chat").addEventListener("click", () => {
  state.messages = [];
  save();
  render();
  input.focus();
  document.querySelector("#sidebar").classList.remove("open");
});
document.querySelector("#theme").addEventListener("click", () => {
  state.dark = !state.dark;
  document.documentElement.dataset.theme = state.dark ? "dark" : "light";
  localStorage.setItem("mini-theme", state.dark ? "dark" : "light");
});
document
  .querySelector("#menu")
  .addEventListener("click", () =>
    document.querySelector("#sidebar").classList.toggle("open"),
  );
render();
