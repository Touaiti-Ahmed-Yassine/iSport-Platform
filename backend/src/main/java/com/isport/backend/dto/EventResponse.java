package com.isport.backend.dto;

import com.isport.backend.entity.Event;
import com.isport.backend.entity.EventStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private Long sportId;
    private String sportName;
    private LocalDate date;
    private LocalTime time;
    private String location;
    private Integer maxParticipants;
    private Integer currentParticipants;
    private EventStatus status;
    private Long creatorId;
    private String creatorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EventResponse() {
    }

    public static EventResponse fromEntity(Event event) {
        EventResponse resp = new EventResponse();
        resp.setId(event.getId());
        resp.setTitle(event.getTitle());
        resp.setDescription(event.getDescription());
        if (event.getSport() != null) {
            resp.setSportId(event.getSport().getId());
            resp.setSportName(event.getSport().getName());
        }
        resp.setDate(event.getDate());
        resp.setTime(event.getTime());
        resp.setLocation(event.getLocation());
        resp.setMaxParticipants(event.getMaxParticipants());
        resp.setCurrentParticipants(event.getParticipants() != null ? event.getParticipants().size() : 0);
        resp.setStatus(event.getStatus());
        if (event.getCreator() != null) {
            resp.setCreatorId(event.getCreator().getId());
            resp.setCreatorUsername(event.getCreator().getUsername());
        }
        resp.setCreatedAt(event.getCreatedAt());
        resp.setUpdatedAt(event.getUpdatedAt());
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getSportId() {
        return sportId;
    }

    public void setSportId(Long sportId) {
        this.sportId = sportId;
    }

    public String getSportName() {
        return sportName;
    }

    public void setSportName(String sportName) {
        this.sportName = sportName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public Integer getCurrentParticipants() {
        return currentParticipants;
    }

    public void setCurrentParticipants(Integer currentParticipants) {
        this.currentParticipants = currentParticipants;
    }

    public EventStatus getStatus() {
        return status;
    }

    public void setStatus(EventStatus status) {
        this.status = status;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public String getCreatorUsername() {
        return creatorUsername;
    }

    public void setCreatorUsername(String creatorUsername) {
        this.creatorUsername = creatorUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
