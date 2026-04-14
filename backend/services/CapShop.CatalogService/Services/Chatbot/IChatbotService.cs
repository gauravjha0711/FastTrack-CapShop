namespace CapShop.CatalogService.Services.Chatbot;

public interface IChatbotService
{
    Task<ChatbotMessageResponse> ReplyAsync(ChatbotMessageRequest request, CancellationToken cancellationToken = default);
}

public sealed record ChatbotMessageRequest(
    string Message,
    string? ConversationId = null);

public sealed record ChatbotMessageResponse(
    string Reply,
    string ConversationId,
    IReadOnlyList<string> Suggestions,
    DateTimeOffset AtUtc);
