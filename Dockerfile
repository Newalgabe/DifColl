FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# Copy all project files
COPY . .

# Build frontend
WORKDIR /app/difcoll.client
RUN npm install && npm run build

# Copy frontend dist into backend wwwroot
RUN mkdir -p /app/DifColl.Server/wwwroot && cp -r dist/* /app/DifColl.Server/wwwroot/

# Publish backend (wwwroot is already populated, no SPA project ref conflict)
WORKDIR /app/DifColl.Server
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "DifColl.Server.dll"]
