package com.isport.backend.service;

import com.isport.backend.entity.Event;
import com.isport.backend.entity.Sport;
import com.isport.backend.repository.EventRepository;
import com.isport.backend.repository.SportRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final SportRepository sportRepository;

    public EventService(EventRepository eventRepository, SportRepository sportRepository) {
        this.eventRepository = eventRepository;
        this.sportRepository = sportRepository;
    }

    public Event createEvent(Event event) {
        if (event.getTitre() == null || event.getTitre().isBlank()) {
            throw badRequest("Le titre est obligatoire");
        }
        if (event.getLieu() == null || event.getLieu().isBlank()) {
            throw badRequest("Le lieu est obligatoire");
        }
        if (event.getDate() == null || event.getHeure() == null) {
            throw badRequest("La date et l'heure sont obligatoires");
        }
        if (!LocalDateTime.of(event.getDate(), event.getHeure()).isAfter(LocalDateTime.now())) {
            throw badRequest("La date et l'heure doivent être dans le futur");
        }
        if (event.getMaxParticipants() < 1) {
            throw badRequest("Le nombre maximum de participants doit être au moins 1");
        }
        if (event.getDureeMinutes() != null && event.getDureeMinutes() < 1) {
            throw badRequest("La durée doit être positive");
        }
        if (event.getSport() == null || event.getSport().getId() == null) {
            throw badRequest("Le sport est obligatoire");
        }

        Sport sport = sportRepository.findById(event.getSport().getId())
                .orElseThrow(() -> badRequest("Sport introuvable"));
        event.setSport(sport);

        return eventRepository.save(event);
    }

    public List<Event> getUpcomingEvents() {
        return eventRepository.findUpcoming(LocalDate.now(), LocalTime.now());
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}