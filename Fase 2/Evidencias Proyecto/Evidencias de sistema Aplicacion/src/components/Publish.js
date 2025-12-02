import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import BottomNav from "./BottomNav";

/* Región -> Comunas (ajusta si tienes tu dataset completo) */
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

const CATEGORIAS = [
  { label: "Hogar",       value: "Hogar" },
  { label: "Servicio", value: "Servicio" },
  { label: "Académico", value: "Académico" },
  { label: "Voluntariado", value: "Voluntariado" },
];

export default function Publish() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [hasProfile, setHasProfile] = useState(true); // aviso suave si no hay perfil

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [commune, setCommune] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("");
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [date, setDate] = useState("");

  // Cargar sesión y (solo informar) si existe perfil
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }
      setSession(session);

      // NO redirige si no hay perfil: solo muestra un aviso
      const { data: prof1 } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .maybeSingle();

      if (prof1) {
        setHasProfile(true);
        return;
      }

      const { data: prof2 } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      setHasProfile(!!prof2);
    })();
  }, [navigate]);

  const comunasDisponibles = useMemo(() => {
    if (!region) return [];
    return REGIONES.find((r) => r.region === region)?.comunas || [];
  }, [region]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg("");

      const { data: { session: s } } = await supabase.auth.getSession();
      if (!s) throw new Error("Debes iniciar sesión.");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        region,
        commune,
        city: city || null,
        address: address || null,
        is_volunteer: isVolunteer,
        budget_numeric: isVolunteer ? null : Number(payment) || null,
        currency: "CLP",
        status: "open",
        date: date || null,
        user_id: s.user.id, // asegura el dueño
      };

      const { data, error } = await supabase
        .from("jobs")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      navigate("/home", {
        state: { flash: "¡Trabajo publicado exitosamente!", newJobId: data.id },
        replace: true,
      });
    } catch (err) {
      setErrorMsg(err.message || "Error al publicar el trabajo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 max-w-md mx-auto pt-4 pb-20">
      <motion.div
        className="bg-white rounded-3xl p-6 shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-xl font-bold mb-3">Publicar un trabajo</h1>

        {!hasProfile && (
          <div className="mb-3 text-sm p-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            Aún no has completado tu perfil. Puedes publicarlo de todas formas, pero te
            recomendamos <button
              onClick={() => navigate("/profile/create")}
              className="underline font-semibold"
              type="button"
            >
              crear tu perfil
            </button>{" "}
            para dar más confianza a los postulantes.
          </div>
        )}

        {errorMsg && (
          <div className="mb-3 text-sm p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            placeholder="Título del trabajo"
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            placeholder="Describe el trabajo…"
            required
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            required
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            required
          >
            <option value="">Selecciona una región</option>
            {REGIONES.map((r) => (
              <option key={r.region} value={r.region}>
                {r.region}
              </option>
            ))}
          </select>

          <select
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            required
            disabled={!region}
          >
            <option value="">{region ? "Selecciona comuna" : "Selecciona región primero"}</option>
            {comunasDisponibles.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            placeholder="Ciudad (opcional)"
          />

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            placeholder="Dirección"
          />

          <div className="flex items-center gap-2">
            <input
              id="isVol"
              type="checkbox"
              checked={isVolunteer}
              onChange={(e) => setIsVolunteer(e.target.checked)}
            />
            <label htmlFor="isVol" className="text-sm">Es voluntariado (sin pago)</label>
          </div>

          {!isVolunteer && (
            <input
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
              placeholder="Presupuesto (CLP)"
              type="number"
              min="0"
            />
          )}

          <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-300"
            placeholder="Fecha (opcional)"
            type="date"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold disabled:bg-gray-300"
          >
            {loading ? "Publicando…" : "Publicar"}
          </button>
        </form>
      </motion.div>

      <BottomNav />
    </div>
  );
}
