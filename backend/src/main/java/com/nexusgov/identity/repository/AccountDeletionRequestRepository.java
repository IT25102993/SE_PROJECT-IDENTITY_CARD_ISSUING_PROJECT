package com.nexusgov.identity.repository;

import com.nexusgov.identity.model.AccountDeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountDeletionRequestRepository extends JpaRepository<AccountDeletionRequest, Long> {

    List<AccountDeletionRequest> findAllByOrderByRequestedAtDesc();
}