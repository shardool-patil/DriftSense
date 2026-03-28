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
    private final String RETRAIN_API_URL = "http://localhost:8000/retrain";

    public DriftMonitorService(SensorLogRepository repository) {
        this.repository = repository;
    }

    // This tells Spring Boot to run this exact method every 30,000 milliseconds (30 seconds)
    @Scheduled(fixedRate = 30000)
    public void monitorConceptDrift() {
        System.out.println("🔍 [Drift Monitor] Waking up to check system health...");

        // 1. Get all logs from the last 2 minutes
        LocalDateTime twoMinutesAgo = LocalDateTime.now().minusMinutes(2);
        List<SensorLog> recentLogs = repository.findByRecordedAtAfter(twoMinutesAgo);

        // Don't calculate drift if we don't have enough data points yet
        if (recentLogs.size() < 5) {
            System.out.println("   -> Not enough recent data (" + recentLogs.size() + " logs). Sleeping.");
            return;
        }

        // 2. Calculate the Failure Rate
        long failureCount = recentLogs.stream()
                .filter(log -> log.getPredictionClass() == 1)
                .count();

        double failureRate = (double) failureCount / recentLogs.size();
        System.out.printf("   -> Current Failure Rate: %.2f%%\n", failureRate * 100);

        // 3. The Drift Threshold Trigger
        // If the failure rate spikes over 60%, the environment has drifted!
        if (failureRate > 0.60) {
            System.out.println("🚨 [Drift Monitor] STATISTICAL ANOMALY DETECTED! Triggering Self-Healing...");
            try {
                // Ping the Python API to swap the model
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