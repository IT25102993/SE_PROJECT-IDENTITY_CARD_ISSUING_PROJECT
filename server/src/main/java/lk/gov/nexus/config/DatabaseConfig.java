package lk.gov.nexus.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;

@Configuration
public class DatabaseConfig {

    @Value("${app.datasource.mysql.url}")
    private String mysqlUrl;

    @Value("${app.datasource.mysql.username}")
    private String mysqlUsername;

    @Value("${app.datasource.mysql.password}")
    private String mysqlPassword;

    @Value("${app.datasource.h2.url}")
    private String h2Url;

    @Value("${app.datasource.h2.username}")
    private String h2Username;

    @Value("${app.datasource.h2.password}")
    private String h2Password;

    private static boolean isMySqlConnected = false;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Attempt MySQL connection first
        try {
            System.out.println("Checking MySQL connection at " + mysqlUrl + " ...");
            try (Connection conn = DriverManager.getConnection(mysqlUrl, mysqlUsername, mysqlPassword)) {
                if (conn.isValid(2)) {
                    isMySqlConnected = true;
                    System.out.println(" Connected to MySQL Database successfully!");
                    HikariDataSource ds = new HikariDataSource();
                    ds.setJdbcUrl(mysqlUrl);
                    ds.setUsername(mysqlUsername);
                    ds.setPassword(mysqlPassword);
                    ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
                    ds.setMaximumPoolSize(15);
                    ds.setConnectionTimeout(5000);
                    return ds;
                }
            }
        } catch (Exception e) {
            System.out.println("MySQL Connection Note: " + e.getMessage());
        }

        // Fallback to In-Memory H2 Database
        isMySqlConnected = false;
        System.out.println(" Operating in Full-Stack Hybrid Mode (In-Memory Database Ready).");
        HikariDataSource h2Ds = new HikariDataSource();
        h2Ds.setJdbcUrl(h2Url);
        h2Ds.setUsername(h2Username);
        h2Ds.setPassword(h2Password);
        h2Ds.setDriverClassName("org.h2.Driver");
        return h2Ds;
    }

    public static boolean isMySqlActive() {
        return isMySqlConnected;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
