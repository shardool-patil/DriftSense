package com.shardool.backend.service;

import com.shardool.backend.model.SensorLog;
import com.shardool.backend.repository.SensorLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Service
public class OrchestratorService {

    private final SensorLogRepository repository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    // This points directly to your Python FastAPI engine
    private final String INFERENCE_API_URL = "http://localhost:8000/predict";

    public OrchestratorService(SensorLogRepository repository) {
        this.repository = repository;
    }

    public SensorLog processAndSaveSensorData(Double temperature, Double vibration) {
        // 1. Construct the URL to hit the Python ML API
        String url = INFERENCE_API_URL + "?temperature=" + temperature + "&vibration=" + vibration;
        
        // 2. Send the POST request to Python and catch the JSON response
        ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
        Map<String, Object> responseBody = response.getBody();

        // 3. Extract the predictions from the Python JSON response
        Integer predictionClass = (Integer) responseBody.get("prediction_class");
        String systemStatus = (String) responseBody.get("system_status");

        // 4. Create a new log and save the entire event to PostgreSQL
        SensorLog log = new SensorLog(temperature, vibration, predictionClass, systemStatus);
        return repository.save(log);
    }
}