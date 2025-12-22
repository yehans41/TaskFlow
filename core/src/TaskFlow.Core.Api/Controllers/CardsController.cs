using Microsoft.AspNetCore.Mvc;
using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Services;

namespace TaskFlow.Core.Api.Controllers;

[ApiController]
[Route("api")]
public class CardsController : ControllerBase
{
    private readonly ICardService _cardService;

    public CardsController(ICardService cardService)
    {
        _cardService = cardService;
    }

    [HttpGet("lists/{listId}/cards")]
    public async Task<ActionResult<IEnumerable<Card>>> GetListCards(int listId)
    {
        var cards = await _cardService.GetListCardsAsync(listId);
        return Ok(cards);
    }

    [HttpGet("cards/{id}")]
    public async Task<ActionResult<Card>> GetCard(int id)
    {
        var card = await _cardService.GetCardAsync(id);

        if (card == null)
            return NotFound();

        return card;
    }

    [HttpPost("lists/{listId}/cards")]
    public async Task<ActionResult<Card>> CreateCard(int listId, [FromBody] Card card)
    {
        card.ListId = listId;
        var created = await _cardService.CreateCardAsync(card);
        return CreatedAtAction(nameof(GetCard), new { id = created.Id }, created);
    }

    [HttpPut("cards/{id}")]
    public async Task<ActionResult<Card>> UpdateCard(int id, [FromBody] Card card)
    {
        card.Id = id;
        var updated = await _cardService.UpdateCardAsync(card);
        return updated;
    }

    [HttpDelete("cards/{id}")]
    public async Task<IActionResult> DeleteCard(int id)
    {
        await _cardService.DeleteCardAsync(id);
        return NoContent();
    }
}
