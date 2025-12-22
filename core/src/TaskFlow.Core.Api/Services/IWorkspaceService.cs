using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Services;

public interface IWorkspaceService
{
    Task<IEnumerable<Workspace>> GetUserWorkspacesAsync(string userId);
    Task<Workspace?> GetWorkspaceAsync(int id, string userId);
    Task<Workspace> CreateWorkspaceAsync(Workspace workspace);
    Task<Workspace> UpdateWorkspaceAsync(Workspace workspace, string userId);
    Task DeleteWorkspaceAsync(int id, string userId);
}
