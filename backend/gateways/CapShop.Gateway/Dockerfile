FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["backend/gateways/CapShop.Gateway/CapShop.Gateway.csproj", "backend/gateways/CapShop.Gateway/"]
RUN dotnet restore "backend/gateways/CapShop.Gateway/CapShop.Gateway.csproj"

COPY . .
WORKDIR "/src/backend/gateways/CapShop.Gateway"
RUN dotnet publish "CapShop.Gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CapShop.Gateway.dll"]