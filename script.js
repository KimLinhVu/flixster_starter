const movie_grid = document.querySelector(".movies-grid")
const modal_container = document.querySelector(".modal-container")
const imageBaseUrl = 'https://image.tmdb.org/t/p'
const api_key = "35f2fd51799bb7ebced7f207d3475953"
const load_more_button = document.getElementById('load-more-movies-btn')
const search_input = document.getElementById('search-input')
const exit_button = document.querySelector(".close")
const back_top_button = document.getElementById('back-to-top-btn')
const overlay = document.getElementById('overlay')
const container = document.querySelector('.container')

var page_num = 1;
var card_id = 0;
var movie_id = 0;
var external_id = null;
var key;

function addCardEventListener() {
    let open = document.querySelectorAll('.movie-card')
    open.forEach(card => {
        card.addEventListener('click', () => {
            // const modal = document.querySelector(card.dataset.modalTarget)
            /* get movieid from modal attribute */
            console.log(card.dataset.id)
            let movieId = card.dataset.id
            let overview = card.dataset.overview

            fetchVideo(movieId, overview)

            overlay.classList.add('show')
        })
    })
}

function addMovieHTML(movieGridElement, movie){
    /* adjust length of movie title */
    let newTitle = movie.title
    if (movie.title.length > 17){
        newTitle = movie.title.slice(0, 17)
        newTitle = newTitle.concat("...")
    }
    /* add data-movie id to movie-card div */
    /* return html in another function */
    movieGridElement.innerHTML += `
    <div class="movie-card" data-id="${movie.id}" data-overview="${movie.overview}">
        <img class="movie-poster" src="${imageBaseUrl}/w342${movie.poster_path}" alt="${movie.title}" title="${movie.title}"/>
        <h2 class="movie-title">${newTitle}</h2>
        <h3 class="movie-votes">Ratings: ${movie.vote_average}</h3>
    </div>
    `
    // fetchVideo(api_key, movie, modal_container)   

    
    if (movie_grid.scrollHeight > 1000){
        back_top_button.classList.remove('hidden')
        console.log("here")
    }
}

function addMovies(movies){
    movies.forEach(movie => {
        addMovieHTML(movie_grid, movie)
    })
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
            exit_button.classList.remove('hidden')
        }
    })

    exitButton.addEventListener('click', () => {
        
        resetVars()
        external_id = null;
        searchInput.value = ``;
        fetchMovies(api_key, external_id);
        exit_button.classList.add('hidden')
    })

    backToTopBtn.addEventListener('click', () => {
        document.documentElement.scrollTop = 0;
    })

    overlay.addEventListener('click', () => {
        const modal = document.querySelector('.modal-card')
        modal.classList.remove('show')
        modal_container.classList.add('hidden')
        overlay.classList.remove('show')
    })

}

const fetchVideo = async (movieId, overview) => {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${api_key}&language=en-US`);
        const data = await res.json();
        key = data.results[0].key
        
        /* put in another function */
        modal_container.innerHTML = `
        <div class="modal-card show">
            <p>${overview}</p>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}"></iframe>
        </div>
        `
        modal_container.classList.remove('hidden')
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
            load_more_button.classList.remove('hidden')

            if (data.results.length == 0){
                movie_grid.innerHTML = `
                <h1>No Movies Found</h1>
                `
            }
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
 