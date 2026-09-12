package com.nexusgov.identity.config;

import com.nexusgov.identity.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration.
 * Stateless JWT — no sessions. Public routes mirror the Node.js route definitions.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (stateless REST API)
            .csrf(AbstractHttpConfigurer::disable)

            // Session management — STATELESS (JWT only)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Route authorization rules — matching the Node.js route definitions
            .authorizeHttpRequests(auth -> auth
                // ── Public routes ────────────────────────────────────────────
                .requestMatchers(
                    "/api/health",
                    "/api/auth/login",
                    "/api/auth/register",
                    "/api/auth/send-otp",
                    "/api/auth/verify-otp",
                    "/api/applications",
                    "/api/applications/**"
                ).permitAll()

                // ── All other routes require JWT ──────────────────────────────
                .anyRequest().authenticated()
            )

            // Add JWT filter before the default username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
