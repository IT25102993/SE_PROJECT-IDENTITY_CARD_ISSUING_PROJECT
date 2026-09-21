package com.nexusgov.identity.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexusgov.identity.repository.ApplicantRepository;
import com.nexusgov.identity.repository.ApplicationRepository;
import com.nexusgov.identity.repository.AuditLogRepository;
import com.nexusgov.identity.repository.DispatchRecordRepository;
import com.nexusgov.identity.repository.DocumentRepository;
import com.nexusgov.identity.repository.IdentityCardRepository;
import com.nexusgov.identity.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Time;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Database Backup Service.
 *
 * <p>On every system start this runner:
 * <ol>
 *   <li>If {@code backup/database_backup.json} (Java format) exists, it is imported
 *       back into MySQL — every table is truncated and re-populated from the file.</li>
 *   <li>Otherwise, if the database is empty, the original NexusGov demo data is seeded.</li>
 *   <li>The full current database is then exported back to {@code backup/database_backup.json},
 *       so the backup file always holds the latest database contents.</li>
 * </ol>
 *
 * <p>Satisfies: "save all the database details into a backup file, and when running,
 * import that database every time the system runs."
 */
@Component
public class DatabaseBackupService implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseBackupService.class);

    private static final String BACKUP_FILE_NAME = "database_backup.json";
    private static final String FORMAT_MARKER = "nexusgov-java-backup";

    private final DataSource dataSource;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final SeedService seedService;

    public DatabaseBackupService(DataSource dataSource,
                                 ObjectMapper objectMapper,
                                 PasswordEncoder passwordEncoder,
                                 UserRepository userRepository,
                                 ApplicantRepository applicantRepository,
                                 ApplicationRepository applicationRepository,
                                 DocumentRepository documentRepository,
                                 IdentityCardRepository identityCardRepository,
                                 DispatchRecordRepository dispatchRecordRepository,
                                 AuditLogRepository auditLogRepository) {
        this.dataSource = dataSource;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.seedService = new SeedService(passwordEncoder, userRepository, applicantRepository,
            applicationRepository, documentRepository, identityCardRepository,
            dispatchRecordRepository, auditLogRepository);
    }

    // ── Runner ─────────────────────────────────────────────────────────────────

    @Override
    public void run(String... args) throws Exception {
        if (!isMySql()) {
            log.info("Database Backup Service skipped — active database '{}' is not MySQL. "
                + "Backup/restore only runs against MySQL.",
                databaseProductName());
            return;
        }
        Path backupFile = resolveBackupFile();
        log.info("==========================================================");
        log.info("Database Backup Service");
        log.info("Backup file: {}", backupFile.toAbsolutePath());
        log.info("==========================================================");

        boolean restored = false;

        if (Files.exists(backupFile) && backupFile.toFile().length() > 0) {
            try {
                Map<String, Object> payload = objectMapper.readValue(backupFile.toFile(), Map.class);
                if (isJavaBackup(payload)) {
                    int values = restore(payload);
                    restored = true;
                    log.info("Backup imported successfully ({} values across {} tables).",
                        values, tableMap(payload).size());
                } else {
                    log.warn("Existing backup uses the legacy Node.js format — it will be overwritten "
                        + "with the Java backup format.");
                }
            } catch (Exception e) {
                log.error("Failed to import backup ({}). Keeping the current database.", e.getMessage());
            }
        }

        if (!restored) {
            long userCount = userRepository.count();
            if (userCount == 0) {
                log.info("Database is empty — seeding baseline NexusGov demo data...");
                seedService.seedBaseline();
                log.info("Baseline seed complete.");
            } else {
                log.info("Database already contains {} users — skipping seed.", userCount);
            }
        }

        int values = export(backupFile.toFile());
        log.info("Database snapshot saved -> {} ({} values, {} tables).",
            backupFile.toAbsolutePath(), values, countTables());
    }

    // ── Backup file location ───────────────────────────────────────────────────

    private boolean isMySql() throws SQLException {
        String product = databaseProductName();
        return product != null && product.toLowerCase().contains("mysql");
    }

    private String databaseProductName() throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            return conn.getMetaData().getDatabaseProductName();
        }
    }

    /**
     * Looks for the backup file in {@code <cwd>/backup} first, then in
     * {@code <parent>/backup} (when the server runs from the {@code backend/} folder).
     * Returns the first existing file, otherwise the {@code <cwd>/backup} path.
     */
    static Path resolveBackupFile() {
        Path cwd = Paths.get("").toAbsolutePath().normalize();
        List<Path> candidates = new ArrayList<>();
        candidates.add(cwd.resolve("backup").resolve(BACKUP_FILE_NAME));
        if (cwd.getParent() != null) {
            candidates.add(cwd.getParent().resolve("backup").resolve(BACKUP_FILE_NAME));
        }
        for (Path p : candidates) {
            if (Files.exists(p)) return p;
        }
        return candidates.get(0);
    }

    private static boolean isJavaBackup(Map<String, Object> payload) {
        return FORMAT_MARKER.equals(payload.get("generated_by"))
            && payload.get("tables") instanceof Map<?, ?>;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> tableMap(Map<String, Object> payload) {
        return (Map<String, Object>) payload.get("tables");
    }

    private int countTables() throws SQLException {
        try (Connection conn = dataSource.getConnection();
             ResultSet rs = conn.getMetaData().getTables(conn.getCatalog(), null, "%", new String[]{"TABLE"})) {
            int n = 0;
            while (rs.next()) n++;
            return n;
        }
    }

    // ── Export (full dump) ─────────────────────────────────────────────────────

    private int export(File target) throws Exception {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("database", currentDatabase());
        payload.put("generated_by", FORMAT_MARKER);
        payload.put("generated_at", java.time.LocalDateTime.now().toString());

        Map<String, Object> tables = new LinkedHashMap<>();
        int totalValues = 0;

        try (Connection conn = dataSource.getConnection()) {
            List<String> tableNames = listTables(conn);
            for (String table : tableNames) {
                Map<String, Object> tableData = exportTable(conn, table);
                tables.put(table, tableData);
                int columnCount = ((List<?>) tableData.get("types")).size();
                totalValues += columnCount * ((List<?>) tableData.get("rows")).size();
            }
        }

        payload.put("tables", tables);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(target, payload);
        return totalValues;
    }

    private String currentDatabase() throws SQLException {
        try (Connection conn = dataSource.getConnection()) {
            return conn.getCatalog();
        }
    }

    private List<String> listTables(Connection conn) throws SQLException {
        List<String> names = new ArrayList<>();
        try (ResultSet rs = conn.getMetaData().getTables(conn.getCatalog(), null, "%", new String[]{"TABLE"})) {
            while (rs.next()) {
                String t = rs.getString("TABLE_NAME");
                if (t.equalsIgnoreCase("flyway_schema_history") || t.startsWith("qrtz_")) continue;
                names.add(t);
            }
        }
        Collections.sort(names);
        return names;
    }

    private Map<String, Object> exportTable(Connection conn, String table) throws SQLException {
        List<String> columns = new ArrayList<>();
        List<Integer> types = new ArrayList<>();

        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.COLUMNS "
                    + "WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION")) {
            ps.setString(1, conn.getCatalog());
            ps.setString(2, table);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    columns.add(rs.getString("COLUMN_NAME"));
                    types.add(sqlTypeFor(rs.getString("DATA_TYPE")));
                }
            }
        }

        List<List<Object>> rows = new ArrayList<>();
        String quoted = String.join(",", columns.stream().map(c -> "`" + c + "`").toList());
        try (Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery("SELECT " + quoted + " FROM `" + table + "`")) {
            while (rs.next()) {
                List<Object> row = new ArrayList<>(columns.size());
                for (String col : columns) {
                    row.add(convertValue(rs.getObject(col)));
                }
                rows.add(row);
            }
        }

        Map<String, Object> tableData = new LinkedHashMap<>();
        tableData.put("columns", columns);
        tableData.put("types", types);
        tableData.put("rows", rows);
        return tableData;
    }

    /** MySQL data type name → JDBC type code. */
    private static int sqlTypeFor(String mysqlType) {
        String t = mysqlType == null ? "" : mysqlType.toLowerCase();
        if (t.contains("tinyint")) return Types.TINYINT;
        if (t.contains("smallint")) return Types.SMALLINT;
        if (t.contains("bigint")) return Types.BIGINT;
        if (t.contains("int")) return Types.INTEGER;
        if (t.contains("decimal") || t.contains("numeric")) return Types.DECIMAL;
        if (t.contains("float")) return Types.FLOAT;
        if (t.contains("double") || t.contains("real")) return Types.DOUBLE;
        if (t.contains("datetime") || t.contains("timestamp")) return Types.TIMESTAMP;
        if (t.equals("date")) return Types.DATE;
        if (t.equals("time")) return Types.TIME;
        if (t.contains("blob") || t.contains("binary") || t.contains("varbinary")) return Types.BLOB;
        if (t.contains("enum") || t.contains("set") || t.contains("char")
            || t.contains("text") || t.contains("json")) return Types.LONGVARCHAR;
        return Types.OTHER;
    }

    /** Normalize a raw JDBC value into a JSON-friendly type. */
    private static Object convertValue(Object v) {
        if (v == null) return null;
        if (v instanceof Boolean) return v;
        if (v instanceof Number) return v;
        if (v instanceof byte[] bytes) return Base64.getEncoder().encodeToString(bytes);
        if (v instanceof Timestamp ts) {
            return ts.toLocalDateTime()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }
        if (v instanceof java.time.LocalDateTime ldt) {
            return ldt.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }
        if (v instanceof Date d) return d.toLocalDate().toString();
        if (v instanceof java.time.LocalDate d) return d.toString();
        if (v instanceof Time t) return t.toLocalTime().toString();
        if (v instanceof java.time.LocalTime t) return t.toString();
        return v.toString();
    }

    // ── Restore (import) ───────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private int restore(Map<String, Object> payload) throws Exception {
        Map<String, Object> tables = tableMap(payload);
        int totalValues = 0;

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try (Statement st = conn.createStatement()) {
                st.execute("SET FOREIGN_KEY_CHECKS=0");
                for (String table : tables.keySet()) {
                    try {
                        st.execute("TRUNCATE TABLE `" + table + "`");
                    } catch (SQLException ignore) {
                        // Table may no longer exist in the live schema — skip it.
                    }
                }
            }

            for (Map.Entry<String, Object> e : tables.entrySet()) {
                String table = e.getKey();
                Map<String, Object> tableData = (Map<String, Object>) e.getValue();
                List<String> columns = (List<String>) tableData.get("columns");
                List<Number> types = (List<Number>) tableData.get("types");
                List<List<Object>> rows = (List<List<Object>>) tableData.get("rows");
                if (columns == null || columns.isEmpty() || rows == null || rows.isEmpty()) continue;

                String colSql = String.join(",", columns.stream().map(c -> "`" + c + "`").toList());
                String placeholders = String.join(",", Collections.nCopies(columns.size(), "?"));
                String sql = "INSERT INTO `" + table + "` (" + colSql + ") VALUES (" + placeholders + ")";

                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    for (List<Object> row : rows) {
                        for (int i = 0; i < columns.size(); i++) {
                            Object value = (i < row.size()) ? row.get(i) : null;
                            int jdbcType = (types != null && i < types.size())
                                ? types.get(i).intValue() : Types.OTHER;
                            setValue(ps, i + 1, value, jdbcType);
                        }
                        ps.addBatch();
                        totalValues += columns.size();
                    }
                    ps.executeBatch();
                }
            }

            conn.commit();
        }
        return totalValues;
    }

    private static void setValue(PreparedStatement ps, int idx, Object value, int sqlType) throws SQLException {
        if (value == null) {
            ps.setNull(idx, sqlType);
            return;
        }
        if (value instanceof Boolean || value instanceof Number) {
            ps.setObject(idx, value);
            return;
        }
        String s = value.toString();
        switch (sqlType) {
            case Types.TIMESTAMP -> ps.setTimestamp(idx, Timestamp.valueOf(s));
            case Types.DATE -> ps.setDate(idx, Date.valueOf(s));
            case Types.TIME -> ps.setTime(idx, Time.valueOf(s));
            case Types.BINARY, Types.VARBINARY, Types.LONGVARBINARY, Types.BLOB ->
                ps.setBytes(idx, Base64.getDecoder().decode(s));
            default -> ps.setObject(idx, s);
        }
    }
}