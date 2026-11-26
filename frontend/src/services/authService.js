const API_BASE_URL = 'http://localhost:8080/api/auth';

// US-01 : Inscription
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erreur lors de l'inscription");
    }
    return data;
  } catch (err) {
    // Mode démo hors ligne si backend n'est pas allumé
    if (err.message.includes('fetch')) {
      const users = JSON.parse(localStorage.getItem('isport_users') || '[]');
      if (users.some((u) => u.email === userData.email)) {
        throw new Error('Cet email est déjà associé à un compte');
      }
      const newUser = {
        id: Date.now(),
        login: userData.login,
        email: userData.email,
        password: userData.password,
      };
      users.push(newUser);
      localStorage.setItem('isport_users', JSON.stringify(users));
      return { id: newUser.id, login: newUser.login, email: newUser.email, message: 'Inscription réussie avec succès !' };
    }
    throw err;
  }
};

// US-02 : Connexion
export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Identifiants invalides');
    }
    return data;
  } catch (err) {
    // Mode démo hors ligne
    if (err.message.includes('fetch')) {
      const users = JSON.parse(localStorage.getItem('isport_users') || '[]');
      // Compte démo par défaut si aucun compte créé
      if (users.length === 0) {
        users.push({ id: 1, login: 'raslene', email: 'raslene@isport.tn', password: 'password123' });
      }
      const found = users.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );
      if (!found) {
        throw new Error('Identifiants invalides');
      }
      return { id: found.id, login: found.login, email: found.email, message: 'Connexion réussie' };
    }
    throw err;
  }
};
