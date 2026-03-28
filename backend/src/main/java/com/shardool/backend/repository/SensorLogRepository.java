package com.shardool.backend.repository;

import com.shardool.backend.model.SensorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SensorLogRepository extends JpaRepository<SensorLog, Long> {
    
    // Spring magically translates this method name into a "SELECT * WHERE recorded_at > ?" query
    List<SensorLog> findByRecordedAtAfter(LocalDateTime time);
    
}