package com.nexusgov.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Base64;

/**
 * Document storage service — Java port of documentStorage.js.
 * Saves base64-encoded documents to the local /uploads/documents directory and
 * serves them back as public /uploads/documents/* URLs.
 */
@Service
public class DocumentStorageService {

    private static final Logger log = LoggerFactory.getLogger(DocumentStorageService.class);

    private static final String UPLOAD_DIR = "uploads/documents";
    private static final String DATA_URL_PATTERN = "data:";

    /**
     * Save a base64 data-URL document to disk.
     *
     * @param fileData base64 data URL (e.g. "data:application/pdf;base64,JVBERi0x...")
     * @param fileName original file name used for the extension
     * @return a public URL like "/uploads/documents/1712345678901_birth_certificate.pdf",
     *         or null if the data could not be decoded/written
     */
    public String saveDocumentFile(String fileData, String fileName) {
        if (fileData == null || fileData.isBlank()) {
            return null;
        }

        String base64Data = fileData;
        if (base64Data.startsWith(DATA_URL_PATTERN)) {
            int commaIndex = base64Data.indexOf(',');
            if (commaIndex >= 0) {
                base64Data = base64Data.substring(commaIndex + 1);
            }
        }

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64Data.trim());
        } catch (IllegalArgumentException e) {
            // Fall back to treating the payload as plain text bytes
            bytes = base64Data.getBytes(StandardCharsets.UTF_8);
        }

        String sanitizedName = sanitizeFileName(fileName != null ? fileName : "document.bin");
        String storedName = System.currentTimeMillis() + "_" + sanitizedName;

        try {
            Path dir = Paths.get(UPLOAD_DIR).toAbsolutePath();
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            Files.write(target, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            return "/uploads/documents/" + storedName;
        } catch (IOException e) {
            log.error("Failed to save document file: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Read a previously saved document file (public path like "/uploads/documents/xxx.pdf").
     *
     * @param publicPath the absolute public path returned by {@link #saveDocumentFile}
     * @return the file bytes, or null if not found
     */
    public byte[] readPublicFile(String publicPath) {
        if (publicPath == null || publicPath.isBlank()) {
            return null;
        }

        String relative = publicPath;
        if (relative.startsWith("/uploads/")) {
            relative = relative.substring("/uploads/".length());
        }

        Path file = Paths.get(UPLOAD_DIR).toAbsolutePath().resolve(relative);
        if (!Files.exists(file)) {
            return null;
        }
        try {
            return Files.readAllBytes(file);
        } catch (IOException e) {
            log.error("Failed to read document file: {}", e.getMessage());
            return null;
        }
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            return "document.bin";
        }
        String cleaned = Paths.get(fileName).getFileName().toString().replaceAll("[^A-Za-z0-9._\\-]", "_");
        if (cleaned.isBlank()) {
            cleaned = "document.bin";
        }
        return cleaned;
    }
}