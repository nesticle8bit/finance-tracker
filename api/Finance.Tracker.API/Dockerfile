# See https://aka.ms/customizecontainer to learn how to customize your debug container and how Visual Studio uses this Dockerfile to build your images for faster debugging.

# This stage is used when running from VS in fast mode (Default for Debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Finance.Tracker.API/Finance.Tracker.API.csproj", "Finance.Tracker.API/"]
COPY ["Finance.Tracker.Contracts/Finance.Tracker.Contracts.csproj", "Finance.Tracker.Contracts/"]
COPY ["Finance.Tracker.Entities/Finance.Tracker.Entities.csproj", "Finance.Tracker.Entities/"]
COPY ["Finance.Tracker.Shared/Finance.Tracker.Shared.csproj", "Finance.Tracker.Shared/"]
COPY ["Finance.Tracker.Presentation/Finance.Tracker.Presentation.csproj", "Finance.Tracker.Presentation/"]
COPY ["Finance.Tracker.Service.Contracts/Finance.Tracker.Service.Contracts.csproj", "Finance.Tracker.Service.Contracts/"]
COPY ["Finance.Tracker.Repository/Finance.Tracker.Repository.csproj", "Finance.Tracker.Repository/"]
COPY ["Finance.Tracker.Service/Finance.Tracker.Service.csproj", "Finance.Tracker.Service/"]
RUN dotnet restore "./Finance.Tracker.API/Finance.Tracker.API.csproj"
COPY . .
WORKDIR "/src/Finance.Tracker.API"
RUN dotnet build "./Finance.Tracker.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to be copied to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Finance.Tracker.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (Default when not using the Debug configuration)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Finance.Tracker.API.dll"]