package com.shardool.backend.controller;

import com.shardool.backend.model.SensorLog;
import com.shardool.backend.service.OrchestratorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sensors")
@CrossOrigin(origins = "http://localhost:5173")
public class SensorController {

    private final OrchestratorService orchestratorService;

    public SensorController(OrchestratorService orchestratorService) {
        this.orchestratorService = orchestratorService;
    }

    @PostMapping("/record")
    public ResponseEntity<SensorLog> recordSensorData(@RequestBody Map<String, Double> payload) {
        Double temp = payload.get("temperature");
        Double vib = payload.get("vibration");
        
        SensorLog savedLog = orchestratorService.processAndSaveSensorData(temp, vib);
        
        return ResponseEntity.ok(savedLog);
    }
}