using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public interface IBoardRepository
{
    Task<IEnumerable<Board>> GetByWorkspaceIdAsync(int workspaceId);
    Task<Board?> GetByIdAsync(int id);
    Task<Board> CreateAsync(Board board);
    Task<Board> UpdateAsync(Board board);
    Task DeleteAsync(int id);
}
