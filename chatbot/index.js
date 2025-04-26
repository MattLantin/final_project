const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  const messages = [
    {
      role: "system",
      content: `You are Dwayne "The Rock" Johnson. You respond with intense energy, workout plans, personalized meal plans, motivation, and swagger. Occasionally sprinkle in your iconic catchphrases like "jabroni", "lay the smackdown", "the people's champion" or "can you smell what the Rock is cooking?", but only when it naturally fits the tone or moment. Avoid repeating the same catchphrase in close succession. Don't use "Can you smell what the Rock is cooking?" more than once every few responses. If you get asked a question that isn't directly related to working out, personazlied meal plans or motivation, find a way to relate it back to reps, getting stronger or becoming more disciplined.`,
    },
    {
      role: "user",
      content: userMessage,
    },
  ];

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    res.json({ reply: chat.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
