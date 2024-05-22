document.addEventListener('DOMContentLoaded', () => {
    const animeForm = document.getElementById('animeForm');
    const animeSearchResults = document.getElementById('animeSearchResults');
    const animeWatchlist = document.getElementById('animeWatchlist');
    const prevSearchPageButton = document.getElementById('prevSearchPage');
    const nextSearchPageButton = document.getElementById('nextSearchPage');
    const searchPagination = document.getElementById('searchPagination');
    const prevWatchlistPageButton = document.getElementById('prevWatchlistPage');
    const nextWatchlistPageButton = document.getElementById('nextWatchlistPage');
    const watchlistPagination = document.getElementById('watchlistPagination');

    let currentPage = 1;
    let totalPages = 1;
    const resultsPerPage = 5;
    let searchResults = [];
    let watchlistPage = 1;
    let watchlistTotalPages = 1;

    // Load watchlist from localStorage
    loadWatchlist();

    animeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;

        // Clear previous search results
        animeSearchResults.innerHTML = '';
        searchPagination.style.display = 'none'; // Hide pagination initially

        const response = await fetch(`https://api.jikan.moe/v4/anime?q=${title}`);
        const data = await response.json();
        searchResults = data.data;

        totalPages = Math.ceil(searchResults.length / resultsPerPage);
        currentPage = 1;

        renderSearchResults();
        updateSearchPaginationButtons();

        if (searchResults.length > 0) {
            searchPagination.style.display = 'block'; // Show pagination if there are results
        } else {
            searchPagination.style.display = 'none'; // Hide pagination if no results
        }

        animeForm.reset();
    });

    prevSearchPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderSearchResults();
            updateSearchPaginationButtons();
        }
    });

    nextSearchPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderSearchResults();
            updateSearchPaginationButtons();
        }
    });

    prevWatchlistPageButton.addEventListener('click', () => {
        if (watchlistPage > 1) {
            watchlistPage--;
            renderWatchlist();
            updateWatchlistPaginationButtons();
        }
    });

    nextWatchlistPageButton.addEventListener('click', () => {
        if (watchlistPage < watchlistTotalPages) {
            watchlistPage++;
            renderWatchlist();
            updateWatchlistPaginationButtons();
        }
    });

    function renderSearchResults() {
        animeSearchResults.innerHTML = '';

        const startIndex = (currentPage - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, searchResults.length);

        for (let i = startIndex; i < endIndex; i++) {
            const anime = searchResults[i];

            // Skip anime with genre 'Hentai'
            if (anime.genres.some(genre => genre.name === 'Hentai')) {
                continue;
            }

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
                <button class="add-to-watchlist"><i class="fas fa-plus"></i></button>
            `;

            animeItem.querySelector('.add-to-watchlist').addEventListener('click', () => {
                addToWatchlist(animeItem);
            });

            animeSearchResults.appendChild(animeItem);
        }
    }

    function updateSearchPaginationButtons() {
        prevSearchPageButton.disabled = currentPage === 1;
        nextSearchPageButton.disabled = currentPage === totalPages;
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
        watchlistItem.querySelector('button').outerHTML = '<button class="remove-from-watchlist"><i class="fas fa-trash-alt"></i></button>';

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
        watchlistTotalPages = Math.ceil(watchlist.length / resultsPerPage);
        watchlistPage = 1;
        renderWatchlist();
        updateWatchlistPaginationButtons();
    }

    function loadWatchlist() {
        const watchlist = JSON.parse(localStorage.getItem('animeWatchlist')) || [];
        watchlistTotalPages = Math.ceil(watchlist.length / resultsPerPage);
        watchlistPage = 1;
        renderWatchlist();
        updateWatchlistPaginationButtons();
    }

    function renderWatchlist() {
        animeWatchlist.innerHTML = '';

        const watchlist = JSON.parse(localStorage.getItem('animeWatchlist')) || [];
        const startIndex = (watchlistPage - 1) * resultsPerPage;
        const endIndex = Math.min(startIndex + resultsPerPage, watchlist.length);

        for (let i = startIndex; i < endIndex; i++) {
            const anime = watchlist[i];

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
                <button class="remove-from-watchlist"><i class="fas fa-trash-alt"></i></button>
            `;

            watchlistItem.querySelector('.remove-from-watchlist').addEventListener('click', () => {
                removeAnime(watchlistItem);
            });

            animeWatchlist.appendChild(watchlistItem);
        }
    }

    function updateWatchlistPaginationButtons() {
        prevWatchlistPageButton.disabled = watchlistPage === 1;
        nextWatchlistPageButton.disabled = watchlistPage === watchlistTotalPages;
        watchlistPagination.style.display = watchlistTotalPages > 1 ? 'block' : 'none';
    }
});
