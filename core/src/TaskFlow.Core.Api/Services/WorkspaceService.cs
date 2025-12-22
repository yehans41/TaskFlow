using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Repositories;

namespace TaskFlow.Core.Api.Services;

public class WorkspaceService : IWorkspaceService
{
    private readonly IWorkspaceRepository _repository;
    private readonly ICacheService _cache;

    public WorkspaceService(IWorkspaceRepository repository, ICacheService cache)
    {
        _repository = repository;
        _cache = cache;
    }

    public async Task<IEnumerable<Workspace>> GetUserWorkspacesAsync(string userId)
    {
        var cacheKey = $"workspaces:user:{userId}";
        var cached = await _cache.GetAsync<IEnumerable<Workspace>>(cacheKey);

        if (cached != null)
            return cached;

        var workspaces = await _repository.GetByUserIdAsync(userId);
        await _cache.SetAsync(cacheKey, workspaces, TimeSpan.FromMinutes(5));

        return workspaces;
    }

    public async Task<Workspace?> GetWorkspaceAsync(int id, string userId)
    {
        var workspace = await _repository.GetByIdAsync(id);

        if (workspace == null || workspace.OwnerId != userId)
            return null;

        return workspace;
    }

    public async Task<Workspace> CreateWorkspaceAsync(Workspace workspace)
    {
        var created = await _repository.CreateAsync(workspace);
        await _cache.RemoveAsync($"workspaces:user:{workspace.OwnerId}");
        return created;
    }

    public async Task<Workspace> UpdateWorkspaceAsync(Workspace workspace, string userId)
    {
        var existing = await _repository.GetByIdAsync(workspace.Id);

        if (existing == null || existing.OwnerId != userId)
            throw new UnauthorizedAccessException("Not authorized to update this workspace");

        var updated = await _repository.UpdateAsync(workspace);
        await _cache.RemoveAsync($"workspaces:user:{userId}");

        return updated;
    }

    public async Task DeleteWorkspaceAsync(int id, string userId)
    {
        var workspace = await _repository.GetByIdAsync(id);

        if (workspace == null || workspace.OwnerId != userId)
            throw new UnauthorizedAccessException("Not authorized to delete this workspace");

        await _repository.DeleteAsync(id);
        await _cache.RemoveAsync($"workspaces:user:{userId}");
    }
}
