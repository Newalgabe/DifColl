using DifColl.Server.Controllers;
using DifColl.Server.Data;
using DifColl.Server.Models;
using DifColl.Server.Repositories; // Make sure to include the namespace for your repositories
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

// Register HttpClient for API controllers
builder.Services.AddHttpClient<MovieController>();

// Logging setup
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// Add Swagger generation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add DbContext with connection string
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add CORS policy to allow frontend communication (React frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy.WithOrigins("https://localhost:5173") // Adjust port if necessary
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials() // Required for cookies and authentication
                        .SetIsOriginAllowed((host) => true)); // Allow localhost origins for dev purposes
});

// Enable Google Authentication
// Enable Google, Microsoft, and Twitter Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    googleOptions.CallbackPath = "/signin-google";
    googleOptions.ClaimActions.MapJsonKey("urn:google:picture", "picture", "url"); // Map profile picture
    googleOptions.SaveTokens = true;
})
.AddMicrosoftAccount(microsoftOptions =>
{
    microsoftOptions.ClientId = builder.Configuration["Authentication:Microsoft:ClientId"];
    microsoftOptions.ClientSecret = builder.Configuration["Authentication:Microsoft:ClientSecret"];
    microsoftOptions.CallbackPath = "/signin-microsoft";
    microsoftOptions.SaveTokens = true;
    microsoftOptions.ClaimActions.MapJsonKey("urn:microsoftaccount:picture", "picture", "url"); // Map Microsoft profile picture
})
.AddTwitter(twitterOptions =>
{
    twitterOptions.ConsumerKey = builder.Configuration["Authentication:Twitter:ConsumerKey"];
    twitterOptions.ConsumerSecret = builder.Configuration["Authentication:Twitter:ConsumerSecret"];
    twitterOptions.CallbackPath = "/signin-twitter";
    twitterOptions.SaveTokens = true;
    twitterOptions.ClaimActions.MapJsonKey("urn:twitter:profile_image_url", "profile_image_url", "url"); // Map Twitter profile picture
});

// Enable authorization
builder.Services.AddAuthorization();

// Register your NexusCollectionRepository
builder.Services.AddScoped<INexusCollectionRepository, NexusCollectionRepository>();

// Register your NexusCollectionService
builder.Services.AddScoped<INexusCollectionService, NexusCollectionService>();

var app = builder.Build();

// Enable Swagger UI only in development mode
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "DifColl API V1");
        c.RoutePrefix = "swagger"; // Swagger UI available at /swagger
    });
}

// Enable CORS policy for cross-origin requests from frontend
app.UseCors("AllowFrontend");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// Handle preflight requests explicitly if necessary
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        return;
    }
    await next.Invoke();
});

// Use authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Map API controllers and fallback to the main index.html for SPA
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
