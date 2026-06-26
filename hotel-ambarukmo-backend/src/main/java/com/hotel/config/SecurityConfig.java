package com.hotel.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.hotel.security.JwtAuthenticationFilter;

/**
 * FIX [C3] & [C8]:
 * - CORS dikonfigurasi DI SINI saja (tidak lagi di CorsConfig.java yang terpisah).
 *   Konfigurasi di dua tempat menyebabkan konflik — Spring Security menang atas MVC CORS.
 * - allowedOrigins() dikonfigurasi via environment variable agar fleksibel.
 * - allowCredentials(true) dipasangkan dengan allowedOrigins yang spesifik (bukan wildcard "*").
 *
 * FIX [M5]: Ditambahkan exceptionHandling() untuk mengembalikan JSON 401/403
 *           bukan halaman HTML default Spring Security.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // FIX [M5]: Return proper JSON untuk 401/403 bukan default Spring HTML
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(401);
                    response.getWriter().write(
                        "{\"status\":\"error\",\"message\":\"Unauthorized: " + authException.getMessage() + "\",\"data\":null}"
                    );
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setContentType("application/json;charset=UTF-8");
                    response.setStatus(403);
                    response.getWriter().write(
                        "{\"status\":\"error\",\"message\":\"Forbidden: Anda tidak memiliki akses ke resource ini.\",\"data\":null}"
                    );
                })
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/register",
                        "/api/auth/refresh", "/api/auth/forgot-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/rooms", "/api/rooms/available", "/api/rooms/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/settings/hotel").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/rooms/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/rooms/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PATCH, "/api/rooms/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.DELETE, "/api/rooms/**").hasRole("ADMIN")
                .requestMatchers("/api/staff/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/**", "/api/financials/**").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.GET, "/api/reservations/my").hasRole("GUEST")
                .requestMatchers(HttpMethod.GET, "/api/reservations/*").hasAnyRole("ADMIN", "STAFF", "GUEST")
                .requestMatchers(HttpMethod.DELETE, "/api/reservations/*").hasAnyRole("ADMIN", "STAFF", "GUEST")
                .requestMatchers(HttpMethod.PUT, "/api/settings/preferences").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/settings/hotel").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/settings/preferences").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.POST, "/api/reservations").hasAnyRole("ADMIN", "STAFF", "GUEST")
                .requestMatchers(HttpMethod.GET, "/api/reservations").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PATCH, "/api/reservations/*/checkin",
                        "/api/reservations/*/checkout").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers(HttpMethod.PUT, "/api/reservations/*").hasAnyRole("ADMIN", "STAFF")
                .requestMatchers("/api/auth/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * FIX [C3] & [C8]: CORS konfigurasi dipusatkan di sini.
     * Ganti ALLOWED_ORIGINS dengan URL frontend production Anda.
     * Untuk development, gunakan environment variable FRONTEND_URL.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Ambil dari env atau default ke localhost untuk development
        String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:5500");
        // Support multiple origins jika diperlukan (pisah dengan koma di env)
        List<String> allowedOrigins = List.of(
            "http://localhost:5500",   // Live Server VS Code
            "http://127.0.0.1:5500",
            "http://localhost:3000",
            frontendUrl
        );

        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false); // set true jika pakai cookie-based auth

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}