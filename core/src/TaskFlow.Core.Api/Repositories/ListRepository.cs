using Microsoft.EntityFrameworkCore;
using TaskFlow.Core.Api.Data;
using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public class ListRepository : IListRepository
{
    private readonly TaskFlowDbContext _context;

    public ListRepository(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<List>> GetByBoardIdAsync(int boardId)
    {
        return await _context.Lists
            .Where(l => l.BoardId == boardId)
            .Include(l => l.Cards)
            .OrderBy(l => l.Position)
            .ToListAsync();
    }

    public async Task<List?> GetByIdAsync(int id)
    {
        return await _context.Lists
            .Include(l => l.Cards)
            .FirstOrDefaultAsync(l => l.Id == id);
    }

    public async Task<List> CreateAsync(List list)
    {
        _context.Lists.Add(list);
        await _context.SaveChangesAsync();
        return list;
    }

    public async Task<List> UpdateAsync(List list)
    {
        list.UpdatedAt = DateTime.UtcNow;
        _context.Lists.Update(list);
        await _context.SaveChangesAsync();
        return list;
    }

    public async Task DeleteAsync(int id)
    {
        var list = await _context.Lists.FindAsync(id);
        if (list != null)
        {
            _context.Lists.Remove(list);
            await _context.SaveChangesAsync();
        }
    }
}
