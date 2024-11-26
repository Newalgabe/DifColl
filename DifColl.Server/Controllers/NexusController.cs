using DifColl.Server.DTOs;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class NexusController : ControllerBase
{
    private readonly INexusCollectionService _nexusService;

    public NexusController(INexusCollectionService nexusService)
    {
        _nexusService = nexusService;
    }

    // Unified Nexus collection endpoint (with userId as query parameter)
    [HttpGet("collections")]
    public async Task<IActionResult> GetNexusCollections([FromQuery] string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID is required.");
        }

        var collections = await _nexusService.GetAllNexusItemsAsync(userId);
        return Ok(collections);
    }

    // Get only books for a specific user
    [HttpGet("books/{userId}")]
    public async Task<IActionResult> GetUserBooks(string userId)
    {
        var books = await _nexusService.GetUserBooksAsync(userId);
        return Ok(books);
    }

    // Get only movies for a specific user
    [HttpGet("movies/{userId}")]
    public async Task<IActionResult> GetUserMovies(string userId)
    {
        var movies = await _nexusService.GetUserMoviesAsync(userId);
        return Ok(movies);
    }

    // Get only games for a specific user
    [HttpGet("games/{userId}")]
    public async Task<IActionResult> GetUserGames(string userId)
    {
        var games = await _nexusService.GetUserGamesAsync(userId);
        return Ok(games);
    }

    // Add a book to the user's nexus collection
    [HttpPost("add/book/{userId}")]
    public async Task<IActionResult> AddBookToNexus(string userId, [FromBody] BookDto book)
    {
        await _nexusService.AddBookToNexusAsync(userId, book);
        return Ok();
    }

    // Add a movie to the user's nexus collection
    [HttpPost("add/movie/{userId}")]
    public async Task<IActionResult> AddMovieToNexus(string userId, [FromBody] MovieDto movie)
    {
        await _nexusService.AddMovieToNexusAsync(userId, movie);
        return Ok();
    }

    // Add a game to the user's nexus collection
    [HttpPost("add/game/{userId}")]
    public async Task<IActionResult> AddGameToNexus(string userId, [FromBody] GameDto game)
    {
        await _nexusService.AddGameToNexusAsync(userId, game);
        return Ok();
    }

    [HttpDelete("remove/book/{userId}/{bookId}")]
    public async Task<IActionResult> RemoveBookFromNexus(string userId, string bookId)
    {
        await _nexusService.RemoveBookFromNexusAsync(userId, bookId);
        return Ok();
    }

    // Remove a movie from the user's nexus collection
    [HttpDelete("remove/movie/{userId}/{movieId}")]
    public async Task<IActionResult> RemoveMovieFromNexus(string userId, string movieId)
    {
        await _nexusService.RemoveMovieFromNexusAsync(userId, movieId);
        return Ok();
    }

    // Remove a game from the user's nexus collection
    [HttpDelete("remove/game/{userId}/{gameId}")]
    public async Task<IActionResult> RemoveGameFromNexus(string userId, string gameId)
    {
        await _nexusService.RemoveGameFromNexusAsync(userId, gameId);
        return Ok();
    }
}