package com.isport.backend.service;

import com.isport.backend.dto.event.EventUpdateRequest;
import com.isport.backend.entity.Event;
import com.isport.backend.entity.EventStatus;
import com.isport.backend.entity.Sport;
import com.isport.backend.entity.User;
import com.isport.backend.repository.EventRepository;
import com.isport.backend.repository.SportRepository;
import com.isport.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private SportRepository sportRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private EventService eventService;

    private User creator;
    private User otherUser;
    private Sport football;
    private Event sampleEvent;

    @BeforeEach
    void setUp() {
        creator = new User("aymen", "aymen@isport.tn", "password123");
        creator.setId(1L);

        otherUser = new User("someone", "someone@isport.tn", "password123");
        otherUser.setId(2L);

        football = new Sport("Football");

        sampleEvent = new Event();
        sampleEvent.setId(100L);
        sampleEvent.setTitle("Match initial");
        sampleEvent.setSport(football);
        sampleEvent.setCreator(creator);
        sampleEvent.setDate(LocalDate.now().plusDays(2));
        sampleEvent.setTime(LocalTime.of(18, 0));
        sampleEvent.setLocation("Terrain Bizerte");
        sampleEvent.setMaxParticipants(10);
        sampleEvent.setStatus(EventStatus.OUVERT);
        sampleEvent.setParticipants(new ArrayList<>());
    }

    // --- US-09 : Modification d'événements ---

    @Test
    @DisplayName("US-09.1 & 09.3 : Mise à jour valide par le créateur")
    void testUpdateEvent_Success() {
        when(eventRepository.findById(100L)).thenReturn(Optional.of(sampleEvent));
        when(sportRepository.findById(10L)).thenReturn(Optional.of(football));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventUpdateRequest request = new EventUpdateRequest();
        request.setTitle("Match modifié 6 vs 6");
        request.setSportId(10L);
        request.setDate(LocalDate.now().plusDays(3));
        request.setTime(LocalTime.of(20, 0));
        request.setLocation("Terrain Nouveau");
        request.setMaxParticipants(12);

        Event updated = eventService.updateEvent(100L, request, 1L);

        assertNotNull(updated);
        assertEquals("Match modifié 6 vs 6", updated.getTitle());
        assertEquals(12, updated.getMaxParticipants());
        verify(eventRepository, times(1)).save(sampleEvent);
    }

    @Test
    @DisplayName("US-09.4 : Échec si l'utilisateur n'est pas le créateur (403 Forbidden)")
    void testUpdateEvent_ThrowsForbidden_WhenNotCreator() {
        when(eventRepository.findById(100L)).thenReturn(Optional.of(sampleEvent));

        EventUpdateRequest request = new EventUpdateRequest();
        request.setTitle("Tentative pirate");
        request.setSportId(10L);
        request.setDate(LocalDate.now().plusDays(3));
        request.setTime(LocalTime.of(20, 0));
        request.setLocation("Terrain");
        request.setMaxParticipants(10);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            eventService.updateEvent(100L, request, 2L); // user 2 n'est pas le créateur (user 1)
        });

        assertTrue(ex.getStatusCode().is4xxClientError());
        assertTrue(ex.getReason().contains("créateur"));
        verify(eventRepository, never()).save(any());
    }

    @Test
    @DisplayName("US-09 : Impossible de modifier un événement annulé")
    void testUpdateEvent_ThrowsBadRequest_WhenEventCancelled() {
        sampleEvent.setStatus(EventStatus.ANNULE);
        when(eventRepository.findById(100L)).thenReturn(Optional.of(sampleEvent));

        EventUpdateRequest request = new EventUpdateRequest();
        request.setMaxParticipants(10);

        assertThrows(ResponseStatusException.class, () -> {
            eventService.updateEvent(100L, request, 1L);
        });

        verify(eventRepository, never()).save(any());
    }

    // --- US-10 : Annulation et Suppression ---

    @Test
    @DisplayName("US-10.2 & 10.3 : Annulation valide par le créateur")
    void testCancelEvent_Success() {
        when(eventRepository.findById(100L)).thenReturn(Optional.of(sampleEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event cancelled = eventService.cancelEvent(100L, 1L);

        assertEquals(EventStatus.ANNULE, cancelled.getStatus());
        verify(eventRepository, times(1)).save(sampleEvent);
    }

    @Test
    @DisplayName("US-10 : Annulation interdite pour un non-créateur")
    void testCancelEvent_ThrowsForbidden_WhenNotCreator() {
        when(eventRepository.findById(100L)).thenReturn(Optional.of(sampleEvent));

        assertThrows(ResponseStatusException.class, () -> {
            eventService.cancelEvent(100L, 2L);
        });

        verify(eventRepository, never()).save(any());
    }

    @Test
    @DisplayName("US-10.2 & 10.3 : Suppression définitive par le créateur")
    void testDeleteEvent_Success() {
        when(eventRepository.findById(100L)).thenReturn(Optional.of(sampleEvent));

        eventService.deleteEvent(100L, 1L);

        verify(eventRepository, times(1)).delete(sampleEvent);
    }
}
