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
var card_id = 0;
var movie_id = 0;
var external_id = null;
var key;

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

function addMovieHTML(movieGridElement, movie){

    /* adjust length of movie title */
    let newTitle = movie.title
    if (movie.title.length > 19){
        newTitle = movie.title.slice(0, 19)
        newTitle = newTitle.concat("...")
    }
    movieGridElement.innerHTML += `
    <div class="movie-card" data-modal-target="#modal-card${movie_id++}">
        <h2 class="movie-title">${newTitle}</h2>
        <img class="movie-poster" src="${imageBaseUrl}/w342${movie.poster_path}" alt="${movie.title}" title="${movie.title}"/>
        <h3 class="movie-votes">Ratings: ${movie.vote_average}</h3>
    </div>
    `
    fetchVideo(api_key, movie, modal_container)   
}

function addMovies(movies){

    movies.forEach(movie => {
        addMovieHTML(movie_grid, movie)
    }
    )
}

function addEventListeners(loadMoreButton, searchInput, exitButton, backToTopBtn, overlay){
    loadMoreButton.addEventListener('click', () => {
        page_num += 1
        fetchMovies(api_key, external_id)
    })

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === "Enter"){
            event.preventDefault();
            
            resetVars()
            external_id = event.target.value;
            fetchMovies(api_key, external_id)
        }
    })

    exitButton.addEventListener('click', () => {
        resetVars()
        external_id = null;
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

const fetchVideo = async (apiKey, movie, modalContainer) => {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}&language=en-US`);
        const data = await res.json();
        key = data.results[0].key
        
        modalContainer.innerHTML += `
        <div class="modal-card" id="modal-card${card_id++}">
            <h2>More About ${movie.title}</h2>
            <p>${movie.overview}</p>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}"></iframe>
        </div>
        `
    } catch (err) {
        console.log(err)
        modalContainer.innerHTML += `
        <div class="modal-card" id="modal-card${card_id++}">
            <h2>More About ${movie.title}</h2>
            <p>${movie.overview}</p>
        </div>
        `
    }
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

function resetVars(){
    movie_grid.innerHTML = ``
    modal_container.innerHTML = ``
    page_num = 1
    movie_id = 0
    card_id = 0
}

window.onload = function () {
    fetchMovies(api_key, external_id);
    addEventListeners(load_more_button, search_input, exit_button, back_top_button, overlay)
}
 