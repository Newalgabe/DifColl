using System.ComponentModel.DataAnnotations;

namespace DifColl.Server.Models
{
    public class UserProfile
    {
        [Key]
        public string UserId { get; set; } 

        [Required]
        public string Name { get; set; }
        public string PictureUrl { get; set; }
        public string Bio { get; set; }
        public string Pronouns { get; set; }
        public string Location { get; set; }
        public string Interests { get; set; }
        public string SocialMediaLinks { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string ContactInformation { get; set; }
    }

}