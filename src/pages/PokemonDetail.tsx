import { useParams, useLocation, Link } from "react-router-dom";

const TYPE_COLORS: Record<string, string> = {
  Normal: "#A8A77A", Fire: "#EE8130", Water: "#6390F0", Electric: "#F7D02C",
  Grass: "#7AC74C", Ice: "#96D9D6", Fighting: "#C22E28", Poison: "#A33EA1",
  Ground: "#E2BF65", Flying: "#A98FF3", Psychic: "#F95587", Bug: "#A6B91A",
  Rock: "#B6A136", Ghost: "#735797", Dragon: "#6F35FC", Dark: "#705746",
  Steel: "#B7B7CE", Fairy: "#D685AD", Stellar: "#40B5A5",
};

const needsDarkText = (type: string) => ["Electric", "Ice", "Steel"].includes(type);

interface LocationState {
  thumbnail?: string;
  types?: string[];
  species?: string;
  generation?: string;
}

const PokemonDetail = () => {
  const { name } = useParams<{ name: string }>();
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Search
        </Link>
        <h1 className="text-3xl font-bold text-destructive tracking-tight capitalize">
          {name}
        </h1>
      </header>

      <main className="flex flex-col items-center p-12 gap-6">
        {state.thumbnail && state.thumbnail !== "/placeholder.svg" && (
          <img
            src={state.thumbnail}
            alt={`${name} thumbnail`}
            referrerPolicy="no-referrer"
            className="h-48 w-48 object-contain"
          />
        )}

        <div className="text-center space-y-4">
          <p className="text-4xl font-bold capitalize text-foreground">{name}</p>

          {state.species && (
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Species:</span> {state.species}
            </p>
          )}

          {state.generation && (
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Generation:</span> {state.generation}
            </p>
          )}

          {state.types && state.types.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {state.types.map((type) => (
                <span
                  key={type}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: TYPE_COLORS[type] || "hsl(var(--muted))",
                    color: needsDarkText(type) ? "#333" : "#fff",
                  }}
                >
                  {type}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PokemonDetail;
