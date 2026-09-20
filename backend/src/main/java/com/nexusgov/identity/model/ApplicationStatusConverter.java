package com.nexusgov.identity.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA converter that maps the {@link ApplicationStatus} enum to the dashed
 * string values stored in the legacy MySQL `applications` table.
 */
@Converter(autoApply = true)
public class ApplicationStatusConverter implements AttributeConverter<ApplicationStatus, String> {

    @Override
    public String convertToDatabaseColumn(ApplicationStatus attribute) {
        return attribute == null ? null : attribute.getDbValue();
    }

    @Override
    public ApplicationStatus convertToEntityAttribute(String dbData) {
        return ApplicationStatus.parse(dbData);
    }
}