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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
                        SportRepository sportRepository,
                        UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.sportRepository = sportRepository;
        this.userRepository = userRepository;
    }

    public Event createEvent(Event event) {
        return createEvent(event, getCurrentUsername());
    }

    public Event createEvent(Event event, String currentUsername) {
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

        if (event.getStatus() == null) {
            event.setStatus(EventStatus.OUVERT);
        }

        if (event.getCreator() == null && currentUsername != null && !currentUsername.isBlank()) {
            userRepository.findByEmail(currentUsername)
                    .or(() -> userRepository.findByLogin(currentUsername))
                    .ifPresent(event::setCreator);
        }

        return eventRepository.save(event);
    }

    /**
     * US-07: Détails d'un événement
     */
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable avec l'id : " + id));
    }

    /**
     * US-09: Modification d'événements
     */
    public Event updateEvent(Long id, EventUpdateRequest request) {
        return updateEvent(id, request, getCurrentUsername());
    }

    public Event updateEvent(Long id, EventUpdateRequest request, String currentUsername) {
        Event event = getEventById(id);
        verifyCreatorOrAdmin(event, currentUsername);

        if (request.getTitre() != null) {
            if (request.getTitre().isBlank()) {
                throw badRequest("Le titre ne peut pas être vide");
            }
            event.setTitre(request.getTitre());
        }

        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }

        if (request.getLieu() != null) {
            if (request.getLieu().isBlank()) {
                throw badRequest("Le lieu ne peut pas être vide");
            }
            event.setLieu(request.getLieu());
        }

        if (request.getLatitude() != null) {
            event.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            event.setLongitude(request.getLongitude());
        }

        if (request.getSportId() != null) {
            Sport sport = sportRepository.findById(request.getSportId())
                    .orElseThrow(() -> badRequest("Sport introuvable"));
            event.setSport(sport);
        }

        LocalDate newDate = request.getDate() != null ? request.getDate() : event.getDate();
        LocalTime newHeure = request.getHeure() != null ? request.getHeure() : event.getHeure();

        if (request.getDate() != null || request.getHeure() != null) {
            if (!LocalDateTime.of(newDate, newHeure).isAfter(LocalDateTime.now())) {
                throw badRequest("La date et l'heure doivent être dans le futur");
            }
            event.setDate(newDate);
            event.setHeure(newHeure);
        }

        if (request.getDureeMinutes() != null) {
            if (request.getDureeMinutes() < 1) {
                throw badRequest("La durée doit être positive");
            }
            event.setDureeMinutes(request.getDureeMinutes());
        }

        if (request.getMaxParticipants() != null) {
            if (request.getMaxParticipants() < 1) {
                throw badRequest("Le nombre maximum de participants doit être au moins 1");
            }
            event.setMaxParticipants(request.getMaxParticipants());
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            try {
                event.setStatus(EventStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw badRequest("Statut invalide : " + request.getStatus());
            }
        }

        return eventRepository.save(event);
    }

    /**
     * US-10: Annulation d'un événement (soft cancel)
     */
    public Event cancelEvent(Long id) {
        return cancelEvent(id, getCurrentUsername());
    }

    public Event cancelEvent(Long id, String currentUsername) {
        Event event = getEventById(id);
        verifyCreatorOrAdmin(event, currentUsername);
        event.setStatus(EventStatus.ANNULE);
        return eventRepository.save(event);
    }

    /**
     * US-10: Suppression définitive d'un événement
     */
    public void deleteEvent(Long id) {
        deleteEvent(id, getCurrentUsername());
    }

    public void deleteEvent(Long id, String currentUsername) {
        Event event = getEventById(id);
        verifyCreatorOrAdmin(event, currentUsername);
        eventRepository.delete(event);
    }

    public List<Event> getUpcomingEvents() {
        return eventRepository.findUpcoming(LocalDate.now(), LocalTime.now());
    }

    private void verifyCreatorOrAdmin(Event event, String currentUsername) {
        if (event.getCreator() == null) {
            // Si l'événement n'avait pas de créateur explicite dans la DB, on autorise la modification
            return;
        }

        if (currentUsername == null || currentUsername.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur non authentifié");
        }

        String creatorEmail = event.getCreator().getEmail();
        String creatorLogin = event.getCreator().getLogin();

        boolean isCreator = (creatorEmail != null && creatorEmail.equalsIgnoreCase(currentUsername))
                || (creatorLogin != null && creatorLogin.equalsIgnoreCase(currentUsername));

        if (!isCreator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul le créateur peut modifier ou supprimer cet événement");
        }
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return null;
        }
        return auth.getName();
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
