using DifColl.Server.Data;
using DifColl.Server.DTOs;
using DifColl.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace DifColl.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CollectionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CollectionController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("add-book")]
        public async Task<IActionResult> AddBook([FromBody] BookDto bookDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var existingBook = await _context.Books
                .FirstOrDefaultAsync(b => b.Id == bookDto.Id && b.UserId == userId);

            if (existingBook != null)
            {
                return BadRequest("Book is already in your collection.");
            }

            var book = new Book
            {
                Id = bookDto.Id,
                Title = bookDto.Title,
                Authors = string.Join(", ", bookDto.Authors ?? new string[0]),
                Thumbnail = bookDto.Thumbnail,
                UserId = userId
            };

            _context.Books.Add(book);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("books")]
        public async Task<IActionResult> GetBooks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var books = await _context.Books
                .Where(b => b.UserId == userId)
                .ToListAsync();

            return Ok(books);
        }
    }
}
