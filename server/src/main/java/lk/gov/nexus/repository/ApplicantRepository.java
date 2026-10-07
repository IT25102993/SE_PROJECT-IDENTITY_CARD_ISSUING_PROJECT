package lk.gov.nexus.repository;

import lk.gov.nexus.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Optional<Applicant> findByNationalIdNumber(String nationalIdNumber);
    List<Applicant> findByEmail(String email);
}
