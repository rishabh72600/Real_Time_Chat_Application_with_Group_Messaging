package com.chatapp.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    private String chatRoomId;
    private String senderId;
    private String content;
    private MessageType type;
    private String fileUrl;
    private String fileName;
    private String fileType;
    private long fileSize;
    private boolean edited;
    private LocalDateTime editedAt;
    private LocalDateTime createdAt;
    private Set<String> readBy;
    private Set<String> deliveredTo;

    public enum MessageType {
        TEXT, IMAGE, FILE, AUDIO, VIDEO
    }
}
