package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.UserTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserTopicProgressRepository extends JpaRepository<UserTopicProgress, UUID> {
    Optional<UserTopicProgress> findByUserIdAndTopicId(UUID userId, UUID topicId);
    boolean existsByUserIdAndTopicId(UUID userId, UUID topicId);

    @Query("SELECT p FROM UserTopicProgress p WHERE p.user.id = :userId")
    List<UserTopicProgress> findByUserId(@Param("userId") UUID userId);
}
