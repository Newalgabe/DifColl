// Controllers/BookController.cs
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
    public class BookController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _googleBooksApiKey;
        private readonly ApplicationDbContext _context;

        public BookController(IConfiguration configuration, ApplicationDbContext context)
        {
            _httpClient = new HttpClient();
            _googleBooksApiKey = configuration["GoogleBooks:ApiKey"];
            _context = context;
        }

        [HttpGet("search/{query}")]
        public async Task<IActionResult> SearchBooks(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query cannot be empty.");

            var url = $"https://www.googleapis.com/books/v1/volumes?q={query}&key={_googleBooksApiKey}";

            var response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var data = JObject.Parse(jsonResponse);

                var bookDtos = new List<BookDto>();

                foreach (var item in data["items"])
                {
                    var dto = new BookDto
                    {
                        Id = item["id"]?.ToString(),
                        Title = item["volumeInfo"]["title"]?.ToString() ?? "No Title",
                        Authors = item["volumeInfo"]["authors"]?.ToObject<string[]>() != null
        ? string.Join(", ", item["volumeInfo"]["authors"].ToObject<string[]>())
        : "Unknown", // Join authors into a single string
                        Thumbnail = item["volumeInfo"]["imageLinks"]?["thumbnail"]?.ToString()
        ?? "https://via.placeholder.com/128x195?text=No+Image",
                        PublishedDate = item["volumeInfo"]["publishedDate"]?.ToString() ?? "Unknown", // New
                        Description = item["volumeInfo"]["description"]?.ToString() ?? "No Description", // New
                        Genres = item["volumeInfo"]["categories"]?.ToObject<string[]>() != null
        ? string.Join(", ", item["volumeInfo"]["categories"].ToObject<string[]>())
        : "Unknown", // Join genres into a single string
                        Rating = item["volumeInfo"]["averageRating"]?.ToObject<float>() ?? 0 // New
                    };


                    bookDtos.Add(dto);
                }

                return Ok(bookDtos);
            }

            return BadRequest("Failed to fetch data from Google Books.");
        }
    }
}
