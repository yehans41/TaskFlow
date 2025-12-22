using Moq;
using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Repositories;
using TaskFlow.Core.Api.Services;
using Xunit;

namespace TaskFlow.Core.Tests.Services;

public class BoardServiceTests
{
    private readonly Mock<IBoardRepository> _mockRepository;
    private readonly Mock<ICacheService> _mockCache;
    private readonly BoardService _service;

    public BoardServiceTests()
    {
        _mockRepository = new Mock<IBoardRepository>();
        _mockCache = new Mock<ICacheService>();
        _service = new BoardService(_mockRepository.Object, _mockCache.Object);
    }

    [Fact]
    public async Task GetWorkspaceBoardsAsync_ReturnsBoards()
    {
        // Arrange
        var workspaceId = 1;
        var boards = new List<Board>
        {
            new Board { Id = 1, Name = "Board 1", WorkspaceId = workspaceId },
            new Board { Id = 2, Name = "Board 2", WorkspaceId = workspaceId }
        };

        _mockCache.Setup(c => c.GetAsync<IEnumerable<Board>>(It.IsAny<string>()))
            .ReturnsAsync((IEnumerable<Board>?)null);
        _mockRepository.Setup(r => r.GetByWorkspaceIdAsync(workspaceId))
            .ReturnsAsync(boards);

        // Act
        var result = await _service.GetWorkspaceBoardsAsync(workspaceId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }

    [Fact]
    public async Task GetBoardAsync_WithCachedData_ReturnsCachedBoard()
    {
        // Arrange
        var boardId = 1;
        var cachedBoard = new Board { Id = boardId, Name = "Cached Board" };

        _mockCache.Setup(c => c.GetAsync<Board>($"board:{boardId}"))
            .ReturnsAsync(cachedBoard);

        // Act
        var result = await _service.GetBoardAsync(boardId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(boardId, result.Id);
        _mockRepository.Verify(r => r.GetByIdAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task CreateBoardAsync_CreatesAndInvalidatesCache()
    {
        // Arrange
        var board = new Board { Name = "New Board", WorkspaceId = 1 };
        var createdBoard = new Board { Id = 1, Name = board.Name, WorkspaceId = board.WorkspaceId };

        _mockRepository.Setup(r => r.CreateAsync(board))
            .ReturnsAsync(createdBoard);

        // Act
        var result = await _service.CreateBoardAsync(board);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Id);
        _mockCache.Verify(c => c.RemoveAsync($"boards:workspace:{board.WorkspaceId}"), Times.Once);
    }

    [Fact]
    public async Task UpdateBoardAsync_UpdatesAndInvalidatesCache()
    {
        // Arrange
        var board = new Board { Id = 1, Name = "Updated Board", WorkspaceId = 1 };

        _mockRepository.Setup(r => r.UpdateAsync(board))
            .ReturnsAsync(board);

        // Act
        var result = await _service.UpdateBoardAsync(board);

        // Assert
        Assert.NotNull(result);
        _mockCache.Verify(c => c.RemoveAsync($"board:{board.Id}"), Times.Once);
        _mockCache.Verify(c => c.RemoveAsync($"boards:workspace:{board.WorkspaceId}"), Times.Once);
    }
}
