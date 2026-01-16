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

const BOT_NAME = "RoshinthBot 🤖";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ================= HELPERS =================
async function sendMessage(chatId, text, replyMarkup = null) {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ================= DATA =================
const jokes = [
  "😂 Why don’t programmers like nature? Too many bugs!",
  "🤣 Why did the computer go to the doctor? Because it caught a virus!",
  "😄 Why do Java developers wear glasses? Because they don’t C#!",
  "😆 Debugging: Removing bugs, one at a time.",
];

// ================= WEBHOOK =================
app.post("/webhook", async (req, res) => {
  const message = req.body.message;
  const callback = req.body.callback_query;

  // ============ BUTTON CLICKS ============
  if (callback) {
    const chatId = callback.message.chat.id;
    const data = callback.data;

    // MAIN MENU
    if (data === "ABOUT") {
      await sendMessage(
        chatId,
        `👋 Hi!\nI am ${BOT_NAME}\n\nI can chat, tell jokes, play games, and answer questions using AI 😊`
      );
    }

    else if (data === "HELP") {
      await sendMessage(
        chatId,
        `❓ *Help*\n\n• Use buttons below\n• Ask anything\n• Type /start to open menu`
      );
    }

    else if (data === "ASK_AI") {
      await sendMessage(chatId, "🤖 Ask me anything!");
    }

    else if (data === "FUN") {
      const funMenu = {
        inline_keyboard: [
          [
            { text: "😂 Joke", callback_data: "JOKE" },
            { text: "🎲 Dice", callback_data: "DICE" },
          ],
          [
            { text: "🪙 Coin", callback_data: "COIN" },
            { text: "🔢 Number", callback_data: "NUMBER" },
          ],
        ],
      };

      await sendMessage(chatId, "🎮 *Fun & Games* 👇", funMenu);
    }

    // FUN ACTIONS
    else if (data === "JOKE") {
      await sendMessage(chatId, randomItem(jokes));
    }

    else if (data === "DICE") {
      const dice = Math.floor(Math.random() * 6) + 1;
      await sendMessage(chatId, `🎲 You rolled: *${dice}*`);
    }

    else if (data === "COIN") {
      const coin = Math.random() > 0.5 ? "🪙 Heads" : "🪙 Tails";
      await sendMessage(chatId, coin);
    }

    else if (data === "NUMBER") {
      const num = Math.floor(Math.random() * 100) + 1;
      await sendMessage(chatId, `🔢 Random number: *${num}*`);
    }

    return res.sendStatus(200);
  }

  // ============ NORMAL MESSAGE ============
  if (!message) return res.sendStatus(200);

  const chatId = message.chat.id;
  const userText = message.text?.trim();
  const text = userText?.toLowerCase();

  try {
    // /start MENU
    if (text === "/start") {
      const menu = {
        inline_keyboard: [
          [
            { text: "👤 About Bot", callback_data: "ABOUT" },
            { text: "❓ Help", callback_data: "HELP" },
          ],
          [
            { text: "🤖 Ask AI", callback_data: "ASK_AI" },
            { text: "🎮 Fun & Games", callback_data: "FUN" },
          ],
        ],
      };

      await sendMessage(
        chatId,
        `Hello 👋\nI am ${BOT_NAME}\n\nChoose an option 👇`,
        menu
      );
    }

    // SIMPLE RULES
    else if (text === "hi" || text === "hello" || text === "hey") {
      await sendMessage(chatId, "Hello 👋 How can I help you?");
    }

    else if (
      text === "what is your name" ||
      text === "who are you"
    ) {
      await sendMessage(chatId, `I am ${BOT_NAME} 😊`);
    }

    // AI FALLBACK
    else {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are ${BOT_NAME}. Never say ChatGPT. Be friendly and fun.`,
          },
          { role: "user", content: userText },
        ],
      });

      await sendMessage(
        chatId,
        aiResponse.choices[0].message.content
      );
    }

  } catch (err) {
    console.error(err.message);
    await sendMessage(chatId, "⚠️ Something went wrong. Try again.");
  }

  res.sendStatus(200);
});

// ================= SERVER =================
app.listen(PORT, () => {
  console.log(`🚀 ${BOT_NAME} running on port ${PORT}`);
});
