require('dotenv').config();
const express = require('express');

const app = express();
const KEY = process.env.OMDB_API_KEY;

if (!KEY) {
  console.error('Missing OMDB_API_KEY. Add it to your .env file.');
  process.exit(1);
}

app.use(express.static('public'));

app.get('/api/movie', async (req, res) => {
  const title = (req.query.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Enter a movie title.' });

  try {
    const url = `https://www.omdbapi.com/?apikey=${KEY}&t=${encodeURIComponent(title)}`;
    const upstream = await fetch(url);
    if (!upstream.ok) throw new Error(`Movie API returned ${upstream.status}`);
    const data = await upstream.json();
    if (data.Response === 'False') {
      return res.status(404).json({ error: data.Error || 'Movie not found.' });
    }
    res.json({
      title: data.Title,
      year: data.Year,
      rating: data.imdbRating,
      plot: data.Plot,
      imdbID: data.imdbID
    });
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: 'Could not reach the movie service.' });
  }
});

app.listen(3000, () => console.log('App: http://localhost:3000'));