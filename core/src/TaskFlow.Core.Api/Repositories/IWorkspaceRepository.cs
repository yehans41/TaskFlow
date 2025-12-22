using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public interface IWorkspaceRepository
{
    Task<IEnumerable<Workspace>> GetByUserIdAsync(string userId);
    Task<Workspace?> GetByIdAsync(int id);
    Task<Workspace> CreateAsync(Workspace workspace);
    Task<Workspace> UpdateAsync(Workspace workspace);
    Task DeleteAsync(int id);
}
