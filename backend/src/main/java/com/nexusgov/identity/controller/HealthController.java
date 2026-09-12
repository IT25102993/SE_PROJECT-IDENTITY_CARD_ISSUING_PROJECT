package com.nexusgov.identity.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

/**
 * Health check controller — mirrors the GET /api/health route in server.js.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "online",
            "system", "NexusGov Identity Card System API",
            "timestamp", Instant.now().toString(),
            "backend", "Java Spring Boot 3"
        ));
    }
}
