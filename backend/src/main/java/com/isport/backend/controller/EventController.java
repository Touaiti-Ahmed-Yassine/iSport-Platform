package com.isport.backend.controller;

import com.isport.backend.dto.event.EventResponse;
import com.isport.backend.dto.event.EventUpdateRequest;
import com.isport.backend.entity.Event;
import com.isport.backend.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> getAllEvents() {
        return eventService.getAllEvents().stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public EventResponse getEventById(@PathVariable Long id) {
        return EventResponse.fromEntity(eventService.getEventById(id));
    }

    /**
     * US-09 : En tant que créateur, je veux modifier mon événement
     * Exécute la modification avec validation des données et vérification de l'utilisateur.
     */
    @PutMapping("/{id}")
    public EventResponse updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventUpdateRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        Event updated = eventService.updateEvent(id, request, userId);
        return EventResponse.fromEntity(updated);
    }

    /**
     * US-10 : En tant que créateur, je veux annuler mon événement
     * Passe le statut de l'événement à ANNULE
     */
    @PatchMapping("/{id}/cancel")
    public EventResponse cancelEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        Event cancelled = eventService.cancelEvent(id, userId);
        return EventResponse.fromEntity(cancelled);
    }

    /**
     * US-10 : En tant que créateur, je veux supprimer mon événement
     * Supprime définitivement l'événement de la base de données
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {
        eventService.deleteEvent(id, userId);
    }
}
