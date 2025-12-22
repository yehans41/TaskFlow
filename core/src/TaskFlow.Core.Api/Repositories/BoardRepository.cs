using Microsoft.EntityFrameworkCore;
using TaskFlow.Core.Api.Data;
using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public class BoardRepository : IBoardRepository
{
    private readonly TaskFlowDbContext _context;

    public BoardRepository(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Board>> GetByWorkspaceIdAsync(int workspaceId)
    {
        return await _context.Boards
            .Where(b => b.WorkspaceId == workspaceId)
            .Include(b => b.Lists)
            .ToListAsync();
    }

    public async Task<Board?> GetByIdAsync(int id)
    {
        return await _context.Boards
            .Include(b => b.Lists)
            .ThenInclude(l => l.Cards)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    public async Task<Board> CreateAsync(Board board)
    {
        _context.Boards.Add(board);
        await _context.SaveChangesAsync();
        return board;
    }

    public async Task<Board> UpdateAsync(Board board)
    {
        board.UpdatedAt = DateTime.UtcNow;
        _context.Boards.Update(board);
        await _context.SaveChangesAsync();
        return board;
    }

    public async Task DeleteAsync(int id)
    {
        var board = await _context.Boards.FindAsync(id);
        if (board != null)
        {
            _context.Boards.Remove(board);
            await _context.SaveChangesAsync();
        }
    }
}
