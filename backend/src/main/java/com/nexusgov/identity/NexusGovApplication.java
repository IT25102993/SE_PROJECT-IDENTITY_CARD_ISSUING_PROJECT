package com.nexusgov.identity;

import com.nexusgov.identity.config.DatabaseBootstrap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * NexusGov Identity Card Issuing System
 * Java Spring Boot Backend — Entry Point
 */
@SpringBootApplication
public class NexusGovApplication {

    public static void main(String[] args) {
        // Create the MySQL database if it does not exist yet (same step the Node.js server does).
        DatabaseBootstrap.createDatabaseIfMissing();

        SpringApplication.run(NexusGovApplication.class, args);
        System.out.println("====================================================");
        System.out.println("NexusGov Server running on http://localhost:5000");
        System.out.println("Health Check: http://localhost:5000/api/health");
        System.out.println("====================================================");
    }
}
