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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
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
        creator = new User();
        creator.setLogin("aymen");
        creator.setEmail("aymen@isport.tn");

        otherUser = new User();
        otherUser.setLogin("hacker");
        otherUser.setEmail("hacker@fake.tn");

        football = new Sport();
        football.setName("Football");

        sampleEvent = new Event();
        sampleEvent.setId(1L);
        sampleEvent.setTitre("Match du Samedi");
        sampleEvent.setLieu("Stade Municipal");
        sampleEvent.setDate(LocalDate.now().plusDays(2));
        sampleEvent.setHeure(LocalTime.of(18, 0));
        sampleEvent.setMaxParticipants(10);
        sampleEvent.setSport(football);
        sampleEvent.setStatus(EventStatus.OUVERT);
        sampleEvent.setCreator(creator);
    }

    // --- US-07: Détails d'un événement ---

    @Test
    void getEventById_WhenExists_ShouldReturnEvent() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));

        Event found = eventService.getEventById(1L);

        assertNotNull(found);
        assertEquals("Match du Samedi", found.getTitre());
        verify(eventRepository).findById(1L);
    }

    @Test
    void getEventById_WhenNotFound_ShouldThrow404() {
        when(eventRepository.findById(99L)).thenReturn(Optional.empty());

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> eventService.getEventById(99L));

        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    // --- US-09: Modification d'événements ---

    @Test
    void updateEvent_WhenCreator_ShouldUpdateFields() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EventUpdateRequest request = new EventUpdateRequest();
        request.setTitre("Nouveau Titre");
        request.setLieu("Nouveau Gymnase");

        Event updated = eventService.updateEvent(1L, request, "aymen@isport.tn");

        assertNotNull(updated);
        assertEquals("Nouveau Titre", updated.getTitre());
        assertEquals("Nouveau Gymnase", updated.getLieu());
        verify(eventRepository).save(sampleEvent);
    }

    @Test
    void updateEvent_WhenNotCreator_ShouldThrow403() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));

        EventUpdateRequest request = new EventUpdateRequest();
        request.setTitre("Tentative intrusion");

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> eventService.updateEvent(1L, request, "hacker@fake.tn"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(eventRepository, never()).save(any());
    }

    // --- US-10: Annulation / Suppression d'événements ---

    @Test
    void cancelEvent_WhenCreator_ShouldSetStatusAnnule() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Event cancelled = eventService.cancelEvent(1L, "aymen@isport.tn");

        assertEquals(EventStatus.ANNULE, cancelled.getStatus());
        verify(eventRepository).save(sampleEvent);
    }

    @Test
    void cancelEvent_WhenNotCreator_ShouldThrow403() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> eventService.cancelEvent(1L, "hacker@fake.tn"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void deleteEvent_WhenCreator_ShouldDeleteFromRepository() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));

        eventService.deleteEvent(1L, "aymen@isport.tn");

        verify(eventRepository).delete(sampleEvent);
    }

    @Test
    void deleteEvent_WhenNotCreator_ShouldThrow403() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(sampleEvent));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> eventService.deleteEvent(1L, "hacker@fake.tn"));

        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        verify(eventRepository, never()).delete(any());
    }
}
