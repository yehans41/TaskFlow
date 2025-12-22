using Microsoft.EntityFrameworkCore;
using TaskFlow.Core.Api.Data;
using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public class WorkspaceRepository : IWorkspaceRepository
{
    private readonly TaskFlowDbContext _context;

    public WorkspaceRepository(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Workspace>> GetByUserIdAsync(string userId)
    {
        return await _context.Workspaces
            .Where(w => w.OwnerId == userId)
            .Include(w => w.Boards)
            .ToListAsync();
    }

    public async Task<Workspace?> GetByIdAsync(int id)
    {
        return await _context.Workspaces
            .Include(w => w.Boards)
            .FirstOrDefaultAsync(w => w.Id == id);
    }

    public async Task<Workspace> CreateAsync(Workspace workspace)
    {
        _context.Workspaces.Add(workspace);
        await _context.SaveChangesAsync();
        return workspace;
    }

    public async Task<Workspace> UpdateAsync(Workspace workspace)
    {
        workspace.UpdatedAt = DateTime.UtcNow;
        _context.Workspaces.Update(workspace);
        await _context.SaveChangesAsync();
        return workspace;
    }

    public async Task DeleteAsync(int id)
    {
        var workspace = await _context.Workspaces.FindAsync(id);
        if (workspace != null)
        {
            _context.Workspaces.Remove(workspace);
            await _context.SaveChangesAsync();
        }
    }
}
