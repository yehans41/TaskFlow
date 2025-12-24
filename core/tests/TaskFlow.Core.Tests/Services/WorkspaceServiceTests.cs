using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Repositories;
using TaskFlow.Core.Api.Services;
using Xunit;

namespace TaskFlow.Core.Tests.Services;

public class WorkspaceServiceTests
{
    private readonly Mock<IWorkspaceRepository> _mockRepository;
    private readonly Mock<ICacheService> _mockCache;
    private readonly WorkspaceService _service;

    public WorkspaceServiceTests()
    {
        _mockRepository = new Mock<IWorkspaceRepository>();
        _mockCache = new Mock<ICacheService>();
        _service = new WorkspaceService(_mockRepository.Object, _mockCache.Object);
    }

    [Fact]
    public async Task GetUserWorkspacesAsync_ReturnsWorkspaces()
    {
        // Arrange
        var userId = "user123";
        var workspaces = new List<Workspace>
        {
            new Workspace { Id = 1, Name = "Workspace 1", OwnerId = userId },
            new Workspace { Id = 2, Name = "Workspace 2", OwnerId = userId }
        };

        _mockCache.Setup(c => c.GetAsync<IEnumerable<Workspace>>(It.IsAny<string>()))
            .ReturnsAsync((IEnumerable<Workspace>?)null);
        _mockRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync(workspaces);

        // Act
        var result = await _service.GetUserWorkspacesAsync(userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
        _mockCache.Verify(c => c.SetAsync(It.IsAny<string>(), It.IsAny<IEnumerable<Workspace>>(), It.IsAny<TimeSpan>()), Times.Once);
    }

    [Fact]
    public async Task GetWorkspaceAsync_WithValidId_ReturnsWorkspace()
    {
        // Arrange
        var workspaceId = 1;
        var userId = "user123";
        var workspace = new Workspace { Id = workspaceId, Name = "Test Workspace", OwnerId = userId };

        _mockRepository.Setup(r => r.GetByIdAsync(workspaceId))
            .ReturnsAsync(workspace);

        // Act
        var result = await _service.GetWorkspaceAsync(workspaceId, userId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(workspaceId, result.Id);
        Assert.Equal(userId, result.OwnerId);
    }

    [Fact]
    public async Task GetWorkspaceAsync_WithWrongUser_ReturnsNull()
    {
        // Arrange
        var workspaceId = 1;
        var workspace = new Workspace { Id = workspaceId, Name = "Test Workspace", OwnerId = "user123" };

        _mockRepository.Setup(r => r.GetByIdAsync(workspaceId))
            .ReturnsAsync(workspace);

        // Act
        var result = await _service.GetWorkspaceAsync(workspaceId, "differentUser");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateWorkspaceAsync_CreatesAndInvalidatesCache()
    {
        // Arrange
        var workspace = new Workspace { Name = "New Workspace", OwnerId = "user123" };
        var createdWorkspace = new Workspace { Id = 1, Name = workspace.Name, OwnerId = workspace.OwnerId };

        _mockRepository.Setup(r => r.CreateAsync(workspace))
            .ReturnsAsync(createdWorkspace);

        // Act
        var result = await _service.CreateWorkspaceAsync(workspace);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        _mockCache.Verify(c => c.RemoveAsync($"workspaces:user:{workspace.OwnerId}"), Times.Once);
    }

    [Fact]
    public async Task DeleteWorkspaceAsync_WithUnauthorizedUser_ThrowsException()
    {
        // Arrange
        var workspaceId = 1;
        var workspace = new Workspace { Id = workspaceId, Name = "Test Workspace", OwnerId = "user123" };

        _mockRepository.Setup(r => r.GetByIdAsync(workspaceId))
            .ReturnsAsync(workspace);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.DeleteWorkspaceAsync(workspaceId, "differentUser"));
    }
}
