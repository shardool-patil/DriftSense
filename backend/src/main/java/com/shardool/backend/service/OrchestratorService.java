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

        Map<String, Object> mlResponse = restTemplate.postForObject(ML_API_URL, requestPayload, Map.class);

        Integer predictionClass = (Integer) mlResponse.get("prediction_class");
        String systemStatus = (String) mlResponse.get("system_status");

        SensorLog log = new SensorLog();
        log.setTemperature(temperature);
        log.setVibration(vibration);
        log.setPredictionClass(predictionClass);
        log.setSystemStatus(systemStatus);
        log.setRecordedAt(LocalDateTime.now());

        return repository.save(log);
    }
}