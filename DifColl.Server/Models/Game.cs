// Models/Game.cs
using System.ComponentModel.DataAnnotations;

namespace DifColl.Server.Models
{
    public class Game
    {
        [Key]
        public string Id { get; set; } // RAWG Game ID

        public string Name { get; set; }

        public string Genres { get; set; } // Comma-separated list

        public string Released { get; set; }

        public string BackgroundImage { get; set; }

        public string Description { get; set; }

        public string UserId { get; set; } // Assuming user authentication is implemented
    }
}
