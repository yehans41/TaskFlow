using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Repositories;

public interface ICardRepository
{
    Task<IEnumerable<Card>> GetByListIdAsync(int listId);
    Task<Card?> GetByIdAsync(int id);
    Task<Card> CreateAsync(Card card);
    Task<Card> UpdateAsync(Card card);
    Task DeleteAsync(int id);
}
