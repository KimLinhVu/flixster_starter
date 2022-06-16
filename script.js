const movie_grid = document.querySelector(".movies-grid")
const modal_container = document.querySelector(".modal-container")
const imageBaseUrl = 'https://image.tmdb.org/t/p'
const api_key = "35f2fd51799bb7ebced7f207d3475953"
const load_more_button = document.getElementById('load-more-movies-btn')
const search_input = document.getElementById('search-input')
const exit_button = document.querySelector(".close")
const back_top_button = document.getElementById('back-to-top-btn')
const overlay = document.getElementById('overlay')

var page_num = 1;
var id = 0;
var external_id = null;

function addCardEventListener() {
    let open = document.querySelectorAll('[data-modal-target]')
    open.forEach(card => {
        card.addEventListener('click', () => {
            const modal = document.querySelector(card.dataset.modalTarget)
            
            overlay.classList.add('show')
            modal.classList.add('show')
        })
    })
}

function addMovieHTML(movieGridElement, modalContainer, movie){
    movieGridElement.innerHTML += `
    <div class="movie-card" data-modal-target="#modal-card${id}">
        <h2 class="movie-title">${movie.title}</h2>
        <img class="movie-poster" src="${imageBaseUrl}/w342${movie.poster_path}" alt="${movie.original_title}" title="${movie.title}"/>
        <h3 class="movie-votes">Ratings: ${movie.vote_average}</h3>
    </div>
    `
    modalContainer.innerHTML += `
    <div class="modal-card" id="modal-card${id++}">
        <h2>More About ${movie.original_title}</h2>
        <p>${movie.overview}</p>
    </div>
    `
}

function addMovies(movies){

    movies.forEach(movie => {
        addMovieHTML(movie_grid, modal_container, movie)
    }
    )
}

function addEventListeners(loadMoreButton, searchInput, exitButton, backToTopBtn, overlay, movieGrid, modalContainer){
    loadMoreButton.addEventListener('click', () => {
        page_num += 1
        fetchMovies(api_key, external_id)
    })

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === "Enter"){
            event.preventDefault();
            movieGrid.innerHTML = ``;
            modalContainer.innerHTML = ``;
            page_num = 1;
            id = 0;
            external_id = event.target.value;
            fetchMovies(api_key, external_id)
        }
    })

    exitButton.addEventListener('click', () => {
        movieGrid.innerHTML = ``;
        modalContainer.innerHTML = ``;
        external_id = null;
        page_num = 1;
        id = 0;
        searchInput.value = '';
        fetchMovies(api_key, external_id);
    })

    backToTopBtn.addEventListener('click', () => {
        document.documentElement.scrollTop = 0;
    })

    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.show')
        modals.forEach(modal => {
            modal.classList.remove('show')
        })
    })

}

const fetchMovies = async (apiKey, external_id) => {
    
    if (external_id != null){
        try{
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${external_id}&page=${page_num}&include_adult=false`);
            const data = await res.json();
            console.log(data.results)
            addMovies(data.results)
        } catch (err){
            console.log(err)
        }
    }
    else{
        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page_num}`);
            const data = await res.json();
            addMovies(data.results)
        } catch (err){
            console.error(err)
        }
    }
    
    addCardEventListener();
}

window.onload = function () {
    fetchMovies(api_key, external_id);
    addEventListeners(load_more_button, search_input, exit_button, back_top_button, overlay, movie_grid, modal_container)
}
 