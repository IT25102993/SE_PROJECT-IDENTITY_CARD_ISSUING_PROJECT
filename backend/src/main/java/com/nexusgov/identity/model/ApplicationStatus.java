package com.nexusgov.identity.model;

/**
 * Application status values — mirrors the MySQL ENUM used by the Node.js server.
 * With dash-separated values stored in the database ("Verification-Passed",
 * "Documents-Required") that are not valid Java identifiers, each constant maps
 * to its canonical database string via {@link #getDbValue()}.
 */
public enum ApplicationStatus {
    Pending("Pending"),
    Approved("Approved"),
    Rejected("Rejected"),
    Processing("Processing"),
    Printed("Printed"),
    Issued("Issued"),
    Dispatched("Dispatched"),
    Verification_Passed("Verification-Passed"),
    Documents_Required("Documents-Required");

    private final String dbValue;

    ApplicationStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    /**
     * Resolve a status from a database/API string. Accepts both the canonical
     * dash-separated form ("Verification-Passed") and the Java form
     * ("Verification_Passed").
     */
    public static ApplicationStatus parse(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.replace('_', '-').toLowerCase();
        for (ApplicationStatus s : values()) {
            if (s.dbValue.toLowerCase().equals(normalized)) {
                return s;
            }
        }
        return null;
    }
}