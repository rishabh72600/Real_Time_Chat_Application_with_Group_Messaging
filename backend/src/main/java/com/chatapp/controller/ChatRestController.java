package com.chatapp.controller;

import com.chatapp.model.Message;
import com.chatapp.model.User;
import com.chatapp.service.ChatService;
import com.chatapp.service.UserPresenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatRestController {

    private final ChatService chatService;
    private final UserPresenceService userPresenceService;

    @GetMapping("/history/{chatRoomId}")
    public ResponseEntity<List<Message>> getChatHistory(@PathVariable String chatRoomId) {
        return ResponseEntity.ok(chatService.getChatHistory(chatRoomId));
    }

    @GetMapping("/unread/{chatRoomId}/{userId}")
    public ResponseEntity<List<Message>> getUnreadMessages(
            @PathVariable String chatRoomId,
            @PathVariable String userId) {
        return ResponseEntity.ok(chatService.getUnreadMessages(chatRoomId, userId));
    }

    @GetMapping("/unread-count/{chatRoomId}/{userId}")
    public ResponseEntity<Integer> getUnreadMessageCount(
            @PathVariable String chatRoomId,
            @PathVariable String userId) {
        return ResponseEntity.ok(chatService.getUnreadMessageCount(chatRoomId, userId));
    }

    @GetMapping("/presence")
    public ResponseEntity<Map<String, User.UserStatus>> getAllUsersStatus() {
        return ResponseEntity.ok(userPresenceService.getAllUsersStatus());
    }

    @GetMapping("/presence/{username}")
    public ResponseEntity<User.UserStatus> getUserStatus(@PathVariable String username) {
        return ResponseEntity.ok(userPresenceService.getUserStatus(username));
    }
}
