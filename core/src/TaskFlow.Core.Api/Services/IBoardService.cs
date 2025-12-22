using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Services;

public interface IBoardService
{
    Task<IEnumerable<Board>> GetWorkspaceBoardsAsync(int workspaceId);
    Task<Board?> GetBoardAsync(int id);
    Task<Board> CreateBoardAsync(Board board);
    Task<Board> UpdateBoardAsync(Board board);
    Task DeleteBoardAsync(int id);
}
