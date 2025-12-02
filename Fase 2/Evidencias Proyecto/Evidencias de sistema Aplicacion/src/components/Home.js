import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Globe2, X, Plus } from "lucide-react";
import { supabase } from "../supabaseClient";
import BottomNav from "./BottomNav";

/* -------- Regiones demo (puedes reemplazar por tu dataset completo) -------- */
const REGIONES = [
  {
    region: "Arica y Parinacota",
    comunas: [
      "Arica",
      "Camarones",
      "General Lagos",
      "Putre",
    ],
  },
  {
    region: "Tarapacá",
    comunas: [
      "Alto Hospicio",
      "Camiña",
      "Colchane",
      "Huara",
      "Iquique",
      "Pica",
      "Pozo Almonte",
    ],
  },
  {
    region: "Antofagasta",
    comunas: [
      "Antofagasta",
      "Calama",
      "María Elena",
      "Mejillones",
      "Ollagüe",
      "San Pedro de Atacama",
      "Sierra Gorda",
      "Taltal",
      "Tocopilla",
    ],
  },
  {
    region: "Atacama",
    comunas: [
      "Alto del Carmen",
      "Caldera",
      "Chañaral",
      "Copiapó",
      "Diego de Almagro",
      "Freirina",
      "Huasco",
      "Tierra Amarilla",
      "Vallenar",
    ],
  },
  {
    region: "Coquimbo",
    comunas: [
      "Andacollo",
      "Canela",
      "Combarbalá",
      "Coquimbo",
      "Illapel",
      "La Higuera",
      "La Serena",
      "Los Vilos",
      "Monte Patria",
      "Ovalle",
      "Paihuano",
      "Punitaqui",
      "Río Hurtado",
      "Salamanca",
      "Vicuña",
    ],
  },
  {
    region: "Valparaíso",
    comunas: [
      "Algarrobo",
      "Cabildo",
      "Calera",
      "Calle Larga",
      "Cartagena",
      "Casablanca",
      "Catemu",
      "Concón",
      "El Quisco",
      "El Tabo",
      "Hijuelas",
      "Isla de Pascua",
      "Juan Fernández",
      "La Cruz",
      "La Ligua",
      "Limache",
      "Llay-Llay",
      "Los Andes",
      "Nogales",
      "Olmué",
      "Panquehue",
      "Papudo",
      "Petorca",
      "Puchuncaví",
      "Putaendo",
      "Quillota",
      "Quilpué",
      "Quintero",
      "San Antonio",
      "San Esteban",
      "San Felipe",
      "Santa María",
      "Santo Domingo",
      "Valparaíso",
      "Villa Alemana",
      "Viña del Mar",
      "Zapallar",
    ],
  },
  {
    region: "Región Metropolitana de Santiago",
    comunas: [
      "Alhué",
      "Buin",
      "Calera de Tango",
      "Cerrillos",
      "Cerro Navia",
      "Colina",
      "Conchalí",
      "Curacaví",
      "El Bosque",
      "El Monte",
      "Estación Central",
      "Huechuraba",
      "Independencia",
      "Isla de Maipo",
      "La Cisterna",
      "La Florida",
      "La Granja",
      "La Pintana",
      "La Reina",
      "Lampa",
      "Las Condes",
      "Lo Barnechea",
      "Lo Espejo",
      "Lo Prado",
      "Macul",
      "Maipú",
      "María Pinto",
      "Melipilla",
      "Ñuñoa",
      "Padre Hurtado",
      "Paine",
      "Pedro Aguirre Cerda",
      "Peñaflor",
      "Peñalolén",
      "Pirque",
      "Providencia",
      "Pudahuel",
      "Quilicura",
      "Quinta Normal",
      "Recoleta",
      "Renca",
      "San Bernardo",
      "San Joaquín",
      "San José de Maipo",
      "San Miguel",
      "San Pedro",
      "San Ramón",
      "Santiago",
      "Talagante",
      "Tiltil",
      "Vitacura",
    ],
  },
  {
    region: "Libertador General Bernardo O'Higgins",
    comunas: [
      "Chépica",
      "Chimbarongo",
      "Codegua",
      "Coinco",
      "Coltauco",
      "Doñihue",
      "Graneros",
      "La Estrella",
      "Las Cabras",
      "Litueche",
      "Lolol",
      "Machalí",
      "Malloa",
      "Marchihue",
      "Nancagua",
      "Navidad",
      "Olivar",
      "Palmilla",
      "Paredones",
      "Peralillo",
      "Peumo",
      "Pichidegua",
      "Pichilemu",
      "Placilla",
      "Pumanque",
      "Quinta de Tilcoco",
      "Rancagua",
      "Rengo",
      "Requínoa",
      "San Fernando",
      "San Vicente",
      "Santa Cruz",
    ],
  },
  {
    region: "Maule",
    comunas: [
      "Cauquenes",
      "Chanco",
      "Colbún",
      "Constitución",
      "Curepto",
      "Curicó",
      "Empedrado",
      "Hualañé",
      "Licantén",
      "Linares",
      "Longaví",
      "Maule",
      "Molina",
      "Parral",
      "Pelarco",
      "Pelluhue",
      "Pencahue",
      "Rauco",
      "Retiro",
      "Río Claro",
      "Romeral",
      "Sagrada Familia",
      "San Clemente",
      "San Javier",
      "San Rafael",
      "Talca",
      "Teno",
      "Vichuquén",
      "Villa Alegre",
      "Yerbas Buenas",
    ],
  },
  {
    region: "Ñuble",
    comunas: [
      "Bulnes",
      "Chillán",
      "Chillán Viejo",
      "Cobquecura",
      "Coelemu",
      "Coihueco",
      "El Carmen",
      "Ninhue",
      "Ñiquén",
      "Pemuco",
      "Pinto",
      "Portezuelo",
      "Quillón",
      "Quirihue",
      "Ránquil",
      "San Carlos",
      "San Fabián",
      "San Ignacio",
      "San Nicolás",
      "Treguaco",
      "Yungay",
    ],
  },
  {
    region: "Biobío",
    comunas: [
      "Alto Biobío",
      "Antuco",
      "Arauco",
      "Cabrero",
      "Cañete",
      "Chiguayante",
      "Concepción",
      "Contulmo",
      "Coronel",
      "Curanilahue",
      "Florida",
      "Hualpén",
      "Hualqui",
      "Laja",
      "Lebu",
      "Los Álamos",
      "Los Ángeles",
      "Lota",
      "Mulchén",
      "Nacimiento",
      "Negrete",
      "Penco",
      "Quilaco",
      "Quilleco",
      "San Pedro de la Paz",
      "San Rosendo",
      "Santa Bárbara",
      "Santa Juana",
      "Talcahuano",
      "Tirúa",
      "Tomé",
      "Tucapel",
      "Yumbel",
    ],
  },
  {
    region: "La Araucanía",
    comunas: [
      "Angol",
      "Carahue",
      "Cholchol",
      "Collipulli",
      "Cunco",
      "Curacautín",
      "Curarrehue",
      "Ercilla",
      "Freire",
      "Galvarino",
      "Gorbea",
      "Lautaro",
      "Loncoche",
      "Lonquimay",
      "Los Sauces",
      "Lumaco",
      "Melipeuco",
      "Nueva Imperial",
      "Padre Las Casas",
      "Perquenco",
      "Pitrufquén",
      "Pucón",
      "Purén",
      "Renaico",
      "Saavedra",
      "Temuco",
      "Teodoro Schmidt",
      "Toltén",
      "Traiguén",
      "Victoria",
      "Vilcún",
      "Villarrica",
    ],
  },
  {
    region: "Los Ríos",
    comunas: [
      "Corral",
      "Futrono",
      "La Unión",
      "Lago Ranco",
      "Lanco",
      "Los Lagos",
      "Máfil",
      "Mariquina",
      "Paillaco",
      "Panguipulli",
      "Río Bueno",
      "Valdivia",
    ],
  },
  {
    region: "Los Lagos",
    comunas: [
      "Ancud",
      "Calbuco",
      "Castro",
      "Chaitén",
      "Chonchi",
      "Cochamó",
      "Curaco de Vélez",
      "Dalcahue",
      "Fresia",
      "Frutillar",
      "Futaleufú",
      "Hualaihué",
      "Llanquihue",
      "Los Muermos",
      "Maullín",
      "Osorno",
      "Palena",
      "Puerto Montt",
      "Puerto Octay",
      "Puerto Varas",
      "Puqueldón",
      "Purranque",
      "Puyehue",
      "Queilén",
      "Quellón",
      "Quemchi",
      "Quinchao",
      "Río Negro",
      "San Juan de la Costa",
      "San Pablo",
    ],
  },
  {
    region: "Aysén del General Carlos Ibáñez del Campo",
    comunas: [
      "Aysén",
      "Chile Chico",
      "Cisnes",
      "Cochrane",
      "Coihaique",
      "Guaitecas",
      "Lago Verde",
      "O'Higgins",
      "Río Ibáñez",
      "Tortel",
    ],
  },
  {
    region: "Magallanes y de la Antártica Chilena",
    comunas: [
      "Antártica",
      "Cabo de Hornos",
      "Laguna Blanca",
      "Natales",
      "Porvenir",
      "Primavera",
      "Punta Arenas",
      "Río Verde",
      "San Gregorio",
      "Timaukel",
      "Torres del Paine",
    ],
  },
];

/* -------- Chips de categoría para el Home -------- */
const CATEGORY_CHIPS = ["Hogar", "Servicio", "Academico", "Voluntariado"];

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(""); // <-- chip activo
  const [showFilter, setShowFilter] = useState(false);
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");

  const [unreadCount, setUnreadCount] = useState(0); // 🔔

  const comunasDisponibles = useMemo(() => {
    if (!region) return [];
    const r = REGIONES.find((x) => x.region === region);
    return r ? r.comunas : [];
  }, [region]);

  const flash = location.state?.flash;

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      setSession(s.session || null);

      if (s.session?.user?.id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id,user_id,full_name,name,lastname,email,photo_url,avatar_url")
          .or(`id.eq.${s.session.user.id},user_id.eq.${s.session.user.id}`)
          .maybeSingle();
        setProfile(p || null);

        // 🔔 carga inicial de no leídas
        const { count: firstCount } = await supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", s.session.user.id)
          .eq("is_read", false);
        setUnreadCount(firstCount || 0);

        // 🔔 realtime para badge
        const ch = supabase
          .channel(`notifs-${s.session.user.id}`)
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${s.session.user.id}` },
            async () => {
              const { count } = await supabase
                .from("notifications")
                .select("id", { count: "exact", head: true })
                .eq("user_id", s.session.user.id)
                .eq("is_read", false);
              setUnreadCount(count || 0);
            }
          )
          .subscribe();

        return () => supabase.removeChannel(ch);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { data: jobsData, error } = await supabase
        .from("jobs")
        .select("id,user_id,title,description,category,region,commune,budget_numeric,currency,is_volunteer,created_at")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }
      setJobs(jobsData || []);

      const ownerIds = Array.from(new Set((jobsData || []).map((j) => j.user_id).filter(Boolean)));
      if (ownerIds.length) {
        const { data: owners } = await supabase
          .from("profiles")
          .select("user_id,full_name,name,lastname,email,photo_url,avatar_url")
          .in("user_id", ownerIds);

        const map = {};
        (owners || []).forEach((p) => (map[p.user_id] = p));
        setProfilesById(map);
      }

      setLoading(false);
    })();
  }, []);

  const displayName = (p) => {
    if (!p) return "Usuario";
    const n = p.full_name || `${p.name || ""} ${p.lastname || ""}`.trim();
    if (n) return n;
    if (p.email) return p.email.split("@")[0];
    return "Usuario";
  };

  const initials = (() => {
    const fn = displayName(profile);
    return fn
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase();
  })();

  const matchesCategory = (job) => {
    if (!selectedCategory) return true;
    if (selectedCategory === "Academico") {
      // compatibilidad con jobs antiguos guardados como "Académico"
      return job.category === "Academico" || job.category === "Académico";
    }
    return job.category === selectedCategory;
  };

  const filtered = jobs.filter((j) => {
    const txt = `${j.title || ""} ${j.description || ""} ${j.category || ""} ${j.commune || ""} ${j.region || ""}`.toLowerCase();
    const okText = !searchText || txt.includes(searchText.toLowerCase());
    const okRegion = !region || j.region === region;
    const okCommune = !commune || j.commune === commune;
    const okCat = matchesCategory(j);
    return okText && okRegion && okCommune && okCat;
  });

  const priceOf = (j) =>
    j.is_volunteer
      ? "Voluntariado"
      : j.budget_numeric
      ? `${new Intl.NumberFormat("es-CL").format(j.budget_numeric)} ${j.currency || "CLP"}`
      : "Presupuesto a convenir";

  const toggleChip = (c) => setSelectedCategory((prev) => (prev === c ? "" : c));

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-purple-100">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          {/* Perfil */}
          <Link
            to="/profile"
            className="relative w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold"
            title="Mi perfil"
          >
            {profile?.photo_url || profile?.avatar_url ? (
              <img
                src={profile.photo_url || profile.avatar_url}
                alt="Foto de perfil"
                className="h-full w-full object-cover rounded-full"
              />
            ) : (
              <span>{initials}</span>
            )}
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-purple-700 font-[Poppins] select-none">
            SWAPPING
          </h1>

          {/* 🔔 Notificaciones con badge */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-2 rounded-full hover:bg-purple-100 text-purple-600"
            title="Notificaciones"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Search + Filter */}
        <div className="px-4 pb-3 bg-white/60 backdrop-blur">
          <div className="relative max-w-5xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Buscar por título, comuna, categoría…"
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
              />
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-purple-500" />
              {searchText && (
                <button
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchText("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilter((s) => !s)}
              className="px-3 py-2 rounded-xl text-sm bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200"
            >
              <span className="inline-flex items-center gap-2">
                <Globe2 className="w-4 h-4" />
                Filtros
              </span>
            </button>
          </div>

          {/* Chips de categoría */}
          <div className="max-w-5xl mx-auto mt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORY_CHIPS.map((c) => {
              const active = selectedCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => toggleChip(c)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm border transition
                    ${
                      active
                        ? "bg-purple-600 text-white border-purple-600 shadow"
                        : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                    }`}
                  aria-pressed={active}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {showFilter && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 overflow-hidden"
              >
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-sm focus:ring-2 focus:ring-purple-300"
                >
                  <option value="">Todas las regiones</option>
                  {REGIONES.map((r) => (
                    <option key={r.region} value={r.region}>
                      {r.region}
                    </option>
                  ))}
                </select>

                <select
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-sm focus:ring-2 focus:ring-purple-300"
                  disabled={!region}
                >
                  <option value="">{region ? "Todas las comunas" : "Selecciona región primero"}</option>
                  {comunasDisponibles.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <div className="flex justify-between pt-2">
                  <button
                    className="text-sm text-purple-700 hover:underline"
                    onClick={() => {
                      setRegion("");
                      setCommune("");
                      setSelectedCategory("");
                    }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-5xl px-4 py-4">
        {flash && (
          <div className="mb-3 text-sm p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            {flash}
          </div>
        )}

        <p className="text-sm text-gray-500">
          {loading ? "Cargando…" : `${filtered.length} resultados${selectedCategory ? ` • ${selectedCategory}` : ""}`}
        </p>

        <div className="grid grid-cols-1 gap-4">
          {filtered.map((j) => {
            const isMine = session?.user?.id === j.user_id;
            const owner = profilesById[j.user_id] || null;
            const name =
              (owner?.full_name ||
                `${owner?.name || ""} ${owner?.lastname || ""}`.trim() ||
                owner?.email?.split("@")[0] ||
                "Usuario") + " | Empleador";
            const avatar =
              owner?.photo_url ||
              owner?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(owner?.full_name || "Usuario")}`;

            return (
              <motion.article
                key={j.id}
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="relative rounded-2xl bg-white shadow-sm border border-purple-100 p-4 flex flex-col hover:shadow-xl transition"
              >
                {isMine && (
                  <div className="absolute top-2 right-3 text-[11px] font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Mi publicación
                  </div>
                )}

                {/* Publicador */}
                <div className="flex items-center gap-2 mb-2">
                  <img src={avatar} alt="owner" className="w-8 h-8 rounded-full object-cover border" />
                  <div className="text-xs">
                    <p className="font-semibold leading-tight">{name}</p>
                    <p className="text-[11px] text-gray-500">Publicador</p>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 text-base">{j.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{j.description}</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    {j.category && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs">
                        {j.category}
                      </span>
                    )}
                    {j.commune && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-xs">
                        {j.commune}
                      </span>
                    )}
                  </div>

                  <span className="text-sm font-semibold text-gray-900">{priceOf(j)}</span>
                </div>

                <div className="flex justify-end mt-3">
                  <Link
                    to={`/job/${j.id}`}
                    className={`px-3 py-1 rounded-lg text-sm shadow-sm transition ${
                      isMine ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                    }`}
                  >
                    Ver detalles
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      </main>

      {/* Botón flotante Publicar */}
      <Link
        to="/publish"
        className="fixed bottom-24 left-5 bg-purple-200 text-purple-800 px-4 py-3 rounded-2xl shadow-md flex items-center gap-2 hover:bg-purple-300 transition z-50 backdrop-blur-md"
        aria-label="Publicar trabajo"
      >
        <Plus size={22} strokeWidth={3} />
        <span className="font-semibold text-sm">Publicar</span>
      </Link>

      <BottomNav />
    </div>
  );
}
