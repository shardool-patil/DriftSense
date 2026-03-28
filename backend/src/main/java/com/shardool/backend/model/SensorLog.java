package com.shardool.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_logs")
public class SensorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @Column(nullable = false)
    private Double temperature;

    @Column(nullable = false)
    private Double vibration;

    @Column(name = "prediction_class", nullable = false)
    private Integer predictionClass;

    @Column(name = "system_status", nullable = false)
    private String systemStatus;

    // This tells Hibernate to automatically set the current time right before saving to the DB
    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
    }

    // --- Constructors ---
    public SensorLog() {}

    public SensorLog(Double temperature, Double vibration, Integer predictionClass, String systemStatus) {
        this.temperature = temperature;
        this.vibration = vibration;
        this.predictionClass = predictionClass;
        this.systemStatus = systemStatus;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getVibration() { return vibration; }
    public void setVibration(Double vibration) { this.vibration = vibration; }

    public Integer getPredictionClass() { return predictionClass; }
    public void setPredictionClass(Integer predictionClass) { this.predictionClass = predictionClass; }

    public String getSystemStatus() { return systemStatus; }
    public void setSystemStatus(String systemStatus) { this.systemStatus = systemStatus; }
}