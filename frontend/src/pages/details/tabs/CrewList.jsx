export default function CrewList({ crew }) {
  if (!crew?.length) return null;

  // Normalize crew (VERY IMPORTANT for TV vs Movie differences)
  const normalizedCrew = crew.map((p) => ({
    id: p.id,
    name: p.name,
    job: p.job || p.known_for_department || "Crew",
    department: p.department || p.known_for_department || "Crew",
  }));

  // Better dedupe (id + job combination)
  const uniqueCrew = Array.from(
    new Map(normalizedCrew.map((p) => [p.id + p.job, p])).values(),
  );

  const isDirector = (p) =>
    p.job === "Director" || p.department === "Directing";

  const isWriter = (p) =>
    p.job?.toLowerCase().includes("writer") || p.department === "Writing";

  const isProducer = (p) =>
    p.department === "Production" || p.job?.toLowerCase().includes("producer");

  const directors = uniqueCrew.filter(isDirector);
  const writers = uniqueCrew.filter(isWriter);
  const producers = uniqueCrew.filter(isProducer);

  const others = uniqueCrew.filter(
    (p) => !isDirector(p) && !isWriter(p) && !isProducer(p),
  );

  const Section = ({ title, people }) => {
    if (!people.length) return null;

    return (
      <div className="mb-8 text-white-100">
        <h3 className="text-sm font-semibold text-primary-400 mb-3">{title}</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {people.map((person) => (
            <div
              key={`${person.id}-${person.job}`}
              className="bg-black-200 border border-black-300 rounded-lg p-3 hover:bg-black-300 transition"
            >
              <p className="font-medium text-sm text-white-100 line-clamp-1">
                {person.name}
              </p>
              <p className="text-xs text-white-300 line-clamp-1">
                {person.job}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10">
      <h2 className="text-lg font-semibold mb-6">Crew</h2>

      <Section title="Director(s)" people={directors} />
      <Section title="Writers" people={writers} />
      <Section title="Producers" people={producers} />
      <Section title="Other Crew" people={others} />
    </div>
  );
}
