package com.shardool.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_logs")
public class SensorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double temperature;
    private Double vibration;
    private Integer predictionClass;
    private String systemStatus;
    private LocalDateTime recordedAt;

    // Constructors
    public SensorLog() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getVibration() {
        return vibration;
    }

    public void setVibration(Double vibration) {
        this.vibration = vibration;
    }

    public Integer getPredictionClass() {
        return predictionClass;
    }

    public void setPredictionClass(Integer predictionClass) {
        this.predictionClass = predictionClass;
    }

    public String getSystemStatus() {
        return systemStatus;
    }

    public void setSystemStatus(String systemStatus) {
        this.systemStatus = systemStatus;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}