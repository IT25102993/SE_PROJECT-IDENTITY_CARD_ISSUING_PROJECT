package lk.gov.nexus.repository;

import lk.gov.nexus.entity.AccountDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {
    Optional<AccountDeletionRequest> findFirstByUserIdAndStatusOrderByRequestedAtDesc(Long userId, String status);
    Optional<AccountDeletionRequest> findFirstByEmailAndStatusOrderByRequestedAtDesc(String email, String status);
    List<AccountDeletionRequest> findAllByOrderByRequestedAtDesc();
}
