// js/components/navigation.js
/**
 * Module de gestion de la navigation
 * Gère le menu latéral, la navigation mobile, et les interactions
 */
import { auth } from '../utils/auth.js';
import { subjectService } from '../services/subject-service.js';

export function initNavigation() {
  console.log("Initializing navigation...");
  
  initSidebar();
  initMobileMenu();
  initPageTransitions();
  initBreadcrumbs();
  initNotificationsBadge();
}

function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  console.log("Initializing sidebar...");
  
  // Personnaliser le menu en fonction du domaine de l'utilisateur
  customizeSidebarForDomain();
  
  // Ajouter des écouteurs d'événements pour les éléments du menu
  const menuItems = sidebar.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
  
  // Gestion du mode compacte pour le sidebar (version mobile/tablette)
  const toggleButton = document.querySelector('.sidebar-toggle');
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      sidebar.classList.toggle('compact');
      document.querySelector('.dashboard-main').classList.toggle('expanded');
      
      // Stocker la préférence de l'utilisateur
      localStorage.setItem('sidebar-compact', sidebar.classList.contains('compact'));
    });
  }
  
  // Restaurer l'état du sidebar à partir du localStorage
  const isCompact = localStorage.getItem('sidebar-compact') === 'true';
  if (isCompact) {
    sidebar.classList.add('compact');
    document.querySelector('.dashboard-main')?.classList.add('expanded');
  }
}

async function customizeSidebarForDomain() {
  if (!auth.user || !auth.user.domain) return;
  
  try {
    // Récupérer les options de menu spécifiques au domaine
    const subjects = await subjectService.getAllSubjects();
    
    const customMenuContainer = document.querySelector('.sidebar-domain-menu');
    if (customMenuContainer) {
      customMenuContainer.innerHTML = '';
      
      subjects.forEach(subject => {
        const menuItem = document.createElement('li');
        menuItem.className = 'sidebar-item';
        
        menuItem.innerHTML = `
          <a href="#" class="sidebar-link">
            <span class="sidebar-icon">🔖</span>
            <span class="sidebar-label">${subject.name}</span>
          </a>
        `;
        
        customMenuContainer.appendChild(menuItem);
      });
    }
  } catch (error) {
    console.error('Erreur lors du chargement des options de menu:', error);
  }
}

function initMobileMenu() {
  const mobileMenuButton = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  
  if (!mobileMenuButton || !mobileMenu) return;
  
  console.log("Initializing mobile menu...");
  
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    mobileMenuButton.classList.toggle('active');
    
    // Bloquer le défilement du body lorsque le menu est ouvert
    document.body.classList.toggle('menu-open');
  });
  
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      mobileMenuButton.classList.remove('active');
      document.body.classList.remove('menu-open');
    });
  });
}

function initPageTransitions() {
  console.log("Initializing page transitions...");
  
  // Détecter les liens internes pour des transitions fluides
  document.querySelectorAll('a[data-transition]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.host === window.location.host) {
        e.preventDefault();
        
        // Ajouter une classe de transition
        document.body.classList.add('page-transition');
        
        // Attendre que l'animation se termine, puis naviguer
        setTimeout(() => {
          window.location.href = link.href;
        }, 300);
      }
    });
  });
  
  // Animation d'entrée de page
  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('page-loaded');
  });
}

function initBreadcrumbs() {
  const breadcrumbsContainer = document.querySelector('.breadcrumbs');
  if (!breadcrumbsContainer) return;
  
  const currentPath = window.location.pathname;
  
  // Générer les breadcrumbs en fonction du chemin actuel
  let pathParts = currentPath.split('/').filter(part => part && part !== 'index.html');
  
  let breadcrumbsHTML = '<a href="/">Accueil</a>';
  let currentPath2 = '';
  
  pathParts.forEach((part, index) => {
    currentPath2 += '/' + part;
    
    // Convertir les noms de fichier en labels
    let label = part.replace('.html', '');
    label = label.replace(/-/g, ' ');
    label = label.charAt(0).toUpperCase() + label.slice(1);
    
    if (index === pathParts.length - 1) {
      breadcrumbsHTML += `<span class="breadcrumb-separator">/</span><span class="breadcrumb-active">${label}</span>`;
    } else {
      breadcrumbsHTML += `<span class="breadcrumb-separator">/</span><a href="${currentPath2}">${label}</a>`;
    }
  });
  
  breadcrumbsContainer.innerHTML = breadcrumbsHTML;
}

async function initNotificationsBadge() {
  const notificationBadge = document.querySelector('.notification-badge');
  if (!notificationBadge) return;
  
  try {
    // Récupérer le nombre de notifications non lues
    const userNotifications = await authService.getUnreadNotifications();
    
    if (userNotifications && userNotifications.count > 0) {
      notificationBadge.textContent = userNotifications.count > 99 ? '99+' : userNotifications.count;
      notificationBadge.style.display = 'block';
    } else {
      notificationBadge.style.display = 'none';
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error);
    notificationBadge.style.display = 'none';
  }
}

export function navigateTo(url, params = {}) {
  // Construire l'URL avec les paramètres
  if (Object.keys(params).length > 0) {
    url += '?' + new URLSearchParams(params).toString();
  }
  
  // Animation de sortie
  document.body.classList.add('page-transition');
  
  // Changer l'URL après l'animation
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

export function setupNavigationListeners() {
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      // Si le lien pointe vers une ancre de la page
      if (link.getAttribute('href').startsWith('#')) {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}