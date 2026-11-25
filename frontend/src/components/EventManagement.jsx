import React, { useState, useEffect } from 'react';
import { getEvents, cancelEvent, deleteEvent } from '../services/eventService';
import EventCard from './EventCard';
import EditEventModal from './EditEventModal';

export default function EventManagement() {
  const [events, setEvents] = useState([]);
  const [sports] = useState([
    { id: 1, name: 'Football' },
    { id: 2, name: 'Basketball' },
    { id: 3, name: 'Tennis' },
    { id: 4, name: 'Padel' },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const currentUserId = 1;

  // Initial load
  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch {
      // Données de démonstration si le backend Spring Boot n'est pas encore démarré
      setEvents((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: 1,
            title: 'Match de Football 5 vs 5',
            sportId: 1,
            sportName: 'Football',
            date: '2026-12-01',
            time: '19:00',
            location: 'Terrain Bizerte Nord',
            maxParticipants: 10,
            currentParticipants: 8,
            status: 'OUVERT',
            creatorId: 1,
            description: 'Match amical de foot 5. Prévoir des chaussures stabilisées.',
          },
          {
            id: 2,
            title: 'Tournoi Padel double',
            sportId: 4,
            sportName: 'Padel',
            date: '2026-12-05',
            time: '17:30',
            location: 'Club Padel Corniche',
            maxParticipants: 4,
            currentParticipants: 4,
            status: 'COMPLET',
            creatorId: 1,
            description: 'Match en double niveau intermédiaire.',
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEdit = (event) => {
    setSelectedEvent(event);
  };

  // Callback de mise à jour locale (US-09)
  const handleLocalUpdate = (eventId, updatedData) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id === eventId) {
          const matchedSport = sports.find((s) => s.id === updatedData.sportId);
          let newStatus = ev.status;
          if (ev.currentParticipants >= updatedData.maxParticipants) {
            newStatus = 'COMPLET';
          } else if (ev.status === 'COMPLET') {
            newStatus = 'OUVERT';
          }
          return {
            ...ev,
            ...updatedData,
            sportName: matchedSport ? matchedSport.name : ev.sportName,
            status: newStatus,
          };
        }
        return ev;
      })
    );
  };

  // Callback d'annulation locale (US-10)
  const handleLocalCancel = (eventId) => {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, status: 'ANNULE' } : ev))
    );
  };

  // Callback de suppression locale (US-10)
  const handleLocalDelete = (eventId) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
  };

  const handleCancel = async (eventId) => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cet événement ?")) {
      try {
        await cancelEvent(eventId, currentUserId);
        loadEvents();
      } catch {
        handleLocalCancel(eventId);
      }
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("⚠️ Voulez-vous vraiment supprimer cet événement ?")) {
      try {
        await deleteEvent(eventId, currentUserId);
        loadEvents();
      } catch {
        handleLocalDelete(eventId);
      }
    }
  };

  return (
    <div className="event-mgmt-container">
      <div className="mgmt-header">
        <div>
          <h2>Gestion des événements (Créateur)</h2>
          <p className="subtitle">
            User Stories : <strong>US-09 (Modifier)</strong> & <strong>US-10 (Annuler / Supprimer)</strong>
          </p>
        </div>
        <button className="btn btn-refresh" onClick={loadEvents} disabled={loading}>
          {loading ? 'Chargement...' : '🔄 Actualiser'}
        </button>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <p className="no-events">Aucun événement trouvé.</p>
        ) : (
          events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onDelete={handleDelete}
              isCreator={ev.creatorId === currentUserId}
            />
          ))
        )}
      </div>

      {selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          sports={sports}
          currentUserId={currentUserId}
          onClose={() => setSelectedEvent(null)}
          onRefresh={loadEvents}
          onLocalUpdate={handleLocalUpdate}
          onLocalCancel={handleLocalCancel}
          onLocalDelete={handleLocalDelete}
        />
      )}
    </div>
  );
}
