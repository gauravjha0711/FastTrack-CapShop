FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["backend/services/CapShop.OrderService/CapShop.OrderService.csproj", "backend/services/CapShop.OrderService/"]
RUN dotnet restore "backend/services/CapShop.OrderService/CapShop.OrderService.csproj"

COPY . .
WORKDIR "/src/backend/services/CapShop.OrderService"
RUN dotnet publish "CapShop.OrderService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CapShop.OrderService.dll"]