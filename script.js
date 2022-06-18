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
const tv_show_btn = document.querySelector('.tv-show')
const show_movie_btn = document.querySelector('.show-movie')
const rootElement = document.documentElement

var page_num = 1;
var external_id = null;
var type = "movie"

/* makes API calls to fetch array of movies and calls addMovie() to add movie cards */
const fetchMovies = async (apiKey, external_id, movieId) => {
    /* fetches queried list of movies if external_id is provided */
    if (external_id != null){
        try{
            const res = await fetch(`https://api.themoviedb.org/3/search/${type}?api_key=${apiKey}&language=en-US&query=${external_id}&page=${page_num}&include_adult=false`);
            const data = await res.json();

            /* unhides load more button */
            load_more_button.classList.remove('hidden')

            /* if array is empty, display "No Results Found" */
            if (data.results.length == 0){
                movie_grid.innerHTML = ``
                no_found.innerHTML = `
                <h2>No Results Found</h2>
                `
                hideButtons()
            } else{
                addMovie(movie_grid, data.results)
            }
        } catch(err){

        }
    }
    /* fetches recommended list of movies if movieId provided */
    else if (movieId != null){
        try{
            const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}/recommendations?api_key=${apiKey}&language=en-US&page=${page_num}`);
            const data = await res.json();
            exit_button.classList.remove('hidden')
            addMovie(movie_grid, data.results)
        } catch (err){

        }
    }
    /* fetches current popular movies */
    else{
        try {
            const res = await fetch(`https://api.themoviedb.org/3/${type}/popular?api_key=${apiKey}&language=en-US&page=${page_num}`);
            const data = await res.json();
            addMovie(movie_grid, data.results)
        } catch (err){
        
        }
    }
    /* recalls addevent listeners */
    addCardEventListener();
}

/* makes API request to fetch first video associated with a movie/tv-show */
const fetchVideo = async (movieId, overview, title) => {
    try {
        /* gets movie key */
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}/videos?api_key=${api_key}&language=en-US`);
        const data = await res.json();
        let key = data.results[0].key

        /* gets additional information about movie */
        const res1 = await fetch(`https://api.themoviedb.org/3/${type}/${movieId}?api_key=${api_key}&language=en-US`);
        const data1 = await res1.json();
        
        /* updates pop-up modal and view-more container with info */
        modal_container.innerHTML = getModalHTML(overview, title, key, 1)
        view_more_container.innerHTML = getViewHTML(data1.release_date, data1.genres, data1.runtime, data1.backdrop_path)

        /* add click event listeners for view-more, recommended, close button, and go-back button */
        document.querySelectorAll('.fa').forEach(btn => {
            btn.addEventListener('click', () => {
                hidePopUps()
            })
        })
        document.getElementById('view-more-btn').addEventListener('click', () => {
            view_more_container.classList.remove('hidden')
            modal_container.classList.add('hidden')
        })
        document.getElementById('go-back-btn').addEventListener('click', () => {
            view_more_container.classList.add('hidden')
            modal_container.classList.remove('hidden')
        })
        document.getElementById('recommend-btn').addEventListener('click', () => {
            external_id = null
            hidePopUps()
            resetVars()
            fetchMovies(api_key, external_id, movieId)
            hideButtons()
            hideFilters()
            no_found.innerHTML = `
                <h2>Recommended For ${title}</h2>
            `
        })
    } catch (err) {
        modal_container.innerHTML = getModalHTML(overview, title, 0, 0)
    }
    modal_container.classList.remove('hidden')
}

/* add movie cards to grid element */
function addMovie(movieGridElement, movies){
    movies.forEach(movie => {
        /* adjusts length of movie title */
        let newTitle = ""
        let prevTitle = ""
        if (type == "movie"){
            newTitle = movie.title
        } else{
            newTitle = movie.name
        }
        prevTitle = newTitle;
        if (newTitle.length > 15){
            newTitle = newTitle.slice(0, 15)
            newTitle = newTitle.concat("...")
        }
        /* adds movie-card HTML to container element */
        movieGridElement.innerHTML += getMovieHTML(movie, prevTitle, newTitle)
    })  
    /* reveal back to top btn if scrollHeight exceeds length */
    let movieGrid = document.querySelector('.movies-grid')
    if (movieGrid.scrollHeight > 2500){
        back_top_button.classList.remove('hidden')
    }
}

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

/* returns HTML of a movie-card div */
function getMovieHTML(movie, prevTitle, newTitle){
    return `
    <div class="movie-card" data-id="${movie.id}" data-overview="${movie.overview}" data-title="${prevTitle}">
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
            <i class="fa fa-times-circle" id="close_button"></i>
            <h2 class="modal-title">${title}</h2>
            <p>${overview}</p>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/${key}" allow="fullscreen"></iframe>
            <button id="view-more-btn">View More</button>
        </div>    
        `
    }
    else{
        /* if no video was fetched, return card w/o embedded video element */
        return `
        <div class="modal-card show">
            <i class="fa fa-times-circle" id="close_button"></i>
            <h2>${title}</h2>
            <p>${overview}</p>
        </div>
        `
    }
}

/* returns HTML for a view-more card div */
function getViewHTML(releaseDate, genres, runtime, backdropPath){
    let genreString = '';
    genres.forEach(genre => {
        genreString = genreString.concat(genre.name, ", ")
    })
    genreString = genreString.slice(0, genreString.length - 2)
    return `
    <div class="view-more-card show">
        <i class="fa fa-times-circle" id="close_button"></i>
        <h2 class="movie-title">Movie BackDrop</h2>
        <img class="backdrop" src="${imageBaseUrl}/w342${backdropPath}" alt="movie backdrop"/>
        <div class="info">
            <h3>Release Date: ${releaseDate}</h3>
            <h3>Runtime: ${runtime} minutes</h3>
            <h3>Genre: ${genreString}</h3>
        </div>
        <div class="buttons">
            <button id="recommend-btn">More Videos Like This</button>
            <button id="go-back-btn">Go Back</button>
        </div>
    </div>  
    `
}

/* adds event listeners to all buttons, overlay, and search input */
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
        rootElement.scrollTo(0, 0)
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

    tv_show_btn.addEventListener('click', () => {
        type = "tv"
        resetVars()
        fetchMovies(api_key, external_id)
        tv_show_btn.classList.add('hidden')
        show_movie_btn.classList.remove('hidden')
        search_input.placeholder = "Search For TV Shows"
    })

    show_movie_btn.addEventListener('click', () => {
        type = "movie"
        resetVars()
        fetchMovies(api_key, external_id)
        show_movie_btn.classList.add('hidden')
        tv_show_btn.classList.remove('hidden')
        search_input.placeholder = "Search For Movies"
    })

}

/* hides loadmore and back-to-top buttons */
function hideFilters(){
    tv_show_btn.classList.add('hidden')
    show_movie_btn.classList.add('hidden')
}
function hideButtons(){
    back_top_button.classList.add('hidden')
    load_more_button.classList.add('hidden')
}

function hidePopUps(){
    view_more_container.classList.add('hidden')
    overlay.classList.remove('show')
    modal_container.classList.add('hidden')
    
}

/* resets global varialbes and innerHTML of container divs */
function resetVars(){
    movie_grid.innerHTML = ``
    modal_container.innerHTML = ``
    page_num = 1
    no_found.innerHTML = ``
    load_more_button.classList.remove('hidden')
    tv_show_btn.classList.remove('hidden')
}

window.onload = function () {
    fetchMovies(api_key, external_id);
    addEventListeners()
}
 