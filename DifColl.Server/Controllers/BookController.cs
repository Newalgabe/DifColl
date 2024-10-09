using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace DifColl.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _googleBooksApiKey;

        public BookController(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _googleBooksApiKey = configuration["GoogleBooks:ApiKey"];
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchBooks(string query)
        {
            var url = $"https://www.googleapis.com/books/v1/volumes?q={query}&key={_googleBooksApiKey}";

            var response = await _httpClient.GetAsync(url);

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadAsStringAsync();
                var data = JObject.Parse(jsonResponse);
                return Ok(data);
            }

            return BadRequest("Failed to fetch data from Google Books.");
        }
    }
}
