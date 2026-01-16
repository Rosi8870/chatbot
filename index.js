require("dotenv").config();
const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = 3000;

// Telegram webhook
app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const text = message.text;

  let reply = "🤖 Something went wrong";

  try {
    if (text === "/start") {
      reply = "Hello 👋\nI am an AI-powered Telegram bot 🤖";
    } else {
      // AI response
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: text }],
      });

      reply = aiResponse.choices[0].message.content;
    }

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: reply,
    });

  } catch (err) {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "⚠️ AI error. Try again later.",
    });
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log("AI Bot running on port 3000");
});
