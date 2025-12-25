using System;
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
        var existingBoard = await _context.Boards.FindAsync(board.Id);
        if (existingBoard == null)
            throw new InvalidOperationException($"Board with ID {board.Id} not found");

        existingBoard.Name = board.Name;
        existingBoard.Description = board.Description;
        existingBoard.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return existingBoard;
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
