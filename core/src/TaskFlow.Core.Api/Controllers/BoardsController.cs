using Microsoft.AspNetCore.Mvc;
using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Services;

namespace TaskFlow.Core.Api.Controllers;

[ApiController]
[Route("api")]
public class BoardsController : ControllerBase
{
    private readonly IBoardService _boardService;

    public BoardsController(IBoardService boardService)
    {
        _boardService = boardService;
    }

    [HttpGet("workspaces/{workspaceId}/boards")]
    public async Task<ActionResult<IEnumerable<Board>>> GetWorkspaceBoards(int workspaceId)
    {
        var boards = await _boardService.GetWorkspaceBoardsAsync(workspaceId);
        return Ok(boards);
    }

    [HttpGet("boards/{id}")]
    public async Task<ActionResult<Board>> GetBoard(int id)
    {
        var board = await _boardService.GetBoardAsync(id);

        if (board == null)
            return NotFound();

        return board;
    }

    [HttpPost("workspaces/{workspaceId}/boards")]
    public async Task<ActionResult<Board>> CreateBoard(int workspaceId, [FromBody] Board board)
    {
        board.WorkspaceId = workspaceId;
        var created = await _boardService.CreateBoardAsync(board);
        return CreatedAtAction(nameof(GetBoard), new { id = created.Id }, created);
    }

    [HttpPut("boards/{id}")]
    public async Task<ActionResult<Board>> UpdateBoard(int id, [FromBody] Board board)
    {
        board.Id = id;
        var updated = await _boardService.UpdateBoardAsync(board);
        return updated;
    }

    [HttpDelete("boards/{id}")]
    public async Task<IActionResult> DeleteBoard(int id)
    {
        await _boardService.DeleteBoardAsync(id);
        return NoContent();
    }
}
