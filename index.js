require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔹 CONFIG
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const PORT = process.env.PORT || 3000;

// 🔹 CHANGE YOUR BOT NAME HERE
const BOT_NAME = "RoshinthBot 🤖";

app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text?.trim().toLowerCase();

  let reply = "🤖 Sorry, I didn't understand that.";

  // 👉 Start command
  if (text === "/start") {
    reply = `Hello 👋\nI am ${BOT_NAME}\nHow can I help you?`;
  }

  // 👉 Bot name question
  else if (
    text === "what is your name" ||
    text === "what's your name" ||
    text === "who are you"
  ) {
    reply = `I am ${BOT_NAME}. Nice to meet you 😊`;
  }

  // 👉 Greetings
  else if (
    text === "hi" ||
    text === "hello" ||
    text === "hey"
  ) {
    reply = "Hello 👋 How can I help you today?";
  }

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: reply,
  });

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Telegram bot running on port ${PORT}`);
});
