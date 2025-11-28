const express = require('express');
const path = require('path');
const app = express();

// Atualize aqui com base no outputPath real
const distPath = path.join(__dirname, 'dist/all-service/browser');
console.log("distPath", distPath)

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, '/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
