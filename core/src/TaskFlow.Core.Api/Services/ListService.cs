using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Repositories;

namespace TaskFlow.Core.Api.Services;

public class ListService : IListService
{
    private readonly IListRepository _repository;
    private readonly ICacheService _cache;

    public ListService(IListRepository repository, ICacheService cache)
    {
        _repository = repository;
        _cache = cache;
    }

    public async Task<IEnumerable<List>> GetBoardListsAsync(int boardId)
    {
        return await _repository.GetByBoardIdAsync(boardId);
    }

    public async Task<List?> GetListAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<List> CreateListAsync(List list)
    {
        return await _repository.CreateAsync(list);
    }

    public async Task<List> UpdateListAsync(List list)
    {
        return await _repository.UpdateAsync(list);
    }

    public async Task DeleteListAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
