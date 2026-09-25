package lk.gov.nexus.repository;

import lk.gov.nexus.entity.IdentityCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IdentityCardRepository extends JpaRepository<IdentityCard, Long> {
    Optional<IdentityCard> findByApplicationId(Long applicationId);
    Optional<IdentityCard> findByCardNumber(String cardNumber);
}
