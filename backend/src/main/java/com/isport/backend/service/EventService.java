package com.isport.backend.service;

import com.isport.backend.dto.event.EventUpdateRequest;
import com.isport.backend.entity.Event;
import com.isport.backend.entity.EventStatus;
import com.isport.backend.entity.Sport;
import com.isport.backend.entity.User;
import com.isport.backend.repository.EventRepository;
import com.isport.backend.repository.SportRepository;
import com.isport.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class EventService {

    private final EventRepository eventRepository;
    private final SportRepository sportRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, SportRepository sportRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.sportRepository = sportRepository;
        this.userRepository = userRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement non trouvé avec l'id : " + id));
    }

    /**
     * US-09 : En tant que créateur, je veux modifier mon événement
     */
    public Event updateEvent(Long eventId, EventUpdateRequest request, Long userId) {
        Event event = getEventById(eventId);

        // Règle de sécurité : Seul le créateur peut modifier son événement
        if (event.getCreator() != null && userId != null && !event.getCreator().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : vous n'êtes pas le créateur de cet événement");
        }

        // Règle métier : Impossible de modifier un événement annulé
        if (event.getStatus() == EventStatus.ANNULE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Impossible de modifier un événement annulé");
        }

        // Règle métier : maxParticipants ne doit pas être inférieur au nombre actuel de participants
        int currentCount = event.getParticipants() != null ? event.getParticipants().size() : 0;
        if (request.getMaxParticipants() < currentCount) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le nombre max de participants (" + request.getMaxParticipants() +
                            ") ne peut pas être inférieur aux inscrits actuels (" + currentCount + ")"
            );
        }

        // Récupérer le sport
        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sport introuvable avec l'id : " + request.getSportId()));

        // Mise à jour des informations
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setSport(sport);
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());

        // Mise à jour automatique du statut
        if (currentCount >= request.getMaxParticipants()) {
            event.setStatus(EventStatus.COMPLET);
        } else if (event.getStatus() == EventStatus.COMPLET) {
            event.setStatus(EventStatus.OUVERT);
        }

        return eventRepository.save(event);
    }

    /**
     * US-10 : En tant que créateur, je veux annuler mon événement
     */
    public Event cancelEvent(Long eventId, Long userId) {
        Event event = getEventById(eventId);

        // Sécurité
        if (event.getCreator() != null && userId != null && !event.getCreator().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : vous n'êtes pas le créateur de cet événement");
        }

        if (event.getStatus() == EventStatus.ANNULE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet événement est déjà annulé");
        }

        event.setStatus(EventStatus.ANNULE);
        return eventRepository.save(event);
    }

    /**
     * US-10 : En tant que créateur, je veux supprimer mon événement
     */
    public void deleteEvent(Long eventId, Long userId) {
        Event event = getEventById(eventId);

        // Sécurité
        if (event.getCreator() != null && userId != null && !event.getCreator().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé : vous n'êtes pas le créateur de cet événement");
        }

        eventRepository.delete(event);
    }

    /**
     * Méthode utilitaire de création d'événement (US-05) pour tester
     */
    public Event createEvent(Event event, Long creatorId) {
        if (creatorId != null) {
            User creator = userRepository.findById(creatorId).orElse(null);
            event.setCreator(creator);
        }
        if (event.getStatus() == null) {
            event.setStatus(EventStatus.OUVERT);
        }
        return eventRepository.save(event);
    }
}
