const movie_grid = document.querySelector(".movies-grid")
const imageBaseUrl = 'https://image.tmdb.org/t/p'
const api_key = "35f2fd51799bb7ebced7f207d3475953"
const load_more_button = document.getElementById('load-more-movies-btn')
const search_input = document.getElementById('search-input')
const exit_button = document.querySelector(".close")
const back_top_button = document.getElementById('back-to-top-btn')

var page_num = 1;
var external_id = null;

function addMovieHTML(movieGridElement, movie){
    movieGridElement.innerHTML += `
    <div class="movie-card">
        <h2 class="movie-title">${movie.original_title}</h2>
        <img class="movie-poster" src="${imageBaseUrl}/w342${movie.poster_path}" alt="${movie.original_title}" title="${movie.original_title}"/>
        <h3 class="movie-votes">Ratings: ${movie.vote_average}</h3>
    </div>
    `
}

function addMovies(movies){

    movies.forEach(movie => {
        addMovieHTML(movie_grid, movie)
    }
    )
}

function addEventListeners(loadMoreButton, searchInput, exitButton, backToTopBtn, movie_grid){
    loadMoreButton.addEventListener('click', () => {
        page_num += 1
        fetchMovies(api_key, external_id)
        // let height = movie_grid.scrollHeight;
        // console.log(height)
        // document.documentElement.scrollTop = height + 2000;
    })

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === "Enter"){
            event.preventDefault();
            movie_grid.innerHTML = ``;
            page_num = 1;
            external_id = event.target.value;
            fetchMovies(api_key, external_id)
        }
    })

    exitButton.addEventListener('click', () => {
        movie_grid.innerHTML = ``;
        external_id = null;
        page_num = 1;
        searchInput.value = '';
        fetchMovies(api_key, external_id);
    })

    backToTopBtn.addEventListener('click', () => {
        document.documentElement.scrollTop = 0;
    })

}

const fetchMovies = async (api_key, external_id) => {
    
    if (external_id != null){
        try{
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${api_key}&language=en-US&query=${external_id}&page=${page_num}&include_adult=false`);
            const data = await res.json();
            addMovies(data.results)
        } catch (err){
            console.log(err)
        }
    }
    else{
        try {
            const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${api_key}&language=en-US&page=${page_num}`);
            const data = await res.json();
            addMovies(data.results)
        } catch (err){
            console.error(err)
        }
    }
    
}

window.onload = function () {
    fetchMovies(api_key, external_id);
    addEventListeners(load_more_button, search_input, exit_button, back_top_button, movie_grid)
}
 