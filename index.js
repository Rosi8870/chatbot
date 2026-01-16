require("dotenv").config();
const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

// ================= CONFIG =================
const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const PORT = process.env.PORT || 3000;

// 🔹 BOT IDENTITY (FIXED)
const BOT_NAME = "RoshinthBot 🤖";

// OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =====================================================
// TELEGRAM WEBHOOK
// =====================================================
app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  if (!message || !message.text) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userText = message.text.trim();
  const text = userText.toLowerCase();

  let reply = "🤖 Sorry, I didn't understand that.";

  try {
    // -------- RULE BASED REPLIES --------

    if (text === "/start") {
      reply = `Hello 👋\nI am ${BOT_NAME}\nHow can I help you?`;
    }

    else if (
      text === "what is your name" ||
      text === "what's your name" ||
      text === "who are you"
    ) {
      reply = `I am ${BOT_NAME}, your friendly assistant 😊`;
    }

    else if (text === "hi" || text === "hello" || text === "hey") {
      reply = "Hello 👋 How can I help you today?";
    }

    else if (
      text === "how are you" ||
      text === "how r you" ||
      text === "how are u"
    ) {
      reply = "I'm doing great 😊 Thanks for asking!\nHow can I help you today?";
    }

    // -------- AI FALLBACK --------
    else {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are ${BOT_NAME}.
Never say you are ChatGPT or an AI model.
Always reply as a friendly Telegram bot.`,
          },
          { role: "user", content: userText },
        ],
      });

      reply = aiResponse.choices[0].message.content;
    }

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: reply,
    });

  } catch (error) {
    console.error("Telegram Error:", error.message);
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "⚠️ Sorry, something went wrong. Please try again.",
    });
  }

  res.sendStatus(200);
});


// =====================================================
// WEBSITE CHAT API
// =====================================================
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are ${BOT_NAME}.
Never say ChatGPT.
You are a friendly website chatbot.`,
        },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: aiResponse.choices[0].message.content,
    });

  } catch (error) {
    console.error("Website Chat Error:", error.message);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

// =====================================================
// SERVER
// =====================================================
app.listen(PORT, () => {
  console.log(`🚀 ${BOT_NAME} running on port ${PORT}`);
});
