package com.chatapp.service;

import com.chatapp.model.User;
import com.chatapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserPresenceService {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    
    // Track active WebSocket sessions per user
    private final Map<String, Integer> activeSessions = new ConcurrentHashMap<>();

    public void userConnected(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        activeSessions.merge(username, 1, Integer::sum);
        
        if (activeSessions.get(username) == 1) {
            user.setStatus(User.UserStatus.ONLINE);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
            
            // Broadcast presence change
            messagingTemplate.convertAndSend("/topic/presence", 
                Map.of("username", username, "status", "ONLINE", "lastSeen", user.getLastSeen()));
        }
    }

    public void userDisconnected(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        activeSessions.computeIfPresent(username, (k, v) -> v > 1 ? v - 1 : null);
        
        if (!activeSessions.containsKey(username)) {
            user.setStatus(User.UserStatus.OFFLINE);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
            
            // Broadcast presence change
            messagingTemplate.convertAndSend("/topic/presence", 
                Map.of("username", username, "status", "OFFLINE", "lastSeen", user.getLastSeen()));
        }
    }

    public void updateUserStatus(String username, User.UserStatus status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setStatus(status);
        user.setLastSeen(LocalDateTime.now());
        userRepository.save(user);
        
        messagingTemplate.convertAndSend("/topic/presence", 
            Map.of("username", username, "status", status, "lastSeen", user.getLastSeen()));
    }

    public User.UserStatus getUserStatus(String username) {
        return userRepository.findByUsername(username)
                .map(User::getStatus)
                .orElse(User.UserStatus.OFFLINE);
    }

    public Map<String, User.UserStatus> getAllUsersStatus() {
        return userRepository.findAll()
                .stream()
                .collect(Collectors.toMap(User::getUsername, User::getStatus));
    }
}
