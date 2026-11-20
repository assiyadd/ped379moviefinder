const MOCK_DB_URL = 'http://localhost:3001/watchlist';

const titleInput = document.getElementById('titleInput');
const searchBtn  = document.getElementById('searchBtn');
const watchBtn   = document.getElementById('watchBtn');
const statusEl   = document.getElementById('status');
const resultEl   = document.getElementById('result');

let currentMovie = null;

function setStatus(msg, type = '') {
  statusEl.textContent = msg;
  statusEl.className = type;
}

async function searchMovie() {
  const title = titleInput.value.trim();
  if (!title) return setStatus('Enter a movie title.', 'error');

  searchBtn.disabled = true;
  resultEl.hidden = true;
  setStatus('Searching…');

  try {
    const response = await fetch(`/api/movie?title=${encodeURIComponent(title)}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);

    currentMovie = data;
    document.getElementById('titleYear').textContent = `${data.title} (${data.year})`;
    document.getElementById('rating').textContent =
      data.rating && data.rating !== 'N/A' ? `${data.rating} / 10 on IMDb` : 'No rating yet';
    document.getElementById('plot').textContent = data.plot;
    resultEl.hidden = false;
    setStatus('');
  } catch (err) {
    setStatus(err.message, 'error');
  } finally {
    searchBtn.disabled = false;
  }
}

async function addToWatchlist() {
  if (!currentMovie) return;
  watchBtn.disabled = true;

  try {
    const response = await fetch(MOCK_DB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentMovie)
    });
    if (!response.ok) throw new Error(`Could not save (${response.status})`);
    setStatus(`Added "${currentMovie.title}" to your watchlist.`, 'ok');
  } catch (err) {
    setStatus(`${err.message}. Is JSON Server running on port 3001?`, 'error');
  } finally {
    watchBtn.disabled = false;
  }
}

searchBtn.addEventListener('click', searchMovie);
titleInput.addEventListener('keydown', e => { if (e.key === 'Enter') searchMovie(); });
watchBtn.addEventListener('click', addToWatchlist);