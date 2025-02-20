const API_KEY = '82d9e98c7b770acc856e064a7ec5643f';
const BASE_URL = 'https://api.themoviedb.org/3';

// Funktion, um Filme für eine bestimmte Kategorie zu rendern
function renderMovies(movies, containerId) {
    const movieList = document.getElementById(containerId);
    movieList.innerHTML = '';

    movies.forEach(movie => {
        const moviePosterPath = movie.poster_path;
        if (moviePosterPath) {
            const moviePoster = `https://image.tmdb.org/t/p/w500${moviePosterPath}`;
            const li = document.createElement('li');
            li.classList.add('movie-card');

            // Link zum Detailfilm
            const movieLink = document.createElement('a');
            movieLink.href = `movie-details.html?id=${movie.id}`; 

            // zusätzliche Hover-effekte für Filmdetails
            fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`)
                .then(response => response.json())
                .then(details => {
                    const releaseYear = details.release_date ? details.release_date.split('-')[0] : 'Unbekannt';
                    const runtime = details.runtime ? `${details.runtime} Min.` : 'Unbekannt';
                    const ageRating = details.adult ? '18+' : 'jedes Alter';
                    const genres = details.genres.map(genre => genre.name).join(', ');

                    li.innerHTML = `
                        <div class="movie-card">
                            <img src="${moviePoster}" alt="Movie Poster">
                            <div class="movie-details">
                                <p><strong>Jahr:</strong> ${releaseYear}</p>
                                <p><strong>Laufzeit:</strong> ${runtime}</p>
                                <p><strong>Alter:</strong> ${ageRating}</p>
                                <p><strong>Genres:</strong> ${genres}</p>
                            </div>
                        </div>
                    `;
                    movieLink.appendChild(li); 
                    movieList.appendChild(movieLink); 
                })
                .catch(error => console.error("Fehler beim Abrufen der Filmdetails:", error));
        }
    });
}

// Abrufen der Film-ID aus der URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

// Abrufen der Filmdetails
if (movieId) {
    fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`)
        .then(response => response.json())
        .then(movie => {
            document.getElementById('movie-poster').src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            document.getElementById('movie-title').textContent = movie.title;
            document.getElementById('movie-year').textContent = movie.release_date ? movie.release_date.split('-')[0] : 'Unbekannt';
            document.getElementById('movie-runtime').textContent = movie.runtime ? `${movie.runtime} Min.` : 'Unbekannt';
            document.getElementById('movie-age').textContent = movie.adult ? '18+' : 'jedes Alter';

            const genres = movie.genres.map(genre => genre.name);
            const initialGenres = genres.slice(0, 2);
            const allGenres = genres;
            const genresContainer = document.getElementById('movie-genres');

            genresContainer.textContent = initialGenres.join(', ');

            const moreGenresBtn = document.getElementById('moreGenresBtn');
            moreGenresBtn.addEventListener('click', () => {
                if (moreGenresBtn.textContent === 'Mehr') {
                    genresContainer.textContent = allGenres.join(', ');
                    moreGenresBtn.textContent = 'weniger';
                } else {
                    genresContainer.textContent = initialGenres.join(', ');
                    moreGenresBtn.textContent = 'Mehr';
                }
            });

            document.getElementById('movie-description').textContent = movie.overview || 'Keine Beschreibung verfügbar.';

            const addToCollectionBtn = document.getElementById('add-to-collection');
            updateCollectionButton(movie.id, addToCollectionBtn); 

            addToCollectionBtn.addEventListener('click', () => {
                toggleMovieInCollection(movie);
                updateCollectionButton(movie.id, addToCollectionBtn);
            });

            const markSeenBtn = document.getElementById('mark-seen');
            if (markSeenBtn) {
                markSeenBtn.addEventListener("click", () => {
                    toggleMovieSeenStatus(movieId);
                });
            }

            const markFavoriteBtn = document.getElementById('mark-favorite');
            if (markFavoriteBtn) {
                markFavoriteBtn.addEventListener("click", () => {
                    toggleMovieFavoriteStatus(movieId);
                });
            }
        })
        .catch(error => console.error("Fehler beim Abrufen der Filmdetails:", error));
}

function toggleMovieInCollection(movie) {
    let collection = JSON.parse(localStorage.getItem('movieCollection')) || [];
    const movieIndex = collection.findIndex(existingMovie => existingMovie.id === movie.id);

    if (movieIndex !== -1) {
        // Film entfernen
        collection.splice(movieIndex, 1);
        showNotification(`${movie.title} wurde aus der Sammlung entfernt!`, 'error');
    } else {
        // Film hinzufügen
        movie.seen = false;
        movie.favorite = false;
        movie.genre = movie.genres ? movie.genres[0]?.name : 'Unbekannt';

        collection.push(movie);
        showNotification(`${movie.title} wurde zur Sammlung hinzugefügt!`, 'success');
    }

    localStorage.setItem('movieCollection', JSON.stringify(collection));
}

function updateCollectionButton(movieId, button) {
    let collection = JSON.parse(localStorage.getItem('movieCollection')) || [];
    const isInCollection = collection.some(movie => movie.id === movieId);

    // Icon-Element innerhalb des Buttons finden
    const icon = button.querySelector('i');

    if (isInCollection) {
        button.innerHTML = `<i class="fa-solid fa-minus"></i> Aus Sammlung entfernen`;
        button.classList.add('remove-btn'); 
    } else {
        button.innerHTML = `<i class="fa-solid fa-plus"></i> Zur Sammlung hinzufügen`;
        button.classList.remove('remove-btn');
    }
}

function toggleMovieSeenStatus(movieId) {
    let collection = JSON.parse(localStorage.getItem("movieCollection")) || [];
    const movieIndex = collection.findIndex(movie => movie.id == movieId);

    if (movieIndex !== -1) {
        const movie = collection[movieIndex];

        // Status umschalten
        movie.seen = !movie.seen;
        localStorage.setItem("movieCollection", JSON.stringify(collection));

        // Button-Status aktualisieren
        updateSeenButton(movieId);

        // Nachricht anzeigen
        if (movie.seen) {
            showNotification("Film wurde als gesehen markiert!", "success");
        } else {
            showNotification("Film wurde als ungesehen markiert!", "info");
        }
    } else {
        showNotification("Film ist nicht in der Sammlung!", "error");
    }
}

function updateSeenButton(movieId) {
    let collection = JSON.parse(localStorage.getItem("movieCollection")) || [];
    const movie = collection.find(movie => movie.id == movieId);
    const markSeenBtn = document.getElementById("mark-seen");

    if (movie && movie.seen) {
        markSeenBtn.classList.add("seen");
        markSeenBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Mark as Unseen';
    } else {
        markSeenBtn.classList.remove("seen");
        markSeenBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Mark as Seen';
    }
}



document.addEventListener("DOMContentLoaded", function () {
    const listViewBtn = document.getElementById("list-view-btn");
    const gridViewBtn = document.getElementById("grid-view-btn");
    const movieList = document.getElementById("movie-collection-list");

    function setActiveView(button) {
        // Entfernt die "active"-Klasse von allen Buttons
        listViewBtn.classList.remove("active");
        gridViewBtn.classList.remove("active");

        // Fügt die "active"-Klasse nur dem geklickten Button hinzu
        button.classList.add("active");
    }

    listViewBtn.addEventListener("click", function () {
        movieList.classList.add("list-view");
        setActiveView(listViewBtn);
    });

    gridViewBtn.addEventListener("click", function () {
        movieList.classList.remove("list-view");
        setActiveView(gridViewBtn);
    });

    // Setzt beim Laden der Seite die Standardansicht auf Grid und markiert den Button
    setActiveView(gridViewBtn);
});

// Funktion, um die Sammlung zu sortieren
function sortCollection(sortBy) {
    const collectionList = document.getElementById('movie-collection-list');
    let collection = JSON.parse(localStorage.getItem('movieCollection')) || [];

    // Wenn "All" ausgewählt ist, gebe die Sammlung ohne Sortierung zurück
    if (sortBy === 'all') {
        renderCollection(collection); 
        return;
    }

    
    collection.sort((a, b) => {
        if (sortBy === 'title') {
            return a.title.localeCompare(b.title); 
        } else if (sortBy === 'release_date') {
            const dateA = new Date(a.release_date);
            const dateB = new Date(b.release_date);
            return dateA - dateB; 
        } else if (sortBy === 'seen') {
            return (b.seen ? 1 : 0) - (a.seen ? 1 : 0); 
        }
        return 0;
    });

    // Lädt die sortierte Sammlung
    renderCollection(collection);
}


document.addEventListener('DOMContentLoaded', () => {
    loadCollection(); 

    // Sortierung wird initialisiert
    const sortDropdown = document.getElementById('sort-by');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            const sortBy = e.target.value;
            sortCollection(sortBy);
        });
    }

    // Bearbeitungsmodus direkt aktiviert
    const editButton = document.getElementById('edit-btn');
    let isEditing = true;

    if (editButton) {
        editButton.classList.add('active');
        editButton.addEventListener('click', function () {
            isEditing = !isEditing;
            this.classList.toggle('active', isEditing);
            toggleDeleteButtons(isEditing);
        });
    }
});

// Funktion, um die Sammlung zu filtern oder zu sortieren
function filterOrSortCollection(filterBy) {
    let collection = JSON.parse(localStorage.getItem('movieCollection')) || [];

    if (filterBy === 'seen') {
        collection = collection.filter(movie => movie.seen); 
    } else if (filterBy === 'favorite') {
        collection = collection.filter(movie => movie.favorite); 
    }

    if (filterBy === 'title') {
        collection.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filterBy === 'release_date') {
        collection.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
    }

    renderCollection(collection);
}

// Event Listener für das Dropdown-Menü
document.addEventListener('DOMContentLoaded', () => {
    loadCollection();

    const sortDropdown = document.getElementById('sort-by');
    if (sortDropdown) {
        sortDropdown.addEventListener('change', (e) => {
            filterOrSortCollection(e.target.value);
        });
    }

    const editButton = document.getElementById('edit-btn');
    let isEditing = true;

    if (editButton) {
        editButton.classList.add('active');
        editButton.addEventListener('click', function () {
            isEditing = !isEditing;
            this.classList.toggle('active', isEditing);
            toggleDeleteButtons(isEditing);
        });
    }
});

// Funktion zum Laden und Anzeigen der Filme
function loadCollection() {
    const collectionList = document.getElementById('movie-collection-list');
    const collection = JSON.parse(localStorage.getItem('movieCollection')) || [];

    document.getElementById('movie-count').textContent = `Anzahl der Filme: ${collection.length}`; 
    collectionList.innerHTML = ''; 

    if (collection.length === 0) {
        collectionList.innerHTML = '<li>Deine Sammlung ist leer.</li>';
        return;
    }

    collection.forEach(movie => {
        const moviePoster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        const movieTitle = movie.title;

        const movieItem = document.createElement('li');
        movieItem.classList.add('movie-card');

        movieItem.innerHTML = `
            <div class="movie-card">
                <img src="${moviePoster}" alt="${movieTitle}" class="movie-poster">
                <button class="delete-btn">X</button>
            </div>
        `;

       
        const deleteBtn = movieItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (event) => {
            event.stopPropagation(); 
            deleteMovieFromCollection(movie.id, movieItem);
        });

        // Klick auf die Filmkarte führt zur Detailseite
        movieItem.addEventListener('click', () => {
            console.log("Film wurde geklickt:", movie.title, "ID:", movie.id);
            window.location.href = `movie-details.html?id=${movie.id}`;
        });

        collectionList.appendChild(movieItem);
    });
}

// Funktion, um Filme zu löschen 
function deleteMovieFromCollection(movieId, movieElement) {
    let collection = JSON.parse(localStorage.getItem('movieCollection')) || [];

    // Film aus dem LocalStorage entfernen
    collection = collection.filter(movie => movie.id !== movieId);
    localStorage.setItem('movieCollection', JSON.stringify(collection));

    
    movieElement.remove();

    document.getElementById('movie-count').textContent = `Anzahl der Filme: ${collection.length}`;

    showNotification('Film wurde aus der Sammlung entfernt.', 'success');
}

// Funktion zum Anzeigen oder Verbergen der Löschen-Buttons
function toggleDeleteButtons(show) {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.style.display = show ? 'block' : 'none';
    });
}

// Funktion, um die Sammlung zu rendern
function renderCollection(collection, showDeleteButtons = false) {
    const collectionList = document.getElementById('movie-collection-list');
    document.getElementById('movie-count').textContent = `Anzahl der Filme: ${collection.length}`;
    
    collectionList.innerHTML = ''; 

    if (collection.length === 0) {
        collectionList.innerHTML = '<li>Deine Sammlung ist leer.</li>';
    } else {
        collection.forEach(movie => {
            const moviePoster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
            const movieTitle = movie.title;

            
            const movieLink = document.createElement('a');
            movieLink.href = `movie-details.html?id=${movie.id}`;
            movieLink.classList.add('movie-link');

            
            const movieItem = document.createElement('li');
            movieItem.classList.add('movie-card');

            movieItem.innerHTML = `
                <div class="movie-card">
                    <img src="${moviePoster}" alt="${movieTitle}" class="movie-poster">
                    <button class="delete-btn" style="display: ${showDeleteButtons ? 'block' : 'none'};">X</button>  <!-- Löschen-Button oben rechts -->
                </div>
            `;

            // Event-Listener für Löschen
            const deleteBtn = movieItem.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteMovieFromCollection(movie.id));

            // Fügt den Link zur Kachel hinzu
            movieLink.appendChild(movieItem);

            // Fügt die Kachel zur Sammlungsliste hinzu
            collectionList.appendChild(movieLink);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    let currentLang = localStorage.getItem("language") || "de";

    async function loadLanguage(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) throw new Error("Übersetzungsdatei nicht gefunden");

            const translations = await response.json();

            // Navigation aktualisieren (nur wenn Elemente vorhanden sind)
            document.title = translations.page_title || document.title;

            const logoElement = document.querySelector(".logo a");
            if (logoElement) logoElement.innerHTML = `MY <span class="mocologo">MOCO</span>`;

            const navLinks = document.querySelectorAll(".links li a");
            if (navLinks.length >= 3) {
                navLinks[0].textContent = translations.home || "Home";
                navLinks[1].textContent = translations.movies || "Movies";
                navLinks[2].textContent = translations.my_collection || "My Collection";
            }

            // Überschriften und Buttons 
            const headerTitle = document.querySelector(".head_container h2");
            if (headerTitle) headerTitle.textContent = translations.title || "Meine Filmsammlung";

            const editBtn = document.getElementById("edit-btn");
            if (editBtn) editBtn.textContent = translations.edit || "Bearbeiten";

            const listViewBtn = document.getElementById("list-view-btn");
            if (listViewBtn) listViewBtn.textContent = translations.list_view || "Listenansicht";

            const gridViewBtn = document.getElementById("grid-view-btn");
            if (gridViewBtn) gridViewBtn.textContent = translations.grid_view || "Kachelansicht";

            const einleitung = document.getElementById("container_einleitung");
            if (einleitung) einleitung.textContent = translations.container_einleitung || "";

            // Sortieroptionen werden aktualisiert
            const sortBySelect = document.getElementById("sort-by");
            if (sortBySelect) {
                sortBySelect.querySelector("option[value='all']").textContent = translations.all || "Alle";
                sortBySelect.querySelector("option[value='title']").textContent = translations.title_option || "Titel";
                sortBySelect.querySelector("option[value='release_date']").textContent = translations.release_date || "Veröffentlichungsdatum";
                sortBySelect.querySelector("option[value='seen']").textContent = translations.watched || "Gesehen";
                sortBySelect.querySelector("option[value='favorite']").textContent = translations.favorite || "Favorit";
            }
            

            // Inhalt der Abschnitte aktualisieren
            const containerItems = [
                { selector: ".container_eins h3", text: translations.add_movie || "Film hinzufügen" },
                { selector: ".container_eins p", text: translations.description_one || "Easily browse movies and add them to your collection." },
                { selector: ".container_zwei h3", text: translations.save_favorites || "Favoriten speichern" },
                { selector: ".container_zwei p", text: translations.description_two || "Save your favorite movies to find them quickly." },
                { selector: ".container_drei h3", text: translations.watched_label || "Gesehen" },
                { selector: ".container_drei p", text: translations.description_three || "Mark movies you have already watched." },
                { selector: ".container_vier h3", text: translations.rating || "Bewertung" },
                { selector: ".container_vier p", text: translations.description_four || "Rate movies and give them a review." },
                { selector: ".container_fuenf h3", text: translations.sort || "Sortieren" },
                { selector: ".container_fuenf p", text: translations.description_five || "Organize your collection according to your preferences." }
            ];

            containerItems.forEach(item => {
                const el = document.querySelector(item.selector);
                if (el) el.textContent = item.text;
            });

            // Anzahl der Filme aktualisieren
            const movieCountElement = document.getElementById("movie-count");
            if (movieCountElement) {
                const collection = JSON.parse(localStorage.getItem("movieCollection")) || [];
                movieCountElement.innerHTML = `${translations.movie_count || "Anzahl der Filme"}: ${collection.length}`;
            }

            
            
            const footerCopyright = document.querySelector(".footer_mitte p");
            if (footerCopyright) footerCopyright.textContent = translations.footer_copyright || "© 2025 MOCO. Alle Rechte vorbehalten.";

            const footerLinks = document.querySelectorAll(".footer_rechts a");
            if (footerLinks.length >= 3) {
                footerLinks[0].textContent = translations.footer_privacy || "Datenschutz";
                footerLinks[1].textContent = translations.footer_imprint || "Impressum";
                footerLinks[2].textContent = translations.footer_contact || "Kontakt";
            }

            // Sprache in Local Storage speichern
            localStorage.setItem("language", lang);
        } catch (error) {
            console.error("Fehler beim Laden der Sprache:", error);
        }
    }

    function setupLanguageSwitcher() {
        const languageSwitcher = document.getElementById("languageSwitcher");
        if (languageSwitcher) {
            languageSwitcher.value = currentLang;
            languageSwitcher.addEventListener("change", (event) => {
                loadLanguage(event.target.value);
            });
        } else {
            console.warn("Kein Language Switcher gefunden!");
        }
    }

    // Observer, um sicherzustellen, dass der Language-Switcher geladen wurde
    const observer = new MutationObserver(() => {
        if (document.getElementById("languageSwitcher")) {
            observer.disconnect();
            setupLanguageSwitcher();
            loadLanguage(currentLang);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Sprache direkt beim Laden setzen
    loadLanguage(currentLang);
});





function showNotification(message, type) {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'error' : 'success'}`;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Funktion, Filme von der API abzurufen
function fetchMovies(endpoint, containerId) {
    fetch(`${BASE_URL}${endpoint}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            if (movies) {
                renderMovies(movies, containerId);
            } else {
                console.log(`Keine Filme gefunden für ${containerId}`);
            }
        })
        .catch(error => console.error(`Fehler beim Abrufen der Filme für ${containerId}:`, error));
}

// Funktion, die Suchergebnisse anzeigt
function searchMovies(query) {
    fetch(`${BASE_URL}/search/movie?query=${query}&api_key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            const movieList = document.getElementById('movie-list');
            movieList.innerHTML = ''; 

            if (movies && movies.length > 0) {
                renderMovies(movies, 'movie-list'); 
                // Versteckt alle Kategorien, wenn eine Suche stattfindet
                document.querySelectorAll('.category').forEach(category => {
                    category.style.display = 'none';
                });
                document.querySelector('.kachelansicht').style.display = 'block'; 
            } else {
                movieList.innerHTML = '<p>Keine Filme gefunden.</p>'; 
            }
        })
        .catch(error => console.error("Fehler bei der Suche nach Filmen:", error));
}

// Beim Laden der Seite werden Filme für jede Kategorie abgerufen
document.addEventListener('DOMContentLoaded', () => {
    
    fetchMovies('/movie/popular?', 'popular-movie-list'); 
    fetchMovies('/discover/movie?with_genres=28', 'action-adventure-movie-list'); 
    fetchMovies('/movie/now_playing?', 'new-releases-movie-list'); 
    fetchMovies('/trending/movie/day?', 'trending-movie-list'); 
    fetchMovies('/discover/movie?with_genres=27', 'horror-movie-list'); 

    
    loadCollection();
});

// Event-Listener für das Suchfeld
document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
        searchMovies(query); 
    } else {
        // Wenn das Suchfeld leer ist, zeigt die Standardkategorien wieder an
        document.querySelectorAll('.category').forEach(category => {
            category.style.display = 'block'; 
        });
        document.querySelector('.kachelansicht').style.display = 'none'; 
        // Lädt wieder die Filme der Standardkategorien
        fetchMovies('/movie/popular?', 'popular-movie-list');
        fetchMovies('/discover/movie?with_genres=28', 'action-adventure-movie-list');
        fetchMovies('/movie/now_playing?', 'new-releases-movie-list');
        fetchMovies('/trending/movie/day?', 'trending-movie-list');
        fetchMovies('/discover/movie?with_genres=27', 'horror-movie-list');
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search');
    const clearIcon = document.getElementById('clear-search-icon');

    searchInput.addEventListener('input', function () {
        if (searchInput.value.length > 0) {
            clearIcon.classList.add('visible'); 
        } else {
            clearIcon.classList.remove('visible'); 
        }
    });

    // Wenn auf das X geklickt wird, leert das Eingabefeld und versteckt das Icon
    clearIcon.addEventListener('click', function () {
        searchInput.value = '';
        clearIcon.classList.remove('visible');
        searchInput.focus(); 
    });
});


// Funktion, um einen Film als "gesehen" oder "Favorit" zu markieren und in der Sammlung zu speichern
function markMovie(movie, type) {
    const collection = JSON.parse(localStorage.getItem('movieCollection')) || [];

    // Suchen des Films in der Sammlung
    const movieIndex = collection.findIndex(existingMovie => existingMovie.id === movie.id);
    if (movieIndex === -1) {
        movie[type] = true; 
        collection.push(movie);
    } else {
        collection[movieIndex][type] = true; 
    }
    
    localStorage.setItem('movieCollection', JSON.stringify(collection));
    showNotification(`${movie.title} wurde als ${type === 'seen' ? 'gesehen' : 'Favorit'} markiert!`, 'success');
}



document.addEventListener("DOMContentLoaded", () => {
    const markFavoriteBtn = document.getElementById("mark-favorite");

    if (markFavoriteBtn && movieId) {
        updateFavoriteButton(movieId); 

        markFavoriteBtn.addEventListener("click", () => {
            toggleMovieFavoriteStatus(movieId);
        });
    }
});



function toggleMovieFavoriteStatus(movieId) {
    let collection = JSON.parse(localStorage.getItem("movieCollection")) || [];
    const movieIndex = collection.findIndex(movie => movie.id == movieId);

    if (movieIndex !== -1) {
        const movie = collection[movieIndex];

        // Favoriten-Status umschalten
        movie.favorite = !movie.favorite;
        localStorage.setItem("movieCollection", JSON.stringify(collection));

        // Button-Status aktualisieren
        updateFavoriteButton(movieId);

        // Nachricht anzeigen
        if (movie.favorite) {
            showNotification("Film wurde zu den Favoriten hinzugefügt!", "success");
        } else {
            showNotification("Film wurde aus den Favoriten entfernt!", "info");
        }
    } else {
        showNotification("Film ist nicht in der Sammlung!", "error");
    }
}



function updateFavoriteButton(movieId) {
    let collection = JSON.parse(localStorage.getItem("movieCollection")) || [];
    const movie = collection.find(movie => movie.id == movieId);
    const markFavoriteBtn = document.getElementById("mark-favorite");

    if (movie && movie.favorite) {
        markFavoriteBtn.classList.add("active");
        markFavoriteBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Remove from Favorites';
    } else {
        markFavoriteBtn.classList.remove("active");
        markFavoriteBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Add to Favorites';
    }
}

markSeenBtn.addEventListener("click", () => {
    console.log("Button wurde geklickt!"); // Test-Log
    toggleMovieSeenStatus(movieId);
});