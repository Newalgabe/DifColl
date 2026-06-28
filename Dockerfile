FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy everything
COPY . .

# Build frontend
WORKDIR /app/difcoll.client
RUN npm install && npm run build

# Copy frontend to backend wwwroot
RUN mkdir -p /app/DifColl.Server/wwwroot && cp -r dist/* /app/DifColl.Server/wwwroot/

# Publish backend
WORKDIR /app/DifColl.Server
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DifColl.Server.dll"]
