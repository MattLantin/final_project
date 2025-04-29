const http = require('http');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection
const uri = 'mongodb+srv://sortel01:dBBTl83Z20HL93Eu@cluster0.9a9rbxp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

async function handleRequest(req, res) {
  if (req.method === 'POST' && req.url === '/submit-order') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const db = client.db('chatbotApp');
        const orders = db.collection('orders');

        await orders.insertOne({
          items: data.items,
          total: data.total,
          createdAt: new Date()
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });

  } else {
    // Serve static files
    let safePath = req.url === '/' ? '/index.html' : req.url;
    let filePath = path.join(__dirname, '..', safePath);

    let extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.ico':
        contentType = 'image/x-icon';
        break;
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error('File not found:', filePath);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  }
}

client.connect().then(() => {
  http.createServer(handleRequest).listen(3000, () => {
    console.log('Server running at http://localhost:3000');
  });
});
