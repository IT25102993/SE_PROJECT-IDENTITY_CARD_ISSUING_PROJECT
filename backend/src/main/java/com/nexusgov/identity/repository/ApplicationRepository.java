package com.nexusgov.identity.repository;

import com.nexusgov.identity.model.Application;
import com.nexusgov.identity.model.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    /**
     * Search applications by applicant's NIC or tracking ID (NEX-2026-{id}).
     * The JPQL CONCAT mirrors the SQL used in the Node.js applicationController.
     */
    @Query("""
        SELECT app FROM Application app
        JOIN app.applicant a
        WHERE a.nationalIdNumber LIKE %:search%
           OR CONCAT('NEX-2026-', app.applicationId) = :search
           OR CAST(app.applicationId AS string) = :search
        ORDER BY app.submittedAt DESC
    """)
    List<Application> searchApplications(@Param("search") String search);

    List<Application> findAllByOrderBySubmittedAtDesc();

    List<Application> findByStatusInOrderByUpdatedAtDesc(Collection<ApplicationStatus> statuses);

    long countByStatus(ApplicationStatus status);

    long countByBotVerifiedTrue();
}