'use strict';

const welcomeScreen = document.getElementById('welcome-screen');
const chatScreen = document.getElementById('chat-screen');
const startBtn = document.getElementById('start-btn');
const messagesEl = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const statusText = document.getElementById('status-text');

let conversationHistory = [];
let isLoading = false;

const BASE_PATH = (() => {
  const p = window.location.pathname;
  const last = p.lastIndexOf('/');
  return last >= 0 ? p.substring(0, last + 1) : '/';
})();

function getTime() {
  return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(content, role) {
  const isAlma = role === 'assistant';
  const div = document.createElement('div');
  div.className = `message ${isAlma ? 'alma-message' : 'user-message'}`;

  const bubble = document.createElement('div');
  bubble.className = `bubble ${isAlma ? 'alma-bubble' : 'user-bubble'}`;

  const p = document.createElement('p');
  p.style.whiteSpace = 'pre-wrap';
  p.style.wordBreak = 'break-word';
  p.textContent = content;

  const time = document.createElement('span');
  time.className = 'msg-time';
  time.textContent = getTime();

  bubble.appendChild(p);
  bubble.appendChild(time);

  if (isAlma) {
    const avatar = document.createElement('img');
    avatar.src = 'https://i.ibb.co/BHQDFkcs/1000159957.jpg';
    avatar.alt = 'ALMA';
    avatar.className = 'msg-avatar';
    div.appendChild(avatar);
  }

  div.appendChild(bubble);
  messagesEl.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
  typingIndicator.classList.remove('hidden');
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.classList.add('hidden');
}

function setLoading(state) {
  isLoading = state;
  sendBtn.disabled = state;
  userInput.disabled = state;
  statusText.textContent = state ? 'ALMA está escribiendo...' : 'En línea';
  if (state) showTyping(); else hideTyping();
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isLoading) return;

  userInput.value = '';
  userInput.style.height = 'auto';
  appendMessage(text, 'user');

  conversationHistory.push({ role: 'user', content: text });
  setLoading(true);

  try {
    const res = await fetch(`${BASE_PATH}chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: conversationHistory.slice(-20) })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.response || 'Lo siento, no pude procesar tu mensaje.';

    conversationHistory.push({ role: 'assistant', content: reply });
    appendMessage(reply, 'assistant');
  } catch (err) {
    console.error('Error:', err);
    appendMessage('Lo siento, tuve un problema técnico. Por favor intenta de nuevo. Si el problema persiste, escríbele directamente al Dr. Cristodfer: wa.me/59164544229', 'assistant');
  } finally {
    setLoading(false);
    userInput.focus();
  }
}

startBtn.addEventListener('click', () => {
  welcomeScreen.classList.remove('active');
  chatScreen.classList.add('active');
  setTimeout(() => userInput.focus(), 400);
});

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener('input', () => {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + 'px';
});

document.addEventListener('DOMContentLoaded', () => {
  scrollToBottom();
});
