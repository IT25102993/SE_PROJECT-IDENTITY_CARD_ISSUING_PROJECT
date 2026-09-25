package lk.gov.nexus.repository;

import lk.gov.nexus.entity.Verification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRepository extends JpaRepository<Verification, Long> {
    List<Verification> findByApplicationIdOrderByVerificationIdDesc(Long applicationId);
    Optional<Verification> findFirstByApplicationIdOrderByVerificationIdDesc(Long applicationId);
    long countByPassed(Integer passed);
}
