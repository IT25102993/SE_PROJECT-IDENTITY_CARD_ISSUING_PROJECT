package lk.gov.nexus.util;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Base64;

public class DocumentStorageUtil {

    private static final Path UPLOAD_DIR = Paths.get("uploads", "documents").toAbsolutePath().normalize();

    public static void ensureUploadDir() {
        try {
            if (!Files.exists(UPLOAD_DIR)) {
                Files.createDirectories(UPLOAD_DIR);
            }
        } catch (Exception e) {
            System.err.println("Failed to create upload dir: " + e.getMessage());
        }
    }

    public static Path getUploadDir() {
        ensureUploadDir();
        return UPLOAD_DIR;
    }

    /**
     * Save base64 data URL or raw base64 to disk
     */
    public static String saveDocumentFile(String dataUrl, String originalName) {
        ensureUploadDir();

        if (dataUrl == null || dataUrl.trim().isEmpty()) {
            return null;
        }

        if (dataUrl.startsWith("/uploads/")) {
            return dataUrl;
        }

        try {
            String sanitized = (originalName != null ? originalName : "document.pdf")
                    .replaceAll("[^a-zA-Z0-9.-]", "_");
            String filename = System.currentTimeMillis() + "_" + sanitized;
            Path targetFile = UPLOAD_DIR.resolve(filename);

            byte[] buffer = null;
            if (dataUrl.startsWith("data:")) {
                int commaIndex = dataUrl.indexOf(',');
                if (commaIndex != -1) {
                    String base64Data = dataUrl.substring(commaIndex + 1);
                    buffer = Base64.getDecoder().decode(base64Data.trim());
                }
            } else if (dataUrl.length() > 200) {
                try {
                    buffer = Base64.getDecoder().decode(dataUrl.trim());
                } catch (Exception ignored) {}
            }

            if (buffer != null) {
                Files.write(targetFile, buffer);
                return "/uploads/documents/" + filename;
            }

            return dataUrl;
        } catch (Exception e) {
            System.err.println("Error saving document to disk: " + e.getMessage());
            return dataUrl;
        }
    }

    /**
     * Initializes sample documents from project root if present
     */
    public static void initSampleDocuments() {
        ensureUploadDir();
        try {
            Path targetCert = UPLOAD_DIR.resolve("birth_certificate.pdf");
            Path targetCertAlt = UPLOAD_DIR.resolve("birthcerificate.pdf");
            Path targetGrama = UPLOAD_DIR.resolve("sample_grama_cert.jpg");

            Path[] possibleSources = new Path[]{
                    Paths.get("../birthcerificate.pdf").toAbsolutePath().normalize(),
                    Paths.get("../birth_certificate.pdf").toAbsolutePath().normalize(),
                    Paths.get("birthcerificate.pdf").toAbsolutePath().normalize(),
                    Paths.get("birth_certificate.pdf").toAbsolutePath().normalize()
            };

            boolean copied = false;
            for (Path src : possibleSources) {
                if (Files.exists(src) && Files.size(src) > 1000) {
                    Files.copy(src, targetCert, StandardCopyOption.REPLACE_EXISTING);
                    Files.copy(src, targetCertAlt, StandardCopyOption.REPLACE_EXISTING);
                    copied = true;
                    break;
                }
            }

            if (!copied && !Files.exists(targetCert)) {
                String minimalPdf = "%PDF-1.4\n" +
                        "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
                        "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
                        "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n" +
                        "4 0 obj << /Length 55 >> stream\n" +
                        "BT /F1 24 Tf 100 700 Td (NexusGov Official Birth Certificate Verification) Tj ET\n" +
                        "endstream endobj\n" +
                        "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n" +
                        "xref\n" +
                        "0 6\n" +
                        "0000000000 65535 f \n" +
                        "0000000009 00000 n \n" +
                        "0000000058 00000 n \n" +
                        "0000000115 00000 n \n" +
                        "0000000244 00000 n \n" +
                        "0000000350 00000 n \n" +
                        "trailer << /Size 6 /Root 1 0 R >>\n" +
                        "startxref\n" +
                        "427\n" +
                        "%%EOF";
                Files.writeString(targetCert, minimalPdf);
            }

            if (!Files.exists(targetGrama)) {
                byte[] dummyJpg = Base64.getDecoder().decode(
                        "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
                );
                Files.write(targetGrama, dummyJpg);
            }
        } catch (Exception e) {
            System.err.println("Sample documents init warning: " + e.getMessage());
        }
    }
}
