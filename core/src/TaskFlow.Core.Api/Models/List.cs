namespace TaskFlow.Core.Api.Models;

public class List
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Position { get; set; }
    public int BoardId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Board? Board { get; set; }
    public ICollection<Card> Cards { get; set; } = new List<Card>();
}
