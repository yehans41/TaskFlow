using System.Collections.Concurrent;

namespace TaskFlow.Core.Api.Services;

public class InMemoryCacheService : ICacheService
{
    private readonly ConcurrentDictionary<string, (object Value, DateTime? Expiry)> _cache = new();

    public Task<T?> GetAsync<T>(string key)
    {
        if (_cache.TryGetValue(key, out var cached))
        {
            if (cached.Expiry == null || cached.Expiry > DateTime.UtcNow)
            {
                return Task.FromResult((T?)cached.Value);
            }
            _cache.TryRemove(key, out _);
        }
        return Task.FromResult(default(T));
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        var expiryTime = expiry.HasValue ? DateTime.UtcNow.Add(expiry.Value) : (DateTime?)null;
        _cache[key] = (value!, expiryTime);
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key)
    {
        _cache.TryRemove(key, out _);
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string key)
    {
        return Task.FromResult(_cache.ContainsKey(key));
    }
}
