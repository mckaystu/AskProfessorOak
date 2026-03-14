import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

interface SearchResult {
  uniqueId: string;
  title: string;
  clickUri: string;
  raw?: {
    pokemon_thumbnail?: string | string[];
    poketype?: string | string[];
    pokemonname?: string | string[];
    pokemonspecies?: string | string[];
  };
}

const getStringField = (value: unknown): string => {
  if (Array.isArray(value) && value.length > 0) return String(value[0]);
  if (typeof value === "string") return value;
  return "";
};

const getStringArrayField = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
};

const getThumbnailUrl = (result: SearchResult): string => {
  const raw = result.raw?.pokemon_thumbnail;
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  if (typeof raw === "string") return raw;
  return "/placeholder.svg";
};

const TYPE_COLORS: Record<string, string> = {
  Normal: "#A8A77A", Fire: "#EE8130", Water: "#6390F0", Electric: "#F7D02C",
  Grass: "#7AC74C", Ice: "#96D9D6", Fighting: "#C22E28", Poison: "#A33EA1",
  Ground: "#E2BF65", Flying: "#A98FF3", Psychic: "#F95587", Bug: "#A6B91A",
  Rock: "#B6A136", Ghost: "#735797", Dragon: "#6F35FC", Dark: "#705746",
  Steel: "#B7B7CE", Fairy: "#D685AD", Stellar: "#40B5A5",
};

const needsDarkText = (type: string) => ["Electric", "Ice", "Steel"].includes(type);

function App() {
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const init = async () => {
      await customElements.whenDefined("atomic-search-interface");

      const searchInterface = document.querySelector("atomic-search-interface") as any;
      if (!searchInterface) return;

      try {
        await searchInterface.initialize({
          accessToken: "xx3824fb63-5208-448c-b651-64d479c921ce",
          organizationId: "stumckaytechnicalsuccesspokemontestmh1o8r76",
        });

        const engine = searchInterface.engine;
        if (engine) {
          engine.subscribe(() => {
            const state = engine.state;
            setResults(state?.search?.results || []);
          });
          engine.executeFirstSearch();
        }
      } catch (error) {
        console.error("Failed to initialize Coveo Atomic:", error);
      }
    };

    void init();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-3xl font-bold text-destructive tracking-tight">Pokédex Search</h1>
      </header>

      <atomic-search-interface
        pipeline="PKSearch"
        search-hub="pokemon-search"
        fields-to-include='["pokemon_thumbnail","pokemongeneration","poketype","pokemonname","pokemonspecies"]'
      >
        <div className="flex min-h-[calc(100vh-65px)]">
          {/* Sidebar Facets */}
          <aside className="facet-sidebar w-72 shrink-0 border-r border-border bg-card p-5 overflow-y-auto">
            <atomic-facet-manager>
              <atomic-facet field="poketype" label="Type" with-search="false" display-values-as="checkbox" />
              <atomic-facet field="pokemongeneration" label="Generation" with-search="false" display-values-as="checkbox" />
              <atomic-facet field="pokemonspecies" label="Species" with-search="false" display-values-as="checkbox" />
            </atomic-facet-manager>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <atomic-search-box placeholder="Search for a Pokémon (e.g., Pikachu or 025)..." />
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <atomic-query-summary />
              <atomic-sort-dropdown>
                <atomic-sort-expression label="Relevance" expression="relevancy" />
                <atomic-sort-expression label="Name A–Z" expression="pokemonname ascending" />
                <atomic-sort-expression label="Name Z–A" expression="pokemonname descending" />
              </atomic-sort-dropdown>
            </div>

            <atomic-breadbox className="mb-4" />

            {/* Grid Results */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((result) => {
                const displayName = getStringField(result.raw?.pokemonname) || result.title;
                const types = getStringArrayField(result.raw?.poketype);
                const spriteUrl = getThumbnailUrl(result);

                return (
                  <Link
                    key={result.uniqueId}
                    to={`/pokemon/${displayName.toLowerCase()}`}
                    className="result-card-grid group"
                  >
                    <img
                      src={spriteUrl}
                      alt={`${displayName} thumbnail`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-28 w-28 object-contain transition-transform group-hover:scale-110"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("/placeholder.svg")) {
                          target.src = "/placeholder.svg";
                        }
                      }}
                    />
                    <span className="mt-2 text-sm font-bold capitalize text-foreground">
                      {displayName}
                    </span>
                    {types.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                        {types.map((type) => (
                          <span
                            key={type}
                            className="type-badge"
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
                  </a>
                );
              })}
            </div>

            {results.length === 0 && <atomic-no-results />}
            <atomic-query-error />

            <div className="mt-8 flex justify-center">
              <atomic-pager />
            </div>
          </main>
        </div>
      </atomic-search-interface>
    </div>
  );
}

export default App;
