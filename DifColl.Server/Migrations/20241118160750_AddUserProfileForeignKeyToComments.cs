using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DifColl.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProfileForeignKeyToComments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_UserProfiles_UserId",
                table: "Comments");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_UserProfiles_UserId",
                table: "Comments",
                column: "UserId",
                principalTable: "UserProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Comments_UserProfiles_UserId",
                table: "Comments");

            migrationBuilder.AddForeignKey(
                name: "FK_Comments_UserProfiles_UserId",
                table: "Comments",
                column: "UserId",
                principalTable: "UserProfiles",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
