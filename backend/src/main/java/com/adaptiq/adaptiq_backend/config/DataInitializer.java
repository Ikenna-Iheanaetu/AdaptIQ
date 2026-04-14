package com.adaptiq.adaptiq_backend.config;

import com.adaptiq.adaptiq_backend.model.Topic;
import com.adaptiq.adaptiq_backend.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final TopicRepository topicRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (topicRepository.count() > 0) return;

        Topic python = new Topic();
        python.setName("Python");
        python.setDescription("Beginner-friendly scripting and general-purpose programming");

        Topic javascript = new Topic();
        javascript.setName("JavaScript");
        javascript.setDescription("Web scripting, async patterns, and the DOM");

        Topic java = new Topic();
        java.setName("Java");
        java.setDescription("Object-oriented programming, JVM, and the Collections API");

        Topic databases = new Topic();
        databases.setName("Databases");
        databases.setDescription("SQL, relational design, joins, and indexing");

        Topic dsa = new Topic();
        dsa.setName("Data Structures & Algorithms");
        dsa.setDescription("Arrays, trees, graphs, sorting, and complexity");

        Topic cloud = new Topic();
        cloud.setName("Cloud Computing");
        cloud.setDescription("AWS/GCP/Azure concepts, IaaS, PaaS, and serverless");

        topicRepository.saveAll(List.of(python, javascript, java, databases, dsa, cloud));
    }
}
