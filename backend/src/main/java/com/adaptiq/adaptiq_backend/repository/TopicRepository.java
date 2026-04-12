package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TopicRepository extends JpaRepository<Topic, UUID> {
}
