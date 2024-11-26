// Models/Friendship.cs
using System.ComponentModel.DataAnnotations;

namespace DifColl.Server.Models
{
    public class Friendship
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } // The user who sent the friend request

        [Required]
        public string FriendId { get; set; } // The user who received and accepted the friend request

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
