using Microsoft.AspNetCore.Http;

namespace DifColl.Server.DTOs // Adjust the namespace as per your project structure
{
    public class UpdateUserProfileDto
    {
        public string Nickname { get; set; }
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
