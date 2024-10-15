// Controllers/GameController.cs
using DifColl.Server.Data;
using DifColl.Server.DTOs;
using DifColl.Server.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;

namespace DifColl.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _rawgApiKey;
        private readonly ApplicationDbContext _context;

        public GameController(IConfiguration configuration, ApplicationDbContext context)
        {
            _httpClient = new HttpClient();
            _rawgApiKey = configuration["RAWG:ApiKey"];
            _context = context;
        }

        [HttpGet("search/{query}")]
        public async Task<IActionResult> SearchGames(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            var url = $"https://api.rawg.io/api/games?key={_rawgApiKey}&search={query}";

            var response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var data = JObject.Parse(jsonResponse);

                var gameDtos = new List<GameDto>();

                foreach (var item in data["results"])
                {
                    var dto = new GameDto
                    {
                        Id = item["id"]?.ToString(),
                        Name = item["name"]?.ToString(),
                        Released = item["released"]?.ToString(),
                        BackgroundImage = item["background_image"]?.ToString(),
                        Description = string.Empty, // Will be populated below
                        Genres = string.Empty // Will be populated below
                    };

                    // Fetch detailed game info to get description
                    var detailsUrl = $"https://api.rawg.io/api/games/{dto.Id}?key={_rawgApiKey}";
                    var detailsResponse = await _httpClient.GetAsync(detailsUrl);
                    if (detailsResponse.IsSuccessStatusCode)
                    {
                        var detailsJson = await detailsResponse.Content.ReadAsStringAsync();
                        var detailsData = JObject.Parse(detailsJson);

                        // Extract description
                        dto.Description = detailsData["description_raw"]?.ToString() ?? "No Description";

                        // Extract genres
                        var genres = new List<string>();
                        foreach (var genre in detailsData["genres"])
                        {
                            genres.Add(genre["name"]?.ToString());
                        }
                        dto.Genres = string.Join(", ", genres);
                    }

                    gameDtos.Add(dto);
                }

                return Ok(gameDtos);
            }

            return BadRequest("Failed to fetch data from RAWG.");
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddGameToCollection([FromBody] GameDto gameDto, [FromQuery] string userId)
        {
            if (gameDto == null || string.IsNullOrEmpty(userId))
                return BadRequest("Invalid data.");

            // Check if the game already exists in the user's collection
            var existingGame = await _context.Games.FindAsync(gameDto.Id);
            if (existingGame != null && existingGame.UserId == userId)
                return BadRequest("Game already exists in your collection.");

            var game = new Game
            {
                Id = gameDto.Id,
                Name = gameDto.Name,
                Genres = gameDto.Genres,
                Released = gameDto.Released,
                BackgroundImage = gameDto.BackgroundImage,
                Description = gameDto.Description,
                UserId = userId
            };

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            return Ok("Game added to your collection.");
        }

        // Optional: Implement endpoints to retrieve, update, or delete games from the collection
    }
}
