const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve all files in the current directory
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Pong game is running on port ${PORT}`);
});
