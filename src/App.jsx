import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Video, 
  ListVideo, 
  Globe, import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Video, 
  ListVideo, 
  Globe, 
  ExternalLink, 
  BookOpen, 
  Wrench, 
  Cpu, 
  Printer, 
  Zap,
  RefreshCw
} from 'lucide-react';

// --- DONNÉES DE DÉMONSTRATION ---
const mockData = [
  { id: 1, type: 'video', category: 'Impression 3D', title: 'Tutoriel : Préparer son fichier sur Cura', url: 'https://youtube.com', description: 'Les paramètres de base pour réussir votre première impression sur nos machines Prusa.' },
  { id: 2, type: 'pdf', category: 'Sécurité', title: 'Manuel d\'utilisation Découpeuse Laser', url: '#', description: 'Règles de sécurité obligatoires et guide d\'utilisation de la Trotec Speedy 400.' },
  { id: 3, type: 'playlist', category: 'Électronique', title: 'Apprendre l\'Arduino de A à Z', url: 'https://youtube.com', description: 'Une série de vidéos pour comprendre la programmation des microcontrôleurs.' },
  { id: 4, type: 'web', category: 'Modélisation', title: 'Thingiverse - Modèles 3D', url: 'https://thingiverse.com', description: 'Banque communautaire pour télécharger des fichiers STL prêts à imprimer.' },
  { id: 5, type: 'pdf', category: 'Fraiseuse CNC', title: 'Abaques de vitesses de coupe (Bois & Alu)', url: '#', description: 'Document de référence pour paramétrer la fraiseuse selon les matériaux.' },
  { id: 6, type: 'video', category: 'Électronique', title: 'Souder des composants CMS facilement', url: 'https://youtube.com', description: 'Technique de soudure au fer et à l\'air chaud pour vos circuits imprimés.' },
  { id: 7, type: 'web', category: 'Modélisation', title: 'Tinkercad - CAO pour débutants', url: 'https://tinkercad.com', description: 'Outil de modélisation 3D en ligne très intuitif pour les nouveaux makers.' },
  { id: 8, type: 'pdf', category: 'Général', title: 'Charte du Fablab', url: '#', description: 'Les règles de vie, de partage et de respect du matériel au sein de l\'atelier.' },
];

// --- FONCTION DE PARSING CSV ---
const parseCSV = (str) => {
  const result = [];
  const lines = str.split('\n');
  if (lines.length === 0) return result;
  
  // Nettoyage robuste : suppression des retours chariot, espaces, BOM (caractères invisibles) et mise en minuscules
  const headers = lines[0].split(',').map(h => h.trim().replace(/[\r\n\uFEFF]/g, '').toLowerCase());
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const obj = {};
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    headers.forEach((header, index) => {
      // Ignorer les colonnes sans en-tête valide
      if (!header) return; 
      
      let val = values[index] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      obj[header] = val.replace(/\r/g, '');
    });
    
    // N'ajouter l'objet que s'il a au moins un titre ou une URL pour éviter les lignes fantômes
    if (obj.title || obj.url) {
      if (obj.id) obj.id = parseInt(obj.id, 10) || i;
      else obj.id = i;
      result.push(obj);
    }
  }
  return result;
};

export default function App() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // --- CHARGEMENT DEPUIS VOTRE FICHIER CSV GOOGLE DRIVE ---
  useEffect(() => {
    // URL corrigée : utilisation de /pub? et ajout de &output=csv pour forcer le téléchargement au format brut
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSz5O-P6ANRB3mFjO6a486otcOIs48PouQSV-1Ghu3Yer4PzP4suIWQAeKk3mO3VNVJIJF4dxPYbDQS/pub?gid=1406424947&single=true&output=csv`;
    
    fetch(csvUrl)
      .then(response => {
        if (!response.ok) throw new Error("Erreur lors de la récupération du fichier");
        return response.text();
      })
      .then(csv => {
        const data = parseCSV(csv);
        setResources(data.length > 0 ? data : mockData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erreur de récupération:", err);
        setResources(mockData);
        setIsLoading(false);
      });
  }, []);

  // --- LOGIQUE DE FILTRAGE SÉCURISÉE ---
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // On s'assure que chaque propriété est une chaîne de caractères pour éviter l'erreur "toLowerCase of undefined"
      const title = res.title || '';
      const description = res.description || '';
      const type = res.type || '';
      const category = res.category || '';

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeFilter === 'all' || type === activeFilter;
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [resources, searchTerm, activeFilter, activeCategory]);

  // Récupération sécurisée des catégories
  const categories = ['all', ...new Set(resources.map(r => r.category || 'Non classé').filter(Boolean))];

  // --- UTILITAIRES D'AFFICHAGE ---
  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return { icon: Video, label: 'Vidéo', color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' };
      case 'playlist': return { icon: ListVideo, label: 'Playlist', color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
      case 'pdf': return { icon: FileText, label: 'PDF', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' };
      case 'web': return { icon: Globe, label: 'Site Web', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' };
      default: return { icon: BookOpen, label: 'Autre', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Impression 3D': return <Printer className="w-4 h-4 mr-2" />;
      case 'Sécurité': return <Wrench className="w-4 h-4 mr-2" />;
      case 'Électronique': return <Zap className="w-4 h-4 mr-2" />;
      case 'Fraiseuse CNC': return <Cpu className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* En-tête */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ressources <span className="text-blue-600">Fablab</span></h1>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une doc, un tuto, une machine..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Contrôles / Filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Filtres par type */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>Tous les types</button>
              <button onClick={() => setActiveFilter('video')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'video' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><Video className="w-4 h-4"/> Vidéos</button>
              <button onClick={() => setActiveFilter('playlist')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'playlist' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><ListVideo className="w-4 h-4"/> Playlists</button>
              <button onClick={() => setActiveFilter('pdf')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'pdf' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><FileText className="w-4 h-4"/> PDFs</button>
              <button onClick={() => setActiveFilter('web')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'web' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><Globe className="w-4 h-4"/> Sites Web</button>
            </div>

            {/* Filtres par catégorie */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium">Catégorie :</span>
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none max-w-[200px]"
              >
                {categories.map(cat => {
                  const catStr = String(cat);
                  return (
                    <option key={catStr} value={catStr}>
                      {catStr === 'all' ? 'Toutes les catégories' : catStr}
                    </option>
                  );
                })}
              </select>
            </div>

          </div>
        </div>

        {/* Grille de résultats */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p>Synchronisation avec Google Drive...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => {
              const resType = resource.type || 'autre';
              const { icon: TypeIcon, label, color, bg, border } = getTypeConfig(resType);
              
              return (
                <a 
                  key={resource.id} 
                  href={resource.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className={`p-4 border-b border-slate-100 flex items-start justify-between ${bg} bg-opacity-30`}>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${bg} ${color} ${border} border`}>
                      <TypeIcon className="w-3.5 h-3.5 mr-1.5" />
                      {label}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center text-xs text-slate-500 font-medium mb-2">
                      {getCategoryIcon(resource.category)}
                      {resource.category || 'Non classé'}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 line-clamp-2">
                      {resource.title || 'Ressource sans titre'}
                    </h3>
                    
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">
                      {resource.description || ''}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center">
                        {resType === 'pdf' ? 'Consulter le document' : 
                         resType === 'video' ? 'Voir la vidéo' : 
                         resType === 'playlist' ? 'Voir la playlist' : 'Ouvrir le lien'}
                         <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Aucune ressource trouvée</h3>
            <p className="mt-1 text-sm text-slate-500">Essayez de modifier vos filtres ou votre recherche.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveFilter('all'); setActiveCategory('all'); }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
  ExternalLink, 
  BookOpen, 
  Wrench, 
  Cpu, 
  Printer, 
  Zap,
  RefreshCw
} from 'lucide-react';

// --- DONNÉES DE DÉMONSTRATION ---
const mockData = [
  { id: 1, type: 'video', category: 'Impression 3D', title: 'Tutoriel : Préparer son fichier sur Cura', url: 'https://youtube.com', description: 'Les paramètres de base pour réussir votre première impression sur nos machines Prusa.' },
  { id: 2, type: 'pdf', category: 'Sécurité', title: 'Manuel d\'utilisation Découpeuse Laser', url: '#', description: 'Règles de sécurité obligatoires et guide d\'utilisation de la Trotec Speedy 400.' },
  { id: 3, type: 'playlist', category: 'Électronique', title: 'Apprendre l\'Arduino de A à Z', url: 'https://youtube.com', description: 'Une série de vidéos pour comprendre la programmation des microcontrôleurs.' },
  { id: 4, type: 'web', category: 'Modélisation', title: 'Thingiverse - Modèles 3D', url: 'https://thingiverse.com', description: 'Banque communautaire pour télécharger des fichiers STL prêts à imprimer.' },
  { id: 5, type: 'pdf', category: 'Fraiseuse CNC', title: 'Abaques de vitesses de coupe (Bois & Alu)', url: '#', description: 'Document de référence pour paramétrer la fraiseuse selon les matériaux.' },
  { id: 6, type: 'video', category: 'Électronique', title: 'Souder des composants CMS facilement', url: 'https://youtube.com', description: 'Technique de soudure au fer et à l\'air chaud pour vos circuits imprimés.' },
  { id: 7, type: 'web', category: 'Modélisation', title: 'Tinkercad - CAO pour débutants', url: 'https://tinkercad.com', description: 'Outil de modélisation 3D en ligne très intuitif pour les nouveaux makers.' },
  { id: 8, type: 'pdf', category: 'Général', title: 'Charte du Fablab', url: '#', description: 'Les règles de vie, de partage et de respect du matériel au sein de l\'atelier.' },
];

// --- FONCTION DE PARSING CSV ---
const parseCSV = (str) => {
  const result = [];
  const lines = str.split('\n');
  if (lines.length === 0) return result;
  
  // Nettoyage robuste : suppression des retours chariot, espaces, BOM (caractères invisibles) et mise en minuscules
  const headers = lines[0].split(',').map(h => h.trim().replace(/[\r\n\uFEFF]/g, '').toLowerCase());
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const obj = {};
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    
    headers.forEach((header, index) => {
      // Ignorer les colonnes sans en-tête valide
      if (!header) return; 
      
      let val = values[index] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      obj[header] = val.replace(/\r/g, '');
    });
    
    // N'ajouter l'objet que s'il a au moins un titre ou une URL pour éviter les lignes fantômes
    if (obj.title || obj.url) {
      if (obj.id) obj.id = parseInt(obj.id, 10) || i;
      else obj.id = i;
      result.push(obj);
    }
  }
  return result;
};

export default function App() {
  const [resources, setResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // --- CHARGEMENT DEPUIS VOTRE FICHIER CSV GOOGLE DRIVE ---
  useEffect(() => {
    // URL corrigée : utilisation de /pub? et ajout de &output=csv pour forcer le téléchargement au format brut
    const csvUrl = `https://docs.google.com/spreadsheets/d/e/2PACX-1vSz5O-P6ANRB3mFjO6a486otcOIs48PouQSV-1Ghu3Yer4PzP4suIWQAeKk3mO3VNVJIJF4dxPYbDQS/pubhtml?gid=1406424947&single=true&output=csv`;
    
    fetch(csvUrl)
      .then(response => {
        if (!response.ok) throw new Error("Erreur lors de la récupération du fichier");
        return response.text();
      })
      .then(csv => {
        const data = parseCSV(csv);
        setResources(data.length > 0 ? data : mockData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Erreur de récupération:", err);
        setResources(mockData);
        setIsLoading(false);
      });
  }, []);

  // --- LOGIQUE DE FILTRAGE SÉCURISÉE ---
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // On s'assure que chaque propriété est une chaîne de caractères pour éviter l'erreur "toLowerCase of undefined"
      const title = res.title || '';
      const description = res.description || '';
      const type = res.type || '';
      const category = res.category || '';

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeFilter === 'all' || type === activeFilter;
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [resources, searchTerm, activeFilter, activeCategory]);

  // Récupération sécurisée des catégories
  const categories = ['all', ...new Set(resources.map(r => r.category || 'Non classé').filter(Boolean))];

  // --- UTILITAIRES D'AFFICHAGE ---
  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'video': return { icon: Video, label: 'Vidéo', color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' };
      case 'playlist': return { icon: ListVideo, label: 'Playlist', color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
      case 'pdf': return { icon: FileText, label: 'PDF', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' };
      case 'web': return { icon: Globe, label: 'Site Web', color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' };
      default: return { icon: BookOpen, label: 'Autre', color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' };
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Impression 3D': return <Printer className="w-4 h-4 mr-2" />;
      case 'Sécurité': return <Wrench className="w-4 h-4 mr-2" />;
      case 'Électronique': return <Zap className="w-4 h-4 mr-2" />;
      case 'Fraiseuse CNC': return <Cpu className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* En-tête */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ressources <span className="text-blue-600">Fablab</span></h1>
            </div>
            
            {/* Barre de recherche */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher une doc, un tuto, une machine..."
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Contrôles / Filtres */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Filtres par type */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'}`}>Tous les types</button>
              <button onClick={() => setActiveFilter('video')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'video' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><Video className="w-4 h-4"/> Vidéos</button>
              <button onClick={() => setActiveFilter('playlist')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'playlist' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><ListVideo className="w-4 h-4"/> Playlists</button>
              <button onClick={() => setActiveFilter('pdf')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'pdf' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><FileText className="w-4 h-4"/> PDFs</button>
              <button onClick={() => setActiveFilter('web')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeFilter === 'web' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}><Globe className="w-4 h-4"/> Sites Web</button>
            </div>

            {/* Filtres par catégorie */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 font-medium">Catégorie :</span>
              <select 
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none max-w-[200px]"
              >
                {categories.map(cat => {
                  const catStr = String(cat);
                  return (
                    <option key={catStr} value={catStr}>
                      {catStr === 'all' ? 'Toutes les catégories' : catStr}
                    </option>
                  );
                })}
              </select>
            </div>

          </div>
        </div>

        {/* Grille de résultats */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p>Synchronisation avec Google Drive...</p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredResources.map((resource) => {
              const resType = resource.type || 'autre';
              const { icon: TypeIcon, label, color, bg, border } = getTypeConfig(resType);
              
              return (
                <a 
                  key={resource.id} 
                  href={resource.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <div className={`p-4 border-b border-slate-100 flex items-start justify-between ${bg} bg-opacity-30`}>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${bg} ${color} ${border} border`}>
                      <TypeIcon className="w-3.5 h-3.5 mr-1.5" />
                      {label}
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex items-center text-xs text-slate-500 font-medium mb-2">
                      {getCategoryIcon(resource.category)}
                      {resource.category || 'Non classé'}
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 line-clamp-2">
                      {resource.title || 'Ressource sans titre'}
                    </h3>
                    
                    <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">
                      {resource.description || ''}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100">
                      <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 flex items-center">
                        {resType === 'pdf' ? 'Consulter le document' : 
                         resType === 'video' ? 'Voir la vidéo' : 
                         resType === 'playlist' ? 'Voir la playlist' : 'Ouvrir le lien'}
                         <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Aucune ressource trouvée</h3>
            <p className="mt-1 text-sm text-slate-500">Essayez de modifier vos filtres ou votre recherche.</p>
            <button 
              onClick={() => { setSearchTerm(''); setActiveFilter('all'); setActiveCategory('all'); }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>
    </div>
  );
}