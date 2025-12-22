FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/TaskFlow.Core.Api/TaskFlow.Core.Api.csproj", "TaskFlow.Core.Api/"]
RUN dotnet restore "TaskFlow.Core.Api/TaskFlow.Core.Api.csproj"

COPY src/TaskFlow.Core.Api/ TaskFlow.Core.Api/
WORKDIR "/src/TaskFlow.Core.Api"
RUN dotnet build "TaskFlow.Core.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskFlow.Core.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "TaskFlow.Core.Api.dll"]
