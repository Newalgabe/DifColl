// DTOs/GameDto.cs
namespace DifColl.Server.DTOs
{
    public class GameDto
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Released { get; set; }
        public string BackgroundImage { get; set; }
        public string Description { get; set; }
        public string Genres { get; set; }
        public float Rating { get; set; }
        public string Developer { get; set; } // New field for Developer
        public string Publisher { get; set; } // New field for Publisher
    }
}
