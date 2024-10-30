using DifColl.Server.DTOs;
using DifColl.Server.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public interface INexusCollectionService
{
    Task<List<NexusItemDto>> GetAllNexusItemsAsync(string userId);
    Task<List<BookDto>> GetUserBooksAsync(string userId);
    Task<List<MovieDto>> GetUserMoviesAsync(string userId);
    Task<List<GameDto>> GetUserGamesAsync(string userId);
    Task AddBookToNexusAsync(string userId, BookDto book);
    Task AddMovieToNexusAsync(string userId, MovieDto movie);
    Task AddGameToNexusAsync(string userId, GameDto game);
    Task RemoveBookFromNexusAsync(string userId, string bookId);
    Task RemoveMovieFromNexusAsync(string userId, string movieId);
    Task RemoveGameFromNexusAsync(string userId, string gameId);
}

public class NexusCollectionService : INexusCollectionService
{
    private readonly INexusCollectionRepository _repository;

    public NexusCollectionService(INexusCollectionRepository repository)
    {
        _repository = repository;
    }

    // Unified method to get all Nexus items (books, movies, games)
    public async Task<List<NexusItemDto>> GetAllNexusItemsAsync(string userId)
    {
        var books = await _repository.GetBooksAsync(userId);
        var movies = await _repository.GetMoviesAsync(userId);
        var games = await _repository.GetGamesAsync(userId);

        var nexusItems = new List<NexusItemDto>();

        // Map books to NexusItemDto
        nexusItems.AddRange(books.Select(book => new NexusItemDto
        {
            Id = book.Id,
            Title = book.Title,
            Thumbnail = book.Thumbnail,
            Rating = book.Rating,
            Type = "Book",
            Authors = string.Join(", ", book.Authors), // Joining authors into a string
            PublishedDate = book.PublishedDate,
            Genres = string.Join(", ", book.Genres), // Joining genres into a string
            Description = book.Description
        }));

        // Map movies to NexusItemDto
        nexusItems.AddRange(movies.Select(movie => new NexusItemDto
        {
            Id = movie.Id,
            Title = movie.Title,
            Thumbnail = movie.PosterPath,
            Rating = movie.Rating,
            Type = "Movie",
            Authors = movie.Directors, // Assuming Directors is a string
            PublishedDate = movie.ReleaseDate,
            Genres = movie.Genres, // Assuming Genres is a string
            Description = movie.Overview // Using Overview for description
        }));

        // Map games to NexusItemDto
        nexusItems.AddRange(games.Select(game => new NexusItemDto
        {
            Id = game.Id,
            Title = game.Name,
            Thumbnail = game.BackgroundImage,
            Rating = game.Rating,
            Type = "Game",
            Authors = "N/A",
            PublishedDate = game.Released,
            Genres = game.Genres,
            Description = game.Description,
            Developer = game.Developer, // Add Developer field
            Publisher = game.Publisher  // Add Publisher field
        }));


        return nexusItems;
    }

    public async Task<List<BookDto>> GetUserBooksAsync(string userId)
    {
        return await _repository.GetBooksAsync(userId);
    }

    public async Task<List<MovieDto>> GetUserMoviesAsync(string userId)
    {
        return await _repository.GetMoviesAsync(userId);
    }

    public async Task<List<GameDto>> GetUserGamesAsync(string userId)
    {
        return await _repository.GetGamesAsync(userId);
    }

    public async Task AddBookToNexusAsync(string userId, BookDto book)
    {
        await _repository.AddBookAsync(userId, book);
    }

    public async Task AddMovieToNexusAsync(string userId, MovieDto movie)
    {
        await _repository.AddMovieAsync(userId, movie);
    }

    public async Task AddGameToNexusAsync(string userId, GameDto game)
    {
        await _repository.AddGameAsync(userId, game);
    }

    public async Task RemoveBookFromNexusAsync(string userId, string bookId)
    {
        await _repository.RemoveBookAsync(userId, bookId);
    }

    public async Task RemoveMovieFromNexusAsync(string userId, string movieId)
    {
        await _repository.RemoveMovieAsync(userId, movieId);
    }

    public async Task RemoveGameFromNexusAsync(string userId, string gameId)
    {
        await _repository.RemoveGameAsync(userId, gameId);
    }

}
