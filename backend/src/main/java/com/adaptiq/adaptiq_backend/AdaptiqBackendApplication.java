package com.adaptiq.adaptiq_backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AdaptiqBackendApplication {

	public static void main(String[] args) {
		// Load .env variables before starting Spring Boot
		Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
		dotenv.entries().forEach(entry -> System.setProperty(entry.getKey(), entry.getValue()));

		SpringApplication.run(AdaptiqBackendApplication.class, args);
	}

}
