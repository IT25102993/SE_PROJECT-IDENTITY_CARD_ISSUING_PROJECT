package lk.gov.nexus.repository;

import lk.gov.nexus.entity.DispatchRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispatchRecordRepository extends JpaRepository<DispatchRecord, Long> {
    List<DispatchRecord> findAllByOrderByDispatchedAtDesc();
    Optional<DispatchRecord> findTopByApplicationIdOrderByDispatchedAtDesc(Long applicationId);
}
