import { useEffect, useState } from "react";
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
  excerpt?: string;
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

const getThumbnailUrl = (result: SearchResult): string => {
  const raw = result.raw?.pokemon_thumbnail;
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  if (typeof raw === "string") return raw;
  return "/placeholder.svg";
};

function App() {
  const [hasQuery, setHasQuery] = useState(false);
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
            const query = state?.query?.q || "";
            setHasQuery(query.trim().length > 0);
            setResults(state?.search?.results || []);
          });

          // Trigger default search on page load
          engine.executeFirstSearch();
        }
      } catch (error) {
        console.error("Failed to initialize Coveo Atomic:", error);
      }
    };

    void init();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-destructive">Pokedex Search</h1>
      </header>

      <div className="mx-auto max-w-3xl">
        <atomic-search-interface
          pipeline="PKSearch"
          search-hub="pokemon-search"
          fields-to-include='["pokemon_thumbnail","pokemongeneration","poketype","pokemonname","pokemonspecies"]'
        >
          <atomic-search-layout>
            <atomic-layout-section section="search">
              <atomic-search-box placeholder="Search for a Pokémon (e.g., Pikachu or 025)..." />
            </atomic-layout-section>

            <atomic-layout-section section="facets">
              <atomic-facet-manager>
                <atomic-facet field="pokemongeneration" label="Generation" with-search="false" display-values-as="checkbox" />
                <atomic-facet field="poketype" label="Pokemon Type" with-search="false" display-values-as="checkbox" />
                <atomic-facet field="pokemonspecies" label="Species" with-search="false" display-values-as="checkbox" />
              </atomic-facet-manager>
            </atomic-layout-section>

            <atomic-layout-section section="main">
              <atomic-layout-section section="status">
                <div className="mb-4 flex items-center justify-between">
                  <atomic-query-summary />
                  <atomic-sort-dropdown>
                    <atomic-sort-expression label="Relevance" expression="relevancy" />
                    <atomic-sort-expression label="Newest" expression="date descending" />
                  </atomic-sort-dropdown>
                </div>
                <atomic-breadbox />
              </atomic-layout-section>

              <atomic-layout-section section="results">
                <div className="space-y-4">
                  {results.map((result) => {
                    const displayName = getStringField(result.raw?.pokemonname);
                    const pokemonType = getStringField(result.raw?.poketype);
                    const pokemonSpecies = getStringField(result.raw?.pokemonspecies);
                    const spriteUrl = getThumbnailUrl(result);

                    return (
                      <article key={result.uniqueId} className="result-card flex gap-4">
                        <img
                          src={spriteUrl}
                          alt={`${displayName || result.title} thumbnail`}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-40 w-40 shrink-0 object-contain"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes("/placeholder.svg")) {
                              target.src = "/placeholder.svg";
                            }
                          }}
                        />
                        <div className="min-w-0">
                          <a
                            href={result.clickUri}
                            target="_blank"
                            rel="noreferrer"
                            className="pokemon-name block hover:underline font-bold text-lg"
                          >
                            {displayName || result.title}
                          </a>
                          {result.excerpt && <p className="pokemon-description">{result.excerpt}</p>}
                          {(pokemonSpecies || pokemonType) && (
                            <div className="mt-2 text-sm font-semibold text-muted-foreground">
                              {pokemonSpecies && <p>Species: {pokemonSpecies}</p>}
                              {pokemonType && <p>Type: {pokemonType}</p>}
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                  {results.length === 0 && <atomic-no-results />}
                  <atomic-query-error />
                </div>
              </atomic-layout-section>

              <atomic-layout-section section="pagination">
                <atomic-pager />
              </atomic-layout-section>
            </atomic-layout-section>
          </atomic-search-layout>
        </atomic-search-interface>
      </div>
    </div>
  );
}

export default App;
