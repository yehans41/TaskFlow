using Microsoft.AspNetCore.Mvc;
using TaskFlow.Core.Api.Models;
using TaskFlow.Core.Api.Services;

namespace TaskFlow.Core.Api.Controllers;

[ApiController]
[Route("api/workspaces")]
public class WorkspacesController : ControllerBase
{
    private readonly IWorkspaceService _workspaceService;

    public WorkspacesController(IWorkspaceService workspaceService)
    {
        _workspaceService = workspaceService;
    }

    private string GetUserId() => Request.Headers["X-User-Id"].ToString();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Workspace>>> GetWorkspaces()
    {
        var userId = GetUserId();
        var workspaces = await _workspaceService.GetUserWorkspacesAsync(userId);
        return Ok(workspaces);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Workspace>> GetWorkspace(int id)
    {
        var userId = GetUserId();
        var workspace = await _workspaceService.GetWorkspaceAsync(id, userId);

        if (workspace == null)
            return NotFound();

        return workspace;
    }

    [HttpPost]
    public async Task<ActionResult<Workspace>> CreateWorkspace([FromBody] Workspace workspace)
    {
        workspace.OwnerId = GetUserId();
        var created = await _workspaceService.CreateWorkspaceAsync(workspace);
        return CreatedAtAction(nameof(GetWorkspace), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Workspace>> UpdateWorkspace(int id, [FromBody] Workspace workspace)
    {
        workspace.Id = id;
        var userId = GetUserId();

        try
        {
            var updated = await _workspaceService.UpdateWorkspaceAsync(workspace, userId);
            return updated;
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteWorkspace(int id)
    {
        var userId = GetUserId();

        try
        {
            await _workspaceService.DeleteWorkspaceAsync(id, userId);
            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
