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
const no_found = document.querySelector('.no-found')
const view_more_container = document.querySelector('.view-more-container')

var page_num = 1;
var external_id = null;

/* add click listener to each movie-card added */
function addCardEventListener() {
    let open = document.querySelectorAll('.movie-card')
    open.forEach(card => {
        card.addEventListener('click', () => {
            let movieId = card.dataset.id
            let overview = card.dataset.overview
            let title = card.dataset.title

            fetchVideo(movieId, overview, title)
            overlay.classList.add('show')
        })
    })
}

/* add movie cards to grid element */
function addMovie(movieGridElement, movies){
    movies.forEach(movie => {
        /* adjusts length of movie title */
        let newTitle = movie.title
        if (movie.title.length > 17){
            newTitle = movie.title.slice(0, 17)
            newTitle = newTitle.concat("...")
        }
        
        movieGridElement.innerHTML += getMovieHTML(movie, newTitle)
    })  
    /* reveal back to top btn if scrollHeight exceeds length */
    let movieGrid = document.querySelector('.movies-grid')
    if (movieGrid.scrollHeight > 2500){
        back_top_button.classList.remove('hidden')
    }
}

/* returns HTML of a movie-card div */
function getMovieHTML(movie, newTitle){
    return `
    <div class="movie-card" data-id="${movie.id}" data-overview="${movie.overview}" data-title="${movie.title}">
        <img class="movie-poster" src="${imageBaseUrl}/w342${movie.poster_path}" alt="${movie.title}" title="${movie.title}"/>
        <h2 class="movie-title">${newTitle}</h2>
        <h3 class="movie-votes">Ratings: ${movie.vote_average}</h3>
     </div>
        
    `
}

/* returns HTML of a pop-up/modal div */
function getModalHTML(overview, title, key, flag){
    if (flag == 1){
        return `
        <div class="modal-card show">
            <h2>${title}</h2>
            <p>${overview}</p>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}"></iframe>
            <button id="view-more-btn">View More</button>
        </div>    
        `
    }
    else{
        return `
        <div class="modal-card show">
            <h2>${title}</h2>
            <p>${overview}</p>
        </div>
        `
    }
}

function getViewHTML(releaseDate, genres, runtime, backdropPath){
    return `
    <div class="modal-card show">
        <h3 class="movie-title">Movie BackDrop</h3>
        <img class="backdrop" src="${imageBaseUrl}/w342${backdropPath}" alt="movie backdrop"/>
        <h2>Release Date: ${releaseDate}</h2>
        <h2>Runtime: ${runtime} minutes</h2>
        <button id="go-back-btn">Go Back</button>
    </div>  
    `
}

function addEventListeners(){
    load_more_button.addEventListener('click', () => {
        page_num += 1
        fetchMovies(api_key, external_id)
    })

    search_input.addEventListener('keypress', (event) => {
        if (event.key === "Enter"){
            event.preventDefault();
            resetVars()
            external_id = event.target.value;
            fetchMovies(api_key, external_id)
            exit_button.classList.remove('hidden')
        }
    })

    exit_button.addEventListener('click', () => {
        resetVars()
        external_id = null;
        search_input.value = ``;
        fetchMovies(api_key, external_id);
        exit_button.classList.add('hidden')
    })

    back_top_button.addEventListener('click', () => {
        document.documentElement.scrollTop = 0;
    })

    overlay.addEventListener('click', () => {
        const modals = document.querySelectorAll('.modal-card')
        modals.forEach(modal => {
            modal.classList.remove('show')
        })
        modal_container.classList.add('hidden')
        view_more_container.classList.add('hidden')
        overlay.classList.remove('show')
    })

}

const fetchVideo = async (movieId, overview, title) => {
    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${api_key}&language=en-US`);
        const data = await res.json();
        let key = data.results[0].key

        const res1 = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${api_key}&language=en-US`);
        const data1 = await res1.json();
        
        modal_container.innerHTML = getModalHTML(overview, title, key, 1)
        view_more_container.innerHTML = getViewHTML(data1.release_date, data1.genres, data1.runtime, data1.backdrop_path)
        document.getElementById('view-more-btn').addEventListener('click', () => {
            view_more_container.classList.remove('hidden')
            modal_container.classList.add('hidden')
        })
        document.getElementById('go-back-btn').addEventListener('click', () => {
            view_more_container.classList.add('hidden')
            modal_container.classList.remove('hidden')
        })
    } catch (err) {
        modal_container.innerHTML = getModalHTML(overview, title, 0, 0)
    }
    modal_container.classList.remove('hidden')
}

const fetchMovies = async (apiKey, external_id) => {
    if (external_id != null){
        try{
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=en-US&query=${external_id}&page=${page_num}&include_adult=false`);
            const data = await res.json();

            load_more_button.classList.remove('hidden')

            if (data.results.length == 0){
                movie_grid.innerHTML = ``
                no_found.innerHTML = `
                <h1>No Movie Found</h1>
                `
                hideButtons()
            } else{
                addMovie(movie_grid, data.results)
            }
        } catch(err){

        }
    }
    else{
        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page_num}`);
            const data = await res.json();
            addMovie(movie_grid, data.results)
        } catch (err){
            console.error(err)
        }
    }
    addCardEventListener();
}

function hideButtons(){
    back_top_button.classList.add('hidden')
    load_more_button.classList.add('hidden')
}

function resetVars(){
    movie_grid.innerHTML = ``
    modal_container.innerHTML = ``
    page_num = 1
    no_found.innerHTML = ``
    load_more_button.classList.remove('hidden')
}

window.onload = function () {
    fetchMovies(api_key, external_id);
    addEventListeners()
}
 