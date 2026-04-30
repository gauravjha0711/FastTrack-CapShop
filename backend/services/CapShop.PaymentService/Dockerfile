FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["backend/services/CapShop.PaymentService/CapShop.PaymentService.csproj", "backend/services/CapShop.PaymentService/"]
RUN dotnet restore "backend/services/CapShop.PaymentService/CapShop.PaymentService.csproj"

COPY . .
WORKDIR "/src/backend/services/CapShop.PaymentService"
RUN dotnet publish "CapShop.PaymentService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Development

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CapShop.PaymentService.dll"]
