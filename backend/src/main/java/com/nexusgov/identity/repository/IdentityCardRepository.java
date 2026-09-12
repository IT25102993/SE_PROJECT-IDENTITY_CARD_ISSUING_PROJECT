package com.nexusgov.identity.repository;

import com.nexusgov.identity.model.IdentityCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IdentityCardRepository extends JpaRepository<IdentityCard, Long> {

    Optional<IdentityCard> findByApplication_ApplicationId(Long applicationId);
}
