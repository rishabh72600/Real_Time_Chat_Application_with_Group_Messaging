package com.chatapp.repository;

import com.chatapp.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByChatRoomIdOrderByCreatedAtAsc(String chatRoomId);
    List<Message> findByChatRoomIdAndCreatedAtAfterOrderByCreatedAtAsc(String chatRoomId, LocalDateTime createdAt);
    List<Message> findBySenderIdAndReadByNotContaining(String senderId, String userId);
}
