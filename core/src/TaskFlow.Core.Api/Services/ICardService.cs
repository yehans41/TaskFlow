using TaskFlow.Core.Api.Models;

namespace TaskFlow.Core.Api.Services;

public interface ICardService
{
    Task<IEnumerable<Card>> GetListCardsAsync(int listId);
    Task<Card?> GetCardAsync(int id);
    Task<Card> CreateCardAsync(Card card);
    Task<Card> UpdateCardAsync(Card card);
    Task DeleteCardAsync(int id);
}
