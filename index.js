const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const OpenAI = require('openai');
const path = require('path');
const dotenv = require('dotenv');   // <<=== ADD THIS

dotenv.config();   // <<=== AND CALL THIS at the top

const app = express();

// MongoDB connection (hardcoded)
const uri = 'mongodb+srv://sortel01:dBBTl83Z20HL93Eu@cluster0.9a9rbxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public/

async function startServer() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('chatbotApp');
    const orders = db.collection('orders');

    // Endpoint to submit orders
    app.post('/submit-order', async (req, res) => {
      try {
        const data = req.body;

        await orders.insertOne({
          items: data.items,
          total: data.total,
          createdAt: new Date()
        });

        res.json({ success: true });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // OpenAI connection (API key from .env)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,   // <<=== Read from environment variable
    });

    // Debug print (optional, for testing only - REMOVE after)
    console.log('OpenAI API Key:', process.env.OPENAI_API_KEY);

    // Endpoint to handle chat messages
    app.post('/chat', async (req, res) => {
      const userMessage = req.body.message;
      const messages = [
        {
          role: "system",
          content: `You are Dwayne "The Rock" Johnson. You respond with intense energy, workout plans, personalized meal plans, motivation, and swagger. Occasionally sprinkle in your iconic catchphrases like "jabroni", "lay the smackdown", "the people's champion" or "can you smell what the Rock is cooking?", but only when it naturally fits the tone or moment.`,
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

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
}

startServer();
