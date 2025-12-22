using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Repositories;

namespace TaskFlow.Core.Api.Services;

public class CardService : ICardService
{
    private readonly ICardRepository _repository;

    public CardService(ICardRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<Card>> GetListCardsAsync(int listId)
    {
        return await _repository.GetByListIdAsync(listId);
    }

    public async Task<Card?> GetCardAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<Card> CreateCardAsync(Card card)
    {
        return await _repository.CreateAsync(card);
    }

    public async Task<Card> UpdateCardAsync(Card card)
    {
        return await _repository.UpdateAsync(card);
    }

    public async Task DeleteCardAsync(int id)
    {
        await _repository.DeleteAsync(id);
    }
}
