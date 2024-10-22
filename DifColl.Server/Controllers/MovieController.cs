// Controllers/MovieController.cs
using DifColl.Server.Data;
using DifColl.Server.DTOs;
using DifColl.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Newtonsoft.Json;

namespace DifColl.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MovieController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _tmdbApiKey;
        private readonly ApplicationDbContext _context;

        // Static dictionary to cache genre name to genre ID mapping
        private static Dictionary<string, int> _genreMapping = null;
        private static readonly object _genreLock = new object();

        public MovieController(HttpClient httpClient, IConfiguration configuration, ApplicationDbContext context)
        {
            _httpClient = httpClient;
            _tmdbApiKey = configuration["TMDb:ApiKey"];
            _context = context;
        }

        // Method to initialize and fetch genre mapping
        private async Task InitializeGenreMappingAsync()
        {
            if (_genreMapping == null)
            {
                lock (_genreLock)
                {
                    if (_genreMapping != null)
                        return;

                    // Initialize to prevent multiple fetches
                    _genreMapping = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                }

                var genreUrl = $"https://api.themoviedb.org/3/genre/movie/list?api_key={_tmdbApiKey}&language=en-US";
                var genreResponse = await _httpClient.GetAsync(genreUrl);

                if (genreResponse.IsSuccessStatusCode)
                {
                    var genreJson = await genreResponse.Content.ReadAsStringAsync();
                    var genreData = JObject.Parse(genreJson);

                    foreach (var genre in genreData["genres"])
                    {
                        var name = genre["name"]?.ToString();
                        var id = genre["id"]?.ToObject<int>() ?? 0;

                        if (!string.IsNullOrEmpty(name) && id != 0)
                        {
                            _genreMapping[name] = id;
                        }
                    }
                }
                else
                {
                    // If unable to fetch genres, leave the mapping empty
                    _genreMapping = new Dictionary<string, int>();
                }
            }
        }

        /// <summary>
        /// Searches for movies based on query, page, sort order, and genre.
        /// </summary>
        /// <param name="query">Search query string.</param>
        /// <param name="page">Page number for pagination.</param>
        /// <param name="sortOrder">Sort order: "relevance" or "newest".</param>
        /// <param name="genre">Genre name (optional).</param>
        /// <returns>List of movies with pagination details.</returns>
        [HttpGet("search/{query}")]
        public async Task<IActionResult> SearchMovies(string query, int page = 1, string sortOrder = "relevance", string genre = "")
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query cannot be empty." });

            try
            {
                // Initialize genre mapping if needed
                await InitializeGenreMappingAsync();

                List<MovieDto> movieDtos = new List<MovieDto>();

                // If sortOrder is "relevance" and no genre is specified, use /search/movie
                if (string.Equals(sortOrder, "relevance", StringComparison.OrdinalIgnoreCase) && string.IsNullOrWhiteSpace(genre))
                {
                    // Use /search/movie
                    string tmdbUrl = $"https://api.themoviedb.org/3/search/movie?query={Uri.EscapeDataString(query)}&api_key={_tmdbApiKey}&page={page}";

                    var response = await _httpClient.GetAsync(tmdbUrl);

                    if (!response.IsSuccessStatusCode)
                        return BadRequest(new { message = "Failed to fetch data from TMDb." });

                    var jsonResponse = await response.Content.ReadAsStringAsync();
                    var data = JObject.Parse(jsonResponse);

                    foreach (var item in data["results"])
                    {
                        var dto = new MovieDto
                        {
                            Id = item["id"]?.ToString(),
                            Title = item["title"]?.ToString(),
                            ReleaseDate = item["release_date"]?.ToString(),
                            PosterPath = string.IsNullOrEmpty(item["poster_path"]?.ToString())
                                ? "https://via.placeholder.com/500x750?text=No+Image+Available"
                                : $"https://image.tmdb.org/t/p/w500{item["poster_path"]}",
                            Overview = item["overview"]?.ToString(),
                            Rating = item["vote_average"]?.ToObject<float>() ?? 0 // New
                        };

                        dto = await FetchMovieDetails(dto);
                        movieDtos.Add(dto);
                    }

                    // Extract pagination details
                    return Ok(new
                    {
                        movies = movieDtos,
                        currentPage = data["page"]?.Value<int>() ?? 1,
                        totalPages = data["total_pages"]?.Value<int>() ?? 1,
                        totalResults = data["total_results"]?.Value<int>() ?? 0
                    });
                }
                else
                {
                    // Use /search/movie with additional filters (genre and sortOrder)
                    string searchUrl = $"https://api.themoviedb.org/3/search/movie?query={Uri.EscapeDataString(query)}&api_key={_tmdbApiKey}&page={page}";

                    var searchResponse = await _httpClient.GetAsync(searchUrl);

                    if (!searchResponse.IsSuccessStatusCode)
                        return BadRequest(new { message = "Failed to fetch data from TMDb." });

                    var searchJson = await searchResponse.Content.ReadAsStringAsync();
                    var searchData = JObject.Parse(searchJson);

                    foreach (var item in searchData["results"])
                    {
                        var dto = new MovieDto
                        {
                            Id = item["id"]?.ToString(),
                            Title = item["title"]?.ToString(),
                            ReleaseDate = item["release_date"]?.ToString(),
                            PosterPath = string.IsNullOrEmpty(item["poster_path"]?.ToString())
                                ? "https://via.placeholder.com/500x750?text=No+Image+Available"
                                : $"https://image.tmdb.org/t/p/w500{item["poster_path"]}",
                            Overview = item["overview"]?.ToString()
                        };

                        // Fetch details to get genres and directors
                        dto = await FetchMovieDetails(dto);

                        // If genre filter is applied, check if the movie has the specified genre
                        if (!string.IsNullOrWhiteSpace(genre))
                        {
                            if (!dto.Genres.Split(", ").Any(g => string.Equals(g, genre, StringComparison.OrdinalIgnoreCase)))
                            {
                                continue; // Skip movies that don't match the genre
                            }
                        }

                        movieDtos.Add(dto);
                    }

                    // Apply sorting if necessary (if sortOrder is not 'relevance', as /search/movie sorts by relevance by default)
                    if (!string.Equals(sortOrder, "relevance", StringComparison.OrdinalIgnoreCase))
                    {
                        if (string.Equals(sortOrder, "newest", StringComparison.OrdinalIgnoreCase))
                        {
                            movieDtos = movieDtos.OrderByDescending(m => DateTime.TryParse(m.ReleaseDate, out var rd) ? rd : DateTime.MinValue).ToList();
                        }
                        // Add other sort options if needed
                    }

                    // Extract pagination details
                    return Ok(new
                    {
                        movies = movieDtos,
                        currentPage = searchData["page"]?.Value<int>() ?? 1,
                        totalPages = searchData["total_pages"]?.Value<int>() ?? 1,
                        totalResults = searchData["total_results"]?.Value<int>() ?? 0
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }

        /// <summary>
        /// Maps the sortOrder parameter to TMDb's sort_by parameter.
        /// </summary>
        /// <param name="sortOrder">Sort order: "relevance" or "newest".</param>
        /// <returns>Corresponding TMDb sort_by value.</returns>
        private string GetSortBy(string sortOrder)
        {
            // Map sortOrder to TMDb sort_by parameter
            // 'relevance' -> 'popularity.desc'
            // 'newest' -> 'release_date.desc'

            switch (sortOrder.ToLower())
            {
                case "newest":
                    return "release_date.desc";
                case "relevance":
                default:
                    return "popularity.desc";
            }
        }

        /// <summary>
        /// Fetches detailed information about a movie, including genres and directors.
        /// </summary>
        /// <param name="dto">Movie DTO.</param>
        /// <returns>Updated Movie DTO with genres and directors.</returns>
        private async Task<MovieDto> FetchMovieDetails(MovieDto dto)
        {
            var detailsUrl = $"https://api.themoviedb.org/3/movie/{dto.Id}?api_key={_tmdbApiKey}&append_to_response=credits";
            var detailsResponse = await _httpClient.GetAsync(detailsUrl);

            if (detailsResponse.IsSuccessStatusCode)
            {
                var detailsJson = await detailsResponse.Content.ReadAsStringAsync();
                var detailsData = JObject.Parse(detailsJson);

                dto.Genres = string.Join(", ", detailsData["genres"].Select(g => g["name"]?.ToString()));
                dto.Directors = string.Join(", ", detailsData["credits"]["crew"]
                    .Where(c => c["job"]?.ToString() == "Director")
                    .Select(c => c["name"]?.ToString()));
            }
            else
            {
                dto.Genres = "N/A";
                dto.Directors = "N/A";
            }

            return dto;
        }

        /// <summary>
        /// Adds a movie to the user's collection.
        /// </summary>
        /// <param name="movieDto">Movie DTO.</param>
        /// <returns>Result message.</returns>
        [HttpPost("add/movie/{userId}")]
        public async Task<IActionResult> AddMovieToCollection(string userId, [FromBody] MovieDto movieDto)
        {
            if (movieDto == null || string.IsNullOrEmpty(userId))
                return BadRequest(); // No message, just a bad request status

            // Check if the movie already exists in the user's collection
            var existingMovie = await _context.Movies
                .FirstOrDefaultAsync(m => m.Id == movieDto.Id && m.UserId == userId);

            if (existingMovie != null)
                return BadRequest(); // No message, just a bad request status

            // Map DTO to entity
            var movie = new Movie
            {
                Id = movieDto.Id,
                Title = movieDto.Title,
                Directors = movieDto.Directors,
                Genres = movieDto.Genres,
                ReleaseDate = movieDto.ReleaseDate,
                PosterPath = movieDto.PosterPath,
                Overview = movieDto.Overview,
                Rating = movieDto.Rating,
                UserId = userId
            };

            // Add movie to the context
            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            // Simply return Ok with no message
            return Ok();
        }


        // Optional: Implement endpoints to retrieve, update, or delete movies from the collection
    }
}
