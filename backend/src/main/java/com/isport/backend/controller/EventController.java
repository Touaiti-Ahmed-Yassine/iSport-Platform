package com.isport.backend.controller;

import com.isport.backend.dto.event.EventUpdateRequest;
import com.isport.backend.entity.Event;
import com.isport.backend.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Event createEvent(@RequestBody Event event) {
        return eventService.createEvent(event);
    }

    @GetMapping("/upcoming")
    public List<Event> getUpcomingEvents() {
        return eventService.getUpcomingEvents();
    }

    /**
     * US-07: Consulter les détails d'un événement
     */
    @GetMapping("/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventService.getEventById(id);
    }

    /**
     * US-09: Modifier un événement (réservé au créateur)
     */
    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody EventUpdateRequest request) {
        return eventService.updateEvent(id, request);
    }

    /**
     * US-10: Annuler un événement (soft cancel)
     */
    @PatchMapping("/{id}/cancel")
    public Event cancelEvent(@PathVariable Long id) {
        return eventService.cancelEvent(id);
    }

    /**
     * US-10: Supprimer un événement
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }
}
