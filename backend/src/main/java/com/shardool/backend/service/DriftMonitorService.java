package com.shardool.backend.service;

import com.shardool.backend.model.SensorLog;
import com.shardool.backend.repository.SensorLogRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DriftMonitorService {

    private final SensorLogRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Changed from localhost to 'inference' for the Docker network
    private final String RETRAIN_API_URL = "http://inference:8000/retrain";

    public DriftMonitorService(SensorLogRepository repository) {
        this.repository = repository;
    }

    @Scheduled(fixedRate = 30000)
    public void monitorConceptDrift() {
        System.out.println("🔍 [Drift Monitor] Waking up to check system health...");

        LocalDateTime twoMinutesAgo = LocalDateTime.now().minusMinutes(2);
        List<SensorLog> recentLogs = repository.findByRecordedAtAfter(twoMinutesAgo);

        if (recentLogs.size() < 5) {
            System.out.println("   -> Not enough recent data (" + recentLogs.size() + " logs). Sleeping.");
            return;
        }

        long failureCount = recentLogs.stream()
                .filter(log -> log.getPredictionClass() == 1)
                .count();

        double failureRate = (double) failureCount / recentLogs.size();
        System.out.printf("   -> Current Failure Rate: %.2f%%\n", failureRate * 100);

        if (failureRate > 0.60) {
            System.out.println("🚨 [Drift Monitor] STATISTICAL ANOMALY DETECTED! Triggering Self-Healing...");
            try {
                restTemplate.postForEntity(RETRAIN_API_URL, null, String.class);
                System.out.println("✅ [Drift Monitor] Command sent. Model successfully retrained.");
            } catch (Exception e) {
                System.out.println("❌ [Drift Monitor] Failed to contact ML engine: " + e.getMessage());
            }
        } else {
            System.out.println("   -> System is stable. Going back to sleep.");
        }
    }
}