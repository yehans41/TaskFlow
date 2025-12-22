using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Services;

public interface IListService
{
    Task<IEnumerable<List>> GetBoardListsAsync(int boardId);
    Task<List?> GetListAsync(int id);
    Task<List> CreateListAsync(List list);
    Task<List> UpdateListAsync(List list);
    Task DeleteListAsync(int id);
}
