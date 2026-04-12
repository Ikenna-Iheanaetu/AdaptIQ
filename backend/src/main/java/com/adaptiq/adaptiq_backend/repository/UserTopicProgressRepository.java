package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.UserTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserTopicProgressRepository extends JpaRepository<UserTopicProgress, UUID> {
}
