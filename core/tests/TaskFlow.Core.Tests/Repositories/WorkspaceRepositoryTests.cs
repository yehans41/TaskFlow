using Microsoft.EntityFrameworkCore;
using TaskFlow.Core.Api.Data;
using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Repositories;
using Xunit;

namespace TaskFlow.Core.Tests.Repositories;

public class WorkspaceRepositoryTests
{
    private TaskFlowDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<TaskFlowDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new TaskFlowDbContext(options);
    }

    [Fact]
    public async Task GetByUserIdAsync_ReturnsUserWorkspaces()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WorkspaceRepository(context);
        var userId = "user123";

        var user = new User { Id = userId, Email = "test@example.com", Name = "Test User" };
        context.Users.Add(user);

        var workspace1 = new Workspace { Name = "Workspace 1", OwnerId = userId };
        var workspace2 = new Workspace { Name = "Workspace 2", OwnerId = userId };
        context.Workspaces.AddRange(workspace1, workspace2);
        await context.SaveChangesAsync();

        // Act
        var result = await repository.GetByUserIdAsync(userId);

        // Assert
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task CreateAsync_CreatesWorkspace()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WorkspaceRepository(context);

        var user = new User { Id = "user123", Email = "test@example.com", Name = "Test User" };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var workspace = new Workspace { Name = "Test Workspace", OwnerId = "user123" };

        // Act
        var result = await repository.CreateAsync(workspace);

        // Assert
        Assert.NotEqual(0, result.Id);
        Assert.Equal("Test Workspace", result.Name);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesWorkspace()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WorkspaceRepository(context);

        var user = new User { Id = "user123", Email = "test@example.com", Name = "Test User" };
        context.Users.Add(user);

        var workspace = new Workspace { Name = "Original Name", OwnerId = "user123" };
        context.Workspaces.Add(workspace);
        await context.SaveChangesAsync();

        // Act
        workspace.Name = "Updated Name";
        var result = await repository.UpdateAsync(workspace);

        // Assert
        Assert.Equal("Updated Name", result.Name);
    }

    [Fact]
    public async Task DeleteAsync_DeletesWorkspace()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var repository = new WorkspaceRepository(context);

        var user = new User { Id = "user123", Email = "test@example.com", Name = "Test User" };
        context.Users.Add(user);

        var workspace = new Workspace { Name = "To Delete", OwnerId = "user123" };
        context.Workspaces.Add(workspace);
        await context.SaveChangesAsync();

        var workspaceId = workspace.Id;

        // Act
        await repository.DeleteAsync(workspaceId);

        // Assert
        var deleted = await context.Workspaces.FindAsync(workspaceId);
        Assert.Null(deleted);
    }
}
