package lk.gov.nexus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NexusGovApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusGovApplication.class, args);
        System.out.println("====================================================");
        System.out.println("NexusGov Spring Boot Server running on: http://localhost:5000");
        System.out.println("Health Check: http://localhost:5000/api/health");
        System.out.println("Modules Active: user, application, verification, document, admin, operation");
        System.out.println("====================================================");
    }
}
