package com.nexusgov.identity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * NexusGov Identity Card Issuing System
 * Java Spring Boot Backend — Entry Point
 */
@SpringBootApplication
public class NexusGovApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusGovApplication.class, args);
        System.out.println("====================================================");
        System.out.println("NexusGov Server running on http://localhost:5000");
        System.out.println("Health Check: http://localhost:5000/api/health");
        System.out.println("====================================================");
    }
}
