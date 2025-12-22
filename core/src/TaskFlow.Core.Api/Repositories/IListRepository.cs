using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public interface IListRepository
{
    Task<IEnumerable<List>> GetByBoardIdAsync(int boardId);
    Task<List?> GetByIdAsync(int id);
    Task<List> CreateAsync(List list);
    Task<List> UpdateAsync(List list);
    Task DeleteAsync(int id);
}
