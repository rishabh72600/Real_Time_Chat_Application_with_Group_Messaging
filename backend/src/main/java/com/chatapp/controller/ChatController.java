package com.chatapp.controller;

import com.chatapp.dto.ChatMessage;
import com.chatapp.dto.ReadReceipt;
import com.chatapp.dto.TypingIndicator;
import com.chatapp.model.Message;
import com.chatapp.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/chat/{chatRoomId}")
    public Message sendMessage(@Payload ChatMessage chatMessage) {
        return chatService.sendMessage(chatMessage);
    }

    @MessageMapping("/chat.typing")
    public void typing(@Payload TypingIndicator typingIndicator) {
        chatService.sendTypingIndicator(typingIndicator);
    }

    @MessageMapping("/chat.readReceipt")
    public void markAsRead(@Payload ReadReceipt readReceipt) {
        chatService.markMessageAsRead(readReceipt);
    }

    @MessageMapping("/chat.markDelivered")
    public void markAsDelivered(@Payload ReadReceipt readReceipt) {
        chatService.markMessageAsDelivered(readReceipt.getMessageId(), readReceipt.getUsername());
    }
}
