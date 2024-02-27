const express = require('express');
const path = require('path');

const app = express();
const PORT = 5500;

process.env.NODE_ENV = 'production';

app.use(express.static(path.join(__dirname, '')));

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);

  (async () => {
    try {
      const open = (await import('open')).default;
      await open(`http://localhost:${PORT}/videoPlayer1.html`, {app: {name: 'chrome', arguments: ['--new-window']}});
      await open(`http://localhost:${PORT}/videoPlayer2.html`, {app: {name: 'chrome', arguments: ['--new-window']}});
      await open(`http://localhost:${PORT}/videoPlayer3.html`, {app: {name: 'chrome', arguments: ['--new-window']}});
    } catch (error) {
      console.error('Error importing/opening browser:', error);
    }
  })();


});
