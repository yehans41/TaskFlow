using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Repositories;

namespace TaskFlow.Core.Api.Services;

public class BoardService : IBoardService
{
    private readonly IBoardRepository _repository;
    private readonly ICacheService _cache;

    public BoardService(IBoardRepository repository, ICacheService cache)
    {
        _repository = repository;
        _cache = cache;
    }

    public async Task<IEnumerable<Board>> GetWorkspaceBoardsAsync(int workspaceId)
    {
        var cacheKey = $"boards:workspace:{workspaceId}";
        var cached = await _cache.GetAsync<IEnumerable<Board>>(cacheKey);

        if (cached != null)
            return cached;

        var boards = await _repository.GetByWorkspaceIdAsync(workspaceId);
        await _cache.SetAsync(cacheKey, boards, TimeSpan.FromMinutes(5));

        return boards;
    }

    public async Task<Board?> GetBoardAsync(int id)
    {
        var cacheKey = $"board:{id}";
        var cached = await _cache.GetAsync<Board>(cacheKey);

        if (cached != null)
            return cached;

        var board = await _repository.GetByIdAsync(id);

        if (board != null)
            await _cache.SetAsync(cacheKey, board, TimeSpan.FromMinutes(5));

        return board;
    }

    public async Task<Board> CreateBoardAsync(Board board)
    {
        var created = await _repository.CreateAsync(board);
        await _cache.RemoveAsync($"boards:workspace:{board.WorkspaceId}");
        return created;
    }

    public async Task<Board> UpdateBoardAsync(Board board)
    {
        var updated = await _repository.UpdateAsync(board);
        await _cache.RemoveAsync($"board:{board.Id}");
        await _cache.RemoveAsync($"boards:workspace:{board.WorkspaceId}");
        return updated;
    }

    public async Task DeleteBoardAsync(int id)
    {
        var board = await _repository.GetByIdAsync(id);
        if (board != null)
        {
            await _repository.DeleteAsync(id);
            await _cache.RemoveAsync($"board:{id}");
            await _cache.RemoveAsync($"boards:workspace:{board.WorkspaceId}");
        }
    }
}
