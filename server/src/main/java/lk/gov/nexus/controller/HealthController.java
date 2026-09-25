package lk.gov.nexus.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<?> checkHealth() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "online");
        res.put("system", "NexusGov Identity Card System API (Spring Boot Architecture)");
        res.put("modules", Arrays.asList(
                "user-management",
                "application-form-management",
                "verification-management",
                "document-upload-management",
                "admin-management",
                "operation-management"
        ));
        res.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(res);
    }
}
