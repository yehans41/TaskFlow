using Microsoft.EntityFrameworkCore;
using TaskFlow.Core.Api.Data;
using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public class CardRepository : ICardRepository
{
    private readonly TaskFlowDbContext _context;

    public CardRepository(TaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Card>> GetByListIdAsync(int listId)
    {
        return await _context.Cards
            .Where(c => c.ListId == listId)
            .OrderBy(c => c.Position)
            .ToListAsync();
    }

    public async Task<Card?> GetByIdAsync(int id)
    {
        return await _context.Cards.FindAsync(id);
    }

    public async Task<Card> CreateAsync(Card card)
    {
        _context.Cards.Add(card);
        await _context.SaveChangesAsync();
        return card;
    }

    public async Task<Card> UpdateAsync(Card card)
    {
        card.UpdatedAt = DateTime.UtcNow;
        _context.Cards.Update(card);
        await _context.SaveChangesAsync();
        return card;
    }

    public async Task DeleteAsync(int id)
    {
        var card = await _context.Cards.FindAsync(id);
        if (card != null)
        {
            _context.Cards.Remove(card);
            await _context.SaveChangesAsync();
        }
    }
}
