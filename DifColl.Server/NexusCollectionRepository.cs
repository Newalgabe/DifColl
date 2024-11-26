using DifColl.Server.Data;
using DifColl.Server.DTOs;
using DifColl.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace DifColl.Server.Repositories
{
    public interface INexusCollectionRepository
    {
        Task<List<BookDto>> GetBooksAsync(string userId);
        Task<List<MovieDto>> GetMoviesAsync(string userId);
        Task<List<GameDto>> GetGamesAsync(string userId);
        Task AddBookAsync(string userId, BookDto book);
        Task AddMovieAsync(string userId, MovieDto movie);
        Task AddGameAsync(string userId, GameDto game);
        Task RemoveBookAsync(string userId, string bookId);
        Task RemoveMovieAsync(string userId, string movieId);
        Task RemoveGameAsync(string userId, string gameId);
    }

    public class NexusCollectionRepository : INexusCollectionRepository
    {
        private readonly ApplicationDbContext _context;

        public NexusCollectionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Retrieve all books for a specific user
        public async Task<List<BookDto>> GetBooksAsync(string userId)
        {
            return await _context.Books
                .Where(b => b.UserId == userId)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Authors = b.Authors,
                    Thumbnail = b.Thumbnail,
                    PublishedDate = b.PublishedDate,
                    Description = b.Description,
                    Genres = b.Genres,
                    Rating = b.Rating
                })
                .ToListAsync();
        }

        // Retrieve all movies for a specific user
        public async Task<List<MovieDto>> GetMoviesAsync(string userId)
        {
            return await _context.Movies
                .Where(m => m.UserId == userId)
                .Select(m => new MovieDto
                {
                    Id = m.Id,
                    Title = m.Title,
                    Directors = m.Directors,
                    Genres = m.Genres,
                    ReleaseDate = m.ReleaseDate,
                    PosterPath = m.PosterPath,
                    Overview = m.Overview,
                    Rating = m.Rating
                })
                .ToListAsync();
        }


        // Retrieve all games for a specific user
        public async Task<List<GameDto>> GetGamesAsync(string userId)
        {
            return await _context.Games
                .Where(g => g.UserId == userId)
                .Select(g => new GameDto
                {
                    Id = g.Id,
                    Name = g.Name,
                    Released = g.Released,
                    BackgroundImage = g.BackgroundImage,
                    Description = g.Description,
                    Genres = g.Genres,
                    Rating = (float)g.Rating,
                    Developer = g.Developer, // Add Developer field
                    Publisher = g.Publisher  // Add Publisher field
                })
                .ToListAsync();
        }


        // Add a book to the user's collection
        public async Task AddBookAsync(string userId, BookDto book)
        {
            // Check if the book already exists in the user's collection
            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == book.Id && b.UserId == userId);

            if (existingBook != null)
            {
                throw new InvalidOperationException("This book is already in your collection.");
            }

            var newBook = new Book
            {
                Id = book.Id,
                Title = book.Title,
                Authors = book.Authors,
                Thumbnail = book.Thumbnail,
                PublishedDate = book.PublishedDate,
                Description = book.Description,
                Genres = book.Genres,
                Rating = book.Rating,
                UserId = userId // Associate the book with the user
            };

            _context.Books.Add(newBook);
            await _context.SaveChangesAsync();
        }

        public async Task AddMovieAsync(string userId, MovieDto movie)
        {
            // Check if the movie already exists in the user's collection
            var existingMovie = await _context.Movies
                .FirstOrDefaultAsync(m => m.Id == movie.Id && m.UserId == userId);

            if (existingMovie != null)
            {
                throw new InvalidOperationException("This movie is already in your collection.");
            }

            var newMovie = new Movie
            {
                Id = movie.Id,
                Title = movie.Title,
                Directors = movie.Directors,
                Genres = movie.Genres,
                ReleaseDate = movie.ReleaseDate,
                PosterPath = movie.PosterPath,
                Overview = movie.Overview,
                Rating = movie.Rating,
                UserId = userId // Associate the movie with the user
            };

            _context.Movies.Add(newMovie);
            await _context.SaveChangesAsync();
        }

        public async Task AddGameAsync(string userId, GameDto game)
        {
            // Check if the game already exists in the user's collection
            var existingGame = await _context.Games
                .FirstOrDefaultAsync(g => g.Id == game.Id && g.UserId == userId);

            if (existingGame != null)
            {
                throw new InvalidOperationException("This game is already in your collection.");
            }

            var newGame = new Game
            {
                Id = game.Id,
                Name = game.Name,
                Released = game.Released,
                BackgroundImage = game.BackgroundImage,
                Description = game.Description,
                Genres = game.Genres,
                Rating = game.Rating,
                UserId = userId,
                Developer = game.Developer,
                Publisher = game.Publisher
            };

            _context.Games.Add(newGame);
            await _context.SaveChangesAsync();
        }


        // Remove a book from the user's collection
        public async Task RemoveBookAsync(string userId, string bookId)
        {
            var book = await _context.Books.FirstOrDefaultAsync(b => b.UserId == userId && b.Id == bookId);
            if (book != null)
            {
                _context.Books.Remove(book);
                await _context.SaveChangesAsync();
            }
        }

        // Remove a movie from the user's collection
        public async Task RemoveMovieAsync(string userId, string movieId)
        {
            var movie = await _context.Movies.FirstOrDefaultAsync(m => m.UserId == userId && m.Id == movieId);
            if (movie != null)
            {
                _context.Movies.Remove(movie);
                await _context.SaveChangesAsync();
            }
        }

        // Remove a game from the user's collection
        public async Task RemoveGameAsync(string userId, string gameId)
        {
            var game = await _context.Games.FirstOrDefaultAsync(g => g.UserId == userId && g.Id == gameId);
            if (game != null)
            {
                _context.Games.Remove(game);
                await _context.SaveChangesAsync();
            }
        }
    }
}
