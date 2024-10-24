export default class MovieDto {
    constructor({
        id = '',
        title = 'Unknown Title',
        directors = 'Unknown',
        genres = 'Unknown',
        releaseDate = 'Unknown',
        posterPath = '',
        overview = 'No description available',
        rating = 0,
    }) {
        this.id = id;
        this.title = title;
        this.directors = directors;
        this.genres = genres;
        this.releaseDate = releaseDate;
        this.posterPath = posterPath;
        this.overview = overview;
        this.rating = rating;
    }
}
