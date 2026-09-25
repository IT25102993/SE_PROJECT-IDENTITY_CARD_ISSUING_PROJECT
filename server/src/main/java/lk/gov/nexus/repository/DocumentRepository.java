package lk.gov.nexus.repository;

import lk.gov.nexus.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByApplicationIdOrderByUploadedAtAsc(Long applicationId);
    List<Document> findByApplicationIdInOrderByUploadedAtAsc(List<Long> applicationIds);
    List<Document> findAllByOrderByUploadedAtDesc();
}
