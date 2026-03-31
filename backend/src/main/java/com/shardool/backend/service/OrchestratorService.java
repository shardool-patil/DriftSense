package com.shardool.backend.service;

import com.shardool.backend.model.SensorLog;
import com.shardool.backend.repository.SensorLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class OrchestratorService {

    private final SensorLogRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Changed from localhost to 'inference' for the Docker network
    private final String ML_API_URL = "http://inference:8000/predict";

    public OrchestratorService(SensorLogRepository repository) {
        this.repository = repository;
    }

    public SensorLog processAndSaveSensorData(Double temperature, Double vibration) {
        Map<String, Double> requestPayload = new HashMap<>();
        requestPayload.put("temperature", temperature);
        requestPayload.put("vibration", vibration);

        // Standard Map is used here to catch arbitrary JSON fields from Python
        @SuppressWarnings("unchecked")
        Map<String, Object> mlResponse = restTemplate.postForObject(ML_API_URL, requestPayload, Map.class);

        Integer predictionClass = (Integer) mlResponse.get("prediction_class");
        String systemStatus = (String) mlResponse.get("system_status");

        SensorLog log = new SensorLog();
        log.setTemperature(temperature);
        log.setVibration(vibration);
        log.setPredictionClass(predictionClass);
        log.setSystemStatus(systemStatus);
        log.setRecordedAt(LocalDateTime.now());

        // --- XAI Extraction ---
        @SuppressWarnings("unchecked")
        Map<String, Object> explanationData = (Map<String, Object>) mlResponse.get("explanation");
        
        if (explanationData != null) {
            SensorLog.Explanation explanation = new SensorLog.Explanation();
            
            // Cast to Number first to safely handle both Integer (e.g., 50) and Double (e.g., 50.5) gracefully
            Number tempImpact = (Number) explanationData.get("temperature_impact");
            Number vibImpact = (Number) explanationData.get("vibration_impact");
            
            if (tempImpact != null) explanation.setTemperatureImpact(tempImpact.doubleValue());
            if (vibImpact != null) explanation.setVibrationImpact(vibImpact.doubleValue());
            
            log.setExplanation(explanation);
        }

        return repository.save(log);
    }
}