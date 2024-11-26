using DifColl.Server.Data;
using DifColl.Server.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using DifColl.Server.DTOs;
using Microsoft.AspNetCore.Authentication.MicrosoftAccount;
using Microsoft.AspNetCore.Authentication.Twitter;

namespace DifCol.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : Controller
    {

        private readonly IWebHostEnvironment _environment; // Add this field to store environment information
        private readonly ApplicationDbContext _context;

        // Inject IWebHostEnvironment in the constructor
        public AccountController(IWebHostEnvironment environment, ApplicationDbContext context)
        {
            _environment = environment;
            _context = context;
        }


        [HttpGet("login")]
        public IActionResult Login([FromQuery] string provider)
        {
            // Determine the authentication scheme based on the provider parameter
            string authenticationScheme = provider switch
            {
                "google" => GoogleDefaults.AuthenticationScheme,
                "microsoft" => MicrosoftAccountDefaults.AuthenticationScheme,
                "twitter" => TwitterDefaults.AuthenticationScheme,
                _ => throw new ArgumentException("Unsupported provider") // Handle unsupported providers
            };

            return Challenge(new AuthenticationProperties
            {
                RedirectUri = "/"
            }, authenticationScheme);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return Ok();
        }

        [HttpGet("userinfo")]
        public async Task<IActionResult> GetUserInfo()
        {
            if (User.Identity.IsAuthenticated)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var userProfile = await _context.UserProfiles.FindAsync(userId);

                string pictureUrl = User.FindFirst(c =>
                    c.Type == "urn:google:picture" ||
                    c.Type == "urn:microsoftaccount:picture" ||
                    c.Type == "urn:twitter:profile_image_url")?.Value;

                if (userProfile == null)
                {
                    var name = User.Identity.Name;
                    var email = User.FindFirst(c => c.Type == ClaimTypes.Email)?.Value;

                    return Ok(new
                    {
                        Id = userId,
                        Name = name,
                        Email = email,
                        PictureUrl = pictureUrl
                    });
                }
                else
                {
                    return Ok(new
                    {
                        Id = userId,
                        Name = userProfile.Name,
                        Email = User.FindFirst(c => c.Type == ClaimTypes.Email)?.Value,
                        PictureUrl = userProfile.PictureUrl ?? pictureUrl, // Use stored or newly fetched picture
                        Bio = userProfile.Bio,
                        Pronouns = userProfile.Pronouns,
                        Location = userProfile.Location,
                        Interests = userProfile.Interests,
                        SocialMediaLinks = userProfile.SocialMediaLinks,
                        DateOfBirth = userProfile.DateOfBirth,
                        ContactInformation = userProfile.ContactInformation
                    });
                }
            }

            return Unauthorized();
        }


        [HttpPost("update-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateUserProfile([FromBody] UpdateUserProfileDto model) // Change FromForm to FromBody
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userProfile = await _context.UserProfiles.FindAsync(userId);

            if (string.IsNullOrEmpty(model.PictureUrl))
            {
                return BadRequest("The Picture URL is required.");
            }

            if (userProfile == null)
            {
                // Create new user profile if not present
                userProfile = new UserProfile
                {
                    UserId = userId,
                    Name = model.Nickname,
                    PictureUrl = model.PictureUrl,
                    Bio = model.Bio,
                    Pronouns = model.Pronouns,
                    Location = model.Location,
                    Interests = model.Interests,
                    SocialMediaLinks = model.SocialMediaLinks,
                    DateOfBirth = model.DateOfBirth,
                    ContactInformation = model.ContactInformation
                };
                _context.UserProfiles.Add(userProfile);
            }
            else
            {
                // Update existing user profile
                if (!string.IsNullOrEmpty(model.Nickname)) userProfile.Name = model.Nickname;
                if (!string.IsNullOrEmpty(model.PictureUrl)) userProfile.PictureUrl = model.PictureUrl;
                if (!string.IsNullOrEmpty(model.Bio)) userProfile.Bio = model.Bio;
                if (!string.IsNullOrEmpty(model.Pronouns)) userProfile.Pronouns = model.Pronouns;
                if (!string.IsNullOrEmpty(model.Location)) userProfile.Location = model.Location;
                if (!string.IsNullOrEmpty(model.Interests)) userProfile.Interests = model.Interests;
                if (!string.IsNullOrEmpty(model.SocialMediaLinks)) userProfile.SocialMediaLinks = model.SocialMediaLinks;
                if (model.DateOfBirth.HasValue) userProfile.DateOfBirth = model.DateOfBirth;
                if (!string.IsNullOrEmpty(model.ContactInformation)) userProfile.ContactInformation = model.ContactInformation;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Name = userProfile.Name, PictureUrl = userProfile.PictureUrl });
        }



        [HttpPost("add-friend/{friendId}")]
        [Authorize]
        public async Task<IActionResult> AddFriend(string friendId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == friendId)
            {
                return BadRequest("You cannot add yourself as a friend.");
            }

            var existingFriendship = await _context.Friendships
                .FirstOrDefaultAsync(f => (f.UserId == userId && f.FriendId == friendId) ||
                                           (f.UserId == friendId && f.FriendId == userId));

            if (existingFriendship != null)
            {
                return BadRequest("Friendship already exists.");
            }

            var friendship = new Friendship
            {
                UserId = userId,
                FriendId = friendId
            };

            _context.Friendships.Add(friendship);
            await _context.SaveChangesAsync();

            return Ok("Friend added successfully.");
        }

        [HttpDelete("remove-friend/{friendId}")]
        [Authorize]
        public async Task<IActionResult> RemoveFriend(string friendId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var friendship = await _context.Friendships
                .FirstOrDefaultAsync(f => (f.UserId == userId && f.FriendId == friendId) ||
                                           (f.UserId == friendId && f.FriendId == userId));

            if (friendship == null)
            {
                return NotFound("Friendship not found.");
            }

            _context.Friendships.Remove(friendship);
            await _context.SaveChangesAsync();

            return Ok("Friend removed successfully.");
        }

        [HttpGet("friends")]
        [Authorize]
        public async Task<IActionResult> GetFriends()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var friends = await _context.Friendships
                .Where(f => f.UserId == userId || f.FriendId == userId)
                .Select(f => f.UserId == userId ? f.FriendId : f.UserId)
                .ToListAsync();

            var friendProfiles = await _context.UserProfiles
                .Where(u => friends.Contains(u.UserId))
                .ToListAsync();

            return Ok(friendProfiles);
        }


    }
}
