const state = {
  messages: JSON.parse(localStorage.getItem("mini-messages") || "[]"),
  dark: localStorage.getItem("mini-theme") === "dark",
  apiKey: localStorage.getItem("mini-api-key") || "",
};
const messages = document.querySelector("#messages"),
  welcome = document.querySelector("#welcome"),
  input = document.querySelector("#input"),
  form = document.querySelector("#composer"),
  send = document.querySelector("#send"),
  apiKey = document.querySelector("#api-key");
document.documentElement.dataset.theme = state.dark ? "dark" : "light";
apiKey.value = state.apiKey;
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
async function askGemini(text) {
  if (!state.apiKey) throw new Error("Add your Gemini API key in the top-right field first.");
  const contents = [...state.messages, { role: "user", text }].map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.text }],
  }));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(state.apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: "You are Mini, a concise and helpful research assistant. Use Google Search for current facts when useful. Keep answers practical." }] },
      tools: [{ google_search: {} }],
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 400 || response.status === 403) throw new Error("Gemini rejected this API key. Check the key and its Generative Language API access.");
    throw new Error(data.error?.message || "Gemini request failed.");
  }
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "Gemini returned an empty response.";
}
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text || send.disabled) return;
  addMessage("user", text);
  input.value = "";
  input.style.height = "auto";
  send.disabled = true;
  askGemini(text)
    .then((reply) => {
      addMessage("assistant", reply);
    })
    .catch((error) => {
      addMessage("assistant", `Error: ${error.message}`);
    })
    .finally(() => {
    send.disabled = false;
    input.focus();
    });
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
apiKey.addEventListener("change", () => {
  state.apiKey = apiKey.value.trim();
  localStorage.setItem("mini-api-key", state.apiKey);
});
document
  .querySelector("#menu")
  .addEventListener("click", () =>
    document.querySelector("#sidebar").classList.toggle("open"),
  );
render();
