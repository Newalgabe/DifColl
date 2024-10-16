// DTOs/RemoveRequestDto.cs
namespace DifColl.Server.DTOs
{
    public class RemoveRequestDto
    {
        public string Id { get; set; }
        public string Type { get; set; } // "Book", "Movie", "Game"
    }
}
