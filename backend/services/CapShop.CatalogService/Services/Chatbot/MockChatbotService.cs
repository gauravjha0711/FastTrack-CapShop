using System.Text.RegularExpressions;

namespace CapShop.CatalogService.Services.Chatbot;

public sealed class MockChatbotService : IChatbotService
{
    private static readonly Regex MultiSpace = new(@"\s+", RegexOptions.Compiled);

    public Task<ChatbotMessageResponse> ReplyAsync(ChatbotMessageRequest request, CancellationToken cancellationToken = default)
    {
        var conversationId = string.IsNullOrWhiteSpace(request.ConversationId)
            ? Guid.NewGuid().ToString("N")
            : request.ConversationId!.Trim();

        var message = Normalize(request.Message);

        if (string.IsNullOrWhiteSpace(message))
        {
            return Task.FromResult(new ChatbotMessageResponse(
                Reply: "Tell me what you’re looking for (e.g., ‘caps under 999’, ‘recommend a gift’, ‘track my order’).",
                ConversationId: conversationId,
                Suggestions: new[] { "Ask about products", "Get recommendations", "Track my order" },
                AtUtc: DateTimeOffset.UtcNow));
        }

        // Basic keyword routing – safe placeholder logic (no PII, no DB calls).
        if (ContainsAny(message, "track", "tracking", "order status", "where is my order", "delivery"))
        {
            return Task.FromResult(new ChatbotMessageResponse(
                Reply: "To track an order: open ‘Orders’ after you log in, then select an order to see its current status. If you have an Order ID, you can also search it on the Orders page.",
                ConversationId: conversationId,
                Suggestions: new[] { "Show my recent orders", "What does ‘Shipped’ mean?", "Payment issues" },
                AtUtc: DateTimeOffset.UtcNow));
        }

        if (ContainsAny(message, "recommend", "recommendation", "suggest", "gift", "birthday", "choose", "help me choose"))
        {
            return Task.FromResult(new ChatbotMessageResponse(
                Reply: "Quick recommendation: tell me (1) budget, (2) style (minimal / street / sporty), and (3) color preference. Meanwhile, popular picks are: classic caps, embroidered caps, and everyday tees.",
                ConversationId: conversationId,
                Suggestions: new[] { "Under 499", "Under 999", "Black color", "Sporty style" },
                AtUtc: DateTimeOffset.UtcNow));
        }

        if (ContainsAny(message, "price", "cost", "under", "budget", "discount", "sale"))
        {
            return Task.FromResult(new ChatbotMessageResponse(
                Reply: "If you share a budget (e.g., ‘under 999’) and a category (caps / tees / hoodies), I can suggest what to look for and how to filter quickly on the Products page.",
                ConversationId: conversationId,
                Suggestions: new[] { "Caps under 999", "Tees under 799", "Show featured" },
                AtUtc: DateTimeOffset.UtcNow));
        }

        if (ContainsAny(message, "return", "refund", "cancel", "exchange"))
        {
            return Task.FromResult(new ChatbotMessageResponse(
                Reply: "For returns/refunds: go to Orders → select the order → check available actions. If you don’t see return options, the item may be outside the return window or not eligible.",
                ConversationId: conversationId,
                Suggestions: new[] { "Track my order", "Payment issues", "Contact support" },
                AtUtc: DateTimeOffset.UtcNow));
        }

        // Generic fallback
        return Task.FromResult(new ChatbotMessageResponse(
            Reply: "I can help you shop faster. Try: ‘recommend a cap for summer’, ‘caps under 999’, ‘help me choose a gift’, or ‘track my order’.",
            ConversationId: conversationId,
            Suggestions: new[] { "Ask about products", "Get recommendations", "Help me choose" },
            AtUtc: DateTimeOffset.UtcNow));
    }

    private static string Normalize(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        var trimmed = input.Trim();
        trimmed = MultiSpace.Replace(trimmed, " ");
        return trimmed.ToLowerInvariant();
    }

    private static bool ContainsAny(string input, params string[] tokens)
    {
        foreach (var token in tokens)
        {
            if (input.Contains(token.ToLowerInvariant(), StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }
}
