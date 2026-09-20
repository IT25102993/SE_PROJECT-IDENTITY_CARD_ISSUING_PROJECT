package com.nexusgov.identity.repository;

import com.nexusgov.identity.model.AccountDeletionRequest;
import com.nexusgov.identity.model.AccountDeletionRequest.DeletionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {

    List<AccountDeletionRequest> findAllByOrderByRequestedAtDesc();

    /**
     * Latest deletion request by user id OR email (matches the Node.js lookup which
     * uses {@code WHERE (user_id = ? OR email = ?) AND status = 'Pending'}).
     */
    @Query("""
        SELECT r FROM AccountDeletionRequest r
        WHERE (r.userId = :userId OR r.email = :email) AND r.status = :status
        ORDER BY r.requestedAt DESC
    """)
    Optional<AccountDeletionRequest> findPendingRequest(@Param("userId") Long userId,
                                                        @Param("email") String email,
                                                        @Param("status") DeletionStatus status);
}