// Controllers/GameController.cs
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
using Microsoft.Extensions.Logging;

namespace DifColl.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _rawgApiKey;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<GameController> _logger;

        // Static dictionary to cache genre name to genre ID mapping
        private static Dictionary<string, int> _genreMapping = null;
        private static readonly object _genreLock = new object();

        public GameController(IConfiguration configuration, ApplicationDbContext context, ILogger<GameController> logger)
        {
            _httpClient = new HttpClient();
            _rawgApiKey = configuration["RAWG:ApiKey"];
            _context = context;
            _logger = logger;
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

                var genreUrl = $"https://api.rawg.io/api/genres?key={_rawgApiKey}";
                _logger.LogInformation($"Fetching genres from RAWG API: {genreUrl}");
                var genreResponse = await _httpClient.GetAsync(genreUrl);

                if (genreResponse.IsSuccessStatusCode)
                {
                    var genreJson = await genreResponse.Content.ReadAsStringAsync();
                    var genreData = JObject.Parse(genreJson);

                    foreach (var genre in genreData["results"])
                    {
                        var name = genre["name"]?.ToString();
                        var id = genre["id"]?.ToObject<int>() ?? 0;

                        if (!string.IsNullOrEmpty(name) && id != 0)
                        {
                            _genreMapping[name] = id;
                        }
                    }

                    _logger.LogInformation($"Fetched {_genreMapping.Count} genres.");
                }
                else
                {
                    // If unable to fetch genres, leave the mapping empty
                    _genreMapping = new Dictionary<string, int>();
                    _logger.LogWarning("Failed to fetch genres from RAWG API.");
                }
            }
        }

        /// <summary>
        /// Searches for games based on query, page, sort order, and genre.
        /// </summary>
        /// <param name="query">Search query string.</param>
        /// <param name="page">Page number for pagination.</param>
        /// <param name="sortOrder">Sort order: "relevance" or "newest".</param>
        /// <param name="genre">Genre name (optional).</param>
        /// <returns>List of games with pagination details.</returns>
        [HttpGet("search/{query}")]
        public async Task<IActionResult> SearchGames(string query, int page = 1, string sortOrder = "relevance", string genre = "")
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest(new { message = "Query cannot be empty." });

            try
            {
                await InitializeGenreMappingAsync(); // Ensure genre mapping is ready
                List<GameDto> gameDtos = new List<GameDto>();

                // Determine the sorting parameter
                string sortParam = sortOrder.ToLower() switch
                {
                    "newest" => "-released",  // Fixed line
                    "name" => "name",
                    _ => "popularity" // RAWG uses 'popularity' for default sorting
                };

                // Construct the API URL
                string apiUrl = $"https://api.rawg.io/api/games?key={_rawgApiKey}&search={Uri.EscapeDataString(query)}&page={page}&page_size=20&ordering={sortParam}";

                if (!string.IsNullOrWhiteSpace(genre))
                {
                    if (_genreMapping.TryGetValue(genre, out int genreId))
                    {
                        apiUrl += $"&genres={genreId}";
                    }
                    else
                    {
                        _logger.LogWarning($"Genre '{genre}' not found in genre mapping.");
                        return BadRequest(new { message = $"Genre '{genre}' not found." });
                    }
                }

                _logger.LogInformation($"Fetching games from RAWG API: {apiUrl}");
                var response = await _httpClient.GetAsync(apiUrl);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"RAWG API responded with status code {response.StatusCode}.");
                    return BadRequest(new { message = "Failed to fetch data from RAWG." });
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                var data = JObject.Parse(jsonResponse);

                foreach (var item in data["results"])
                {
                    var dto = new GameDto
                    {
                        Id = item["id"]?.ToString(),
                        Name = item["name"]?.ToString(),
                        Released = item["released"]?.ToString(),
                        BackgroundImage = item["background_image"]?.ToString(),
                        Description = string.Empty,
                        Genres = string.Empty,
                        Rating = item["rating"]?.ToObject<double>() ?? 0.0
                    };

                    dto = await FetchGameDetails(dto);
                    gameDtos.Add(dto);
                }

                int totalResults = data["count"]?.ToObject<int>() ?? 0;
                int pageSize = 20;
                int totalPages = (int)Math.Ceiling(totalResults / (double)pageSize);

                _logger.LogInformation($"Fetched {gameDtos.Count} games. Page {page} of {totalPages}.");

                return Ok(new
                {
                    games = gameDtos,
                    currentPage = page,
                    totalPages = totalPages,
                    totalResults = totalResults,
                    sortOrder = sortOrder
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Internal server error: {ex.Message}");
                return StatusCode(500, new { message = $"Internal server error: {ex.Message}" });
            }
        }


        private async Task<GameDto> FetchGameDetails(GameDto dto)
        {
            var detailsUrl = $"https://api.rawg.io/api/games/{dto.Id}?key={_rawgApiKey}";
            _logger.LogInformation($"Fetching game details from RAWG API: {detailsUrl}");
            var detailsResponse = await _httpClient.GetAsync(detailsUrl);

            if (detailsResponse.IsSuccessStatusCode)
            {
                var detailsJson = await detailsResponse.Content.ReadAsStringAsync();
                var detailsData = JObject.Parse(detailsJson);

                // Extract description
                dto.Description = detailsData["description_raw"]?.ToString() ?? "No Description";

                // Extract genres
                var genres = new List<string>();
                foreach (var g in detailsData["genres"])
                {
                    genres.Add(g["name"]?.ToString());
                }
                dto.Genres = string.Join(", ", genres);
            }
            else
            {
                dto.Description = "N/A";
                dto.Genres = "N/A";
                _logger.LogWarning($"Failed to fetch details for game ID {dto.Id}.");
            }

            return dto;
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddGameToCollection([FromBody] GameDto gameDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (gameDto == null || string.IsNullOrEmpty(userId))
                return BadRequest(new { message = "Invalid data." });

            var existingGame = await _context.Games
                .FirstOrDefaultAsync(m => m.Id == gameDto.Id && m.UserId == userId);

            if (existingGame != null)
                return BadRequest(new { message = "Game already exists in your collection." });

            var game = new Game
            {
                Id = gameDto.Id,
                Name = gameDto.Name,
                Genres = gameDto.Genres,
                Released = gameDto.Released,
                BackgroundImage = gameDto.BackgroundImage,
                Description = gameDto.Description,
                Rating = gameDto.Rating,
                UserId = userId
            };

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Game '{game.Name}' added to user '{userId}' collection.");

            return Ok(new { message = "Game added to your collection." });
        }

        // Optional: Implement endpoints to retrieve, update, or delete games from the collection
    }
}
