const API_BASE_URL = 'http://localhost:8080/api/events';

export const getEvents = async () => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des événements');
  }
  return response.json();
};

export const getEventById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Événement non trouvé');
  }
  return response.json();
};

// US-09 : Modifier un événement
export const updateEvent = async (id, eventData, userId = 1) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': String(userId),
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la mise à jour de l’événement');
  }
  return response.json();
};

// US-10 : Annuler un événement
export const cancelEvent = async (id, userId = 1) => {
  const response = await fetch(`${API_BASE_URL}/${id}/cancel`, {
    method: 'PATCH',
    headers: {
      'X-User-Id': String(userId),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de l’annulation de l’événement');
  }
  return response.json();
};

// US-10 : Supprimer un événement
export const deleteEvent = async (id, userId = 1) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'X-User-Id': String(userId),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la suppression de l’événement');
  }
  return true;
};
