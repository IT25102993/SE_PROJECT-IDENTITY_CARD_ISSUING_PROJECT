package com.nexusgov.identity.repository;

import com.nexusgov.identity.model.DispatchRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchRecordRepository extends JpaRepository<DispatchRecord, Long> {

    List<DispatchRecord> findAllByOrderByDispatchedAtDesc();
}