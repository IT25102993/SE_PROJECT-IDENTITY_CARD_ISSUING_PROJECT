package com.nexusgov.identity.config;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Properties;

/**
 * Creates the {@code identity_card_system} database before Spring Boot boots, so a
 * fresh machine never fails with "Unknown database". Mirrors the
 * {@code CREATE DATABASE IF NOT EXISTS} step performed by the Node.js server.
 */
public final class DatabaseBootstrap {

    private static final String[] PROPERTY_FILES = { "application.properties", "application.yml", "application.yaml" };
    private static final String DEFAULT_DB_NAME = "identity_card_system";

    private DatabaseBootstrap() {}

    /** Called from {@code main()} before {@code SpringApplication.run()}. */
    public static void createDatabaseIfMissing() {
        try {
            Properties props = loadProperties();

            String url = props.getProperty("spring.datasource.url");
            if (url == null) {
                // No DataSource configured — nothing to create.
                return;
            }

            String username = props.getProperty("spring.datasource.username", "root");
            String password = props.getProperty("spring.datasource.password", "");
            String dbName = extractDatabaseName(url);
            String serverUrl = stripDatabase(url);

            try (Connection conn = DriverManager.getConnection(serverUrl, username, password);
                 Statement st = conn.createStatement()) {
                st.executeUpdate("CREATE DATABASE IF NOT EXISTS `" + dbName
                    + "` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                System.out.println("[NexusGov] MySQL database '" + dbName + "' is ready.");
            }
        } catch (Exception e) {
            System.err.println("[NexusGov] Could not connect to MySQL to create/verify the database.");
            System.err.println("[NexusGov] Please make sure MySQL is running on localhost:3306 and that");
            System.err.println("[NexusGov] the root account with an empty password is accessible.");
            System.err.println("[NexusGov] " + e.getMessage());
            throw new IllegalStateException("MySQL database unavailable: " + e.getMessage(), e);
        }
    }

    private static Properties loadProperties() throws Exception {
        ClassLoader cl = Thread.currentThread().getContextClassLoader();
        for (String name : PROPERTY_FILES) {
            try (InputStream in = cl.getResourceAsStream(name)) {
                if (in != null) {
                    Properties p = new Properties();
                    p.load(in);
                    return p;
                }
            }
        }
        throw new IllegalStateException("Cannot find application.properties on the classpath.");
    }

    /** Returns the database name portion of a JDBC URL. */
    static String extractDatabaseName(String url) {
        int idx = url.indexOf("://");
        if (idx < 0) return DEFAULT_DB_NAME;
        String after = url.substring(idx + 3);
        int slash = after.indexOf('/');
        if (slash < 0) return DEFAULT_DB_NAME;
        int end = after.indexOf('?', slash);
        String db = (end < 0) ? after.substring(slash + 1) : after.substring(slash + 1, end);
        return db.isEmpty() ? DEFAULT_DB_NAME : db;
    }

    /** Returns the JDBC URL with the database segment removed (server-level URL). */
    static String stripDatabase(String url) {
        int idx = url.indexOf("://");
        if (idx < 0) return url;
        String after = url.substring(idx + 3);
        int slash = after.indexOf('/');
        if (slash < 0) return url;
        int end = after.indexOf('?', slash);
        String tail = (end < 0) ? "" : after.substring(end);
        return url.substring(0, idx + 3) + after.substring(0, slash + 1) + tail;
    }
}