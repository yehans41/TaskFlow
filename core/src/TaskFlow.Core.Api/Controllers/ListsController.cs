using Microsoft.AspNetCore.Mvc;
using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Services;

namespace TaskFlow.Core.Api.Controllers;

[ApiController]
[Route("api")]
public class ListsController : ControllerBase
{
    private readonly IListService _listService;

    public ListsController(IListService listService)
    {
        _listService = listService;
    }

    [HttpGet("boards/{boardId}/lists")]
    public async Task<ActionResult<IEnumerable<List>>> GetBoardLists(int boardId)
    {
        var lists = await _listService.GetBoardListsAsync(boardId);
        return Ok(lists);
    }

    [HttpGet("lists/{id}")]
    public async Task<ActionResult<List>> GetList(int id)
    {
        var list = await _listService.GetListAsync(id);

        if (list == null)
            return NotFound();

        return list;
    }

    [HttpPost("boards/{boardId}/lists")]
    public async Task<ActionResult<List>> CreateList(int boardId, [FromBody] List list)
    {
        list.BoardId = boardId;
        var created = await _listService.CreateListAsync(list);
        return CreatedAtAction(nameof(GetList), new { id = created.Id }, created);
    }

    [HttpPut("lists/{id}")]
    public async Task<ActionResult<List>> UpdateList(int id, [FromBody] List list)
    {
        list.Id = id;
        var updated = await _listService.UpdateListAsync(list);
        return updated;
    }

    [HttpDelete("lists/{id}")]
    public async Task<IActionResult> DeleteList(int id)
    {
        await _listService.DeleteListAsync(id);
        return NoContent();
    }
}
