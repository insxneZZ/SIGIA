// Configuración global
const CONFIG = {
  API_URL: "http://localhost:3000/api",
  TOKEN_KEY: "warehouse_token",
  TIMEOUT: 5000,
};

// Clase principal para gestionar la aplicación
class WarehouseApp {
  constructor() {
    this.token = localStorage.getItem(CONFIG.TOKEN_KEY);
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", this.handleLogin.bind(this));
    }

    // Navegación
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", this.handleNavigation.bind(this));
    });
  }

  async handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await this.login(username, password);
      if (response.token) {
        this.setToken(response.token);
        window.location.href = "pages/dashboard.html";
      }
    } catch (error) {
      this.showError("Error de inicio de sesión: " + error.message);
    }
  }

  async login(username, password) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      return await response.json();
    } catch (error) {
      throw new Error("Error de conexión");
    }
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem(CONFIG.TOKEN_KEY, token);
  }

  getToken() {
    return this.token;
  }

  logout() {
    this.token = null;
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    window.location.href = "../index.html";
  }

  showError(message) {
    // Implementar lógica para mostrar errores
    // Por ejemplo, usando Bootstrap toasts o alerts
    const alertDiv = document.createElement("div");
    alertDiv.className = "alert alert-danger alert-dismissible fade show";
    alertDiv.role = "alert";
    alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
    document.body.insertBefore(alertDiv, document.body.firstChild);
  }

  // Método para realizar peticiones autenticadas
  async fetchAuth(endpoint, options = {}) {
    const headers = {
      Authorization: `Bearer ${this.getToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(`${CONFIG.API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.logout();
      throw new Error("Sesión expirada");
    }

    return response;
  }
}

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  window.app = new WarehouseApp();
});

// Utilidades globales
const utils = {
  formatDate: (date) => {
    return new Date(date).toLocaleDateString("es-ES");
  },

  formatCurrency: (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  },

  validateInput: (value, type) => {
    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^\+?[\d\s-]{9,}$/,
      number: /^\d+$/,
    };

    return patterns[type] ? patterns[type].test(value) : true;
  },
};
