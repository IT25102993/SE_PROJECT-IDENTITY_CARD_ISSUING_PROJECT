package com.nexusgov.identity.repository;

import com.nexusgov.identity.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findAllByApplication_ApplicationId(Long applicationId);

    List<Document> findAllByApplication_ApplicationIdInOrderByUploadedAtAsc(Collection<Long> applicationIds);
}