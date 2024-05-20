document.addEventListener('DOMContentLoaded', () => {
    const animeForm = document.getElementById('animeForm');
    const animeSearchResults = document.getElementById('animeSearchResults');
    const animeWatchlist = document.getElementById('animeWatchlist');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');

    let currentPage = 1;
    let totalPages = 1;
    const resultsPerPage = 5;
    let searchResults = [];

    // Load watchlist from localStorage
    loadWatchlist();

    animeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;

        // Clear previous search results
        animeSearchResults.innerHTML = '';

        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${title}`);
        const data = await response.json();
        searchResults = data.data;

        totalPages = Math.ceil(searchResults.length / resultsPerPage);
        currentPage = 1;

        renderSearchResults();
        updatePaginationButtons();

        animeForm.reset();
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderSearchResults();
            updatePaginationButtons();
        }
    });

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderSearchResults();
            updatePaginationButtons();
        }
    });

    function renderSearchResults() {
        animeSearchResults.innerHTML = '';

        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, searchResults.length);

        for (let i = startIndex; i < endIndex; i++) {
            const anime = searchResults[i];
            const animeItem = document.createElement('div');
            animeItem.classList.add('anime-item');

            animeItem.innerHTML = `
                <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
                <div>
                    <h3>${anime.title}</h3>
                    <p>Genre: ${anime.genres.map(genre => genre.name).join(', ')}</p>
                    <p>Score: ${anime.score}</p>
                    <p>Episodes: ${anime.episodes}</p>
                    <p>Status: ${anime.status}</p>
                </div>
                <button class="add-to-watchlist"><b>-|-</b></button>
            `;

            animeItem.querySelector('.add-to-watchlist').addEventListener('click', () => {
                addToWatchlist(animeItem);
            });

            animeSearchResults.appendChild(animeItem);
        }
    }

    function updatePaginationButtons() {
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    function addToWatchlist(animeItem) {
        const animeTitle = animeItem.querySelector('h3').textContent;

        // Check if the anime is already in the watchlist
        const existingItems = animeWatchlist.querySelectorAll('.anime-item');
        for (const item of existingItems) {
            if (item.querySelector('h3').textContent === animeTitle) {
                return; // Already in the watchlist
            }
        }

        const watchlistItem = document.createElement('div');
        watchlistItem.classList.add('anime-item');
        watchlistItem.innerHTML = animeItem.innerHTML;

        // Remove the "Tambah ke Watchlist" button and replace it with a remove button
        watchlistItem.querySelector('button').outerHTML = '<button class="remove-from-watchlist"><i class="fas fa-trash-alt"></i>---</button>';

        watchlistItem.querySelector('.remove-from-watchlist').addEventListener('click', () => {
            removeAnime(watchlistItem);
        });

        animeWatchlist.appendChild(watchlistItem);

        // Save watchlist to localStorage
        saveWatchlist();
    }

    function removeAnime(animeItem) {
        animeItem.remove();

        // Save watchlist to localStorage
        saveWatchlist();
    }

    function saveWatchlist() {
        const watchlistItems = animeWatchlist.querySelectorAll('.anime-item');
        const watchlist = [];
        
        watchlistItems.forEach(item => {
            watchlist.push({
                title: item.querySelector('h3').textContent,
                genres: item.querySelector('p').textContent,
                score: item.querySelector('p:nth-of-type(2)').textContent,
                episodes: item.querySelector('p:nth-of-type(3)').textContent,
                status: item.querySelector('p:nth-of-type(4)').textContent,
                image: item.querySelector('img').src
            });
        });

        localStorage.setItem('animeWatchlist', JSON.stringify(watchlist));
    }

    function loadWatchlist() {
        const watchlist = JSON.parse(localStorage.getItem('animeWatchlist')) || [];

        watchlist.forEach(anime => {
            const watchlistItem = document.createElement('div');
            watchlistItem.classList.add('anime-item');

            watchlistItem.innerHTML = `
                <img src="${anime.image}" alt="${anime.title}">
                <div>
                    <h3>${anime.title}</h3>
                    <p>${anime.genres}</p>
                    <p>${anime.score}</p>
                    <p>${anime.episodes}</p>
                    <p>${anime.status}</p>
                </div>
                <button class="remove-from-watchlist"><i class="fas fa-trash-alt"></i><b>---</b></button>
            `;

            watchlistItem.querySelector('.remove-from-watchlist').addEventListener('click', () => {
                removeAnime(watchlistItem);
            });

            animeWatchlist.appendChild(watchlistItem);
        });
    }
});