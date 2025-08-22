package com.chatapp.service;

import com.chatapp.dto.ChatMessage;
import com.chatapp.dto.ReadReceipt;
import com.chatapp.dto.TypingIndicator;
import com.chatapp.model.ChatRoom;
import com.chatapp.model.Message;
import com.chatapp.model.User;
import com.chatapp.repository.ChatRoomRepository;
import com.chatapp.repository.MessageRepository;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Message sendMessage(ChatMessage chatMessage) {
        User sender = userRepository.findByUsername(chatMessage.getSender())
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatRoom chatRoom = chatRoomRepository.findById(chatMessage.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        Message message = new Message();
        message.setChatRoomId(chatMessage.getChatRoomId());
        message.setSenderId(sender.getId());
        message.setContent(chatMessage.getContent());
        message.setType(Message.MessageType.TEXT);
        message.setCreatedAt(LocalDateTime.now());
        message.setReadBy(Set.of());
        message.setDeliveredTo(Set.of());

        Message savedMessage = messageRepository.save(message);

        // Send to chat room
        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatMessage.getChatRoomId(),
                savedMessage
        );

        // Send typing stopped
        messagingTemplate.convertAndSend(
                "/topic/chat/" + chatMessage.getChatRoomId() + "/typing",
                new TypingIndicator(chatMessage.getChatRoomId(), chatMessage.getSender(), false)
        );

        return savedMessage;
    }

    public List<Message> getChatHistory(String chatRoomId) {
        return messageRepository.findByChatRoomIdOrderByCreatedAtAsc(chatRoomId);
    }

    public void sendTypingIndicator(TypingIndicator typingIndicator) {
        messagingTemplate.convertAndSend(
                "/topic/chat/" + typingIndicator.getChatRoomId() + "/typing",
                typingIndicator
        );
    }

    public void markMessageAsRead(ReadReceipt readReceipt) {
        Message message = messageRepository.findById(readReceipt.getMessageId())
                .orElseThrow(() -> new RuntimeException("Message not found"));

        User reader = userRepository.findByUsername(readReceipt.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<String> readBy = message.getReadBy();
        readBy.add(reader.getId());
        message.setReadBy(readBy);

        messageRepository.save(message);

        // Send read receipt to sender
        messagingTemplate.convertAndSend(
                "/topic/chat/" + readReceipt.getChatRoomId() + "/read",
                readReceipt
        );
    }

    public void markMessageAsDelivered(String messageId, String userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        Set<String> deliveredTo = message.getDeliveredTo();
        deliveredTo.add(userId);
        message.setDeliveredTo(deliveredTo);

        messageRepository.save(message);
    }

    public List<Message> getUnreadMessages(String chatRoomId, String userId) {
        return messageRepository.findByChatRoomIdOrderByCreatedAtAsc(chatRoomId)
                .stream()
                .filter(msg -> !msg.getReadBy().contains(userId) && !msg.getSenderId().equals(userId))
                .collect(Collectors.toList());
    }

    public int getUnreadMessageCount(String chatRoomId, String userId) {
        return (int) messageRepository.findByChatRoomIdOrderByCreatedAtAsc(chatRoomId)
                .stream()
                .filter(msg -> !msg.getReadBy().contains(userId) && !msg.getSenderId().equals(userId))
                .count();
    }
}
