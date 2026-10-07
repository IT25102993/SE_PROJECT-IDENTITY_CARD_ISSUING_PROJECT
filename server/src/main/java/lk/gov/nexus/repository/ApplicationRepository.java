package lk.gov.nexus.repository;

import lk.gov.nexus.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findAllByOrderBySubmittedAtDesc();

    List<Application> findByApplicantId(Long applicantId);

    List<Application> findByApplicantIdIn(List<Long> applicantIds);

    @Query("SELECT a FROM Application a WHERE a.status IN :statuses ORDER BY a.updatedAt DESC")
    List<Application> findByStatusInOrderByUpdatedAtDesc(@Param("statuses") List<String> statuses);

    long countByStatus(String status);
}
