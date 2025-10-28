// al inicio:
import { listOpenJobs } from "../lib/jobsApi";
import JobCard from "./JobCard";

// dentro del componente:
const [items, setItems] = useState([]);
const [cursor, setCursor] = useState(null);
const [loadingFeed, setLoadingFeed] = useState(false);
const [hasMore, setHasMore] = useState(true);

async function loadMore() {
  if (loadingFeed || !hasMore) return;
  setLoadingFeed(true);
  try {
    const data = await listOpenJobs({ limit: 12, cursor });
    setItems((s) => s.concat(data));
    if (data.length > 0) setCursor(data[data.length - 1].created_at);
    if (data.length < 12) setHasMore(false);
  } finally {
    setLoadingFeed(false);
  }
}

useEffect(() => { loadMore(); /* eslint-disable-next-line */ }, []);

// en el render, donde quieras la grilla:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(job => (
    <JobCard key={job.id} job={job} />
  ))}
</div>

{!loadingFeed && items.length === 0 && (
  <div className="text-center text-gray-500 mt-10">No hay trabajos.</div>
)}

{hasMore && (
  <div className="mt-6 flex justify-center">
    <button onClick={loadMore} disabled={loadingFeed} className="px-4 py-2 rounded-xl bg-purple-600 text-white disabled:opacity-60">
      {loadingFeed ? "Cargando…" : "Cargar más"}
    </button>
  </div>
)}
