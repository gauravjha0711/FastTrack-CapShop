using CapShop.CatalogService.Services.Chatbot;
using Microsoft.AspNetCore.Mvc;

namespace CapShop.CatalogService.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ChatbotController : ControllerBase
{
    private readonly IChatbotService _chatbotService;

    public ChatbotController(IChatbotService chatbotService)
    {
        _chatbotService = chatbotService;
    }

    public sealed class ChatbotMessageRequestDto
    {
        public string? Message { get; set; }
        public string? ConversationId { get; set; }
    }

    public sealed class ChatbotMessageResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public string ConversationId { get; set; } = string.Empty;
        public List<string> Suggestions { get; set; } = new();
        public DateTimeOffset AtUtc { get; set; }
    }

    // POST: /api/Chatbot/message
    // Exposed via Gateway: /gateway/chatbot/message
    [HttpPost("message")]
    [ProducesResponseType(typeof(ChatbotMessageResponseDto), StatusCodes.Status200OK)]
    public async Task<ActionResult<ChatbotMessageResponseDto>> Message(
        [FromBody] ChatbotMessageRequestDto request,
        CancellationToken cancellationToken)
    {
        var safeMessage = (request.Message ?? string.Empty);
        if (safeMessage.Length > 1000)
        {
            safeMessage = safeMessage[..1000];
        }

        var result = await _chatbotService.ReplyAsync(
            new ChatbotMessageRequest(
                Message: safeMessage,
                ConversationId: request.ConversationId),
            cancellationToken);

        return Ok(new ChatbotMessageResponseDto
        {
            Reply = result.Reply,
            ConversationId = result.ConversationId,
            Suggestions = result.Suggestions.ToList(),
            AtUtc = result.AtUtc
        });
    }
}
