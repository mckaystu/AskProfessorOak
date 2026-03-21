import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CoveoAnalyticsClient } from "coveo.analytics";
import oakAvatar from "./assets/professor-oak.png";
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
    pokemongeneration?: string | string[];
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

function App() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [rgaVisible, setRgaVisible] = useState(false);
  const [oakManuallyOpen, setOakManuallyOpen] = useState(false);
  const engineRef = useRef<any>(null);
  const navigate = useNavigate();

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
          engineRef.current = engine;
          engine.subscribe(() => {
            const state = engine.state;
            setResults(state?.search?.results || []);
            const ga = state?.generatedAnswer;
            const query = state?.query?.q || "";
            const hasAnswer = query.trim().length > 0 && (ga?.isStreaming || (ga?.answer && ga.answer.length > 0));
            setRgaVisible(!!hasAnswer);
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
      <atomic-search-interface
        pipeline="PKSearch"
        search-hub="pokemon-search"
        fields-to-include='["pokemon_thumbnail","description","Body","pokemongeneration","poketype","pokemonname","pokemonspecies"]'
      >
        <header className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center gap-4">
            <img
              src={oakAvatar}
              alt="Professor Oak"
              className="h-12 w-12 rounded-full object-cover border-2 border-primary shadow-sm"
            />
            <h1 className="text-3xl font-bold text-destructive tracking-tight whitespace-nowrap">Ask Professor Oak</h1>
            <div className="flex-1 min-w-0">
              <atomic-search-box placeholder="Search for a Pokémon (e.g., Pikachu or 025)...">
                <atomic-search-box-query-suggestions max-with-query="5" max-without-query="3" />
                <atomic-search-box-recent-queries />
              </atomic-search-box>
            </div>
          </div>
        </header>

        <div className="flex min-h-[calc(100vh-65px)] relative">
          {/* Facet Sidebar */}
          <aside className="facet-sidebar border-r border-border bg-card p-3 overflow-y-auto text-sm" style={{ flex: '0 0 25%' }}>
            <atomic-facet-manager collapse-facets-after="6">
              <atomic-facet
                field="pokemongeneration"
                label="Generation"
                with-search="false"
                display-values-as="checkbox"
                number-of-values="4"
              />
              <atomic-facet
                field="poketype"
                label="Type"
                with-search="false"
                display-values-as="checkbox"
                number-of-values="4"
              />
              <atomic-facet
                field="pokemonspecies"
                label="Species"
                with-search="false"
                display-values-as="checkbox"
                number-of-values="4"
              />
            </atomic-facet-manager>
          </aside>

          {/* Main Results */}
          <main className="flex-1 p-6 overflow-y-auto transition-all duration-300">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <atomic-query-summary />
              <atomic-sort-dropdown>
                <atomic-sort-expression label="Relevance" expression="relevancy" />
                <atomic-sort-expression label="Name A–Z" expression="pokemonname ascending" />
                <atomic-sort-expression label="Name Z–A" expression="pokemonname descending" />
              </atomic-sort-dropdown>
            </div>

            <atomic-breadbox className="mb-4" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
              {results.map((result) => {
                const displayName = getStringField(result.raw?.pokemonname) || result.title;
                const types = getStringArrayField(result.raw?.poketype);
                const species = getStringField(result.raw?.pokemonspecies);
                const generation = getStringField(result.raw?.pokemongeneration);
                const spriteUrl = getThumbnailUrl(result);

                return (
                  <a
                    key={result.uniqueId}
                    onClick={() => {
                      const client = new CoveoAnalyticsClient({
                        token: "xx3824fb63-5208-448c-b651-64d479c921ce",
                      });
                      client.sendClickEvent({
                        documentUri: result.clickUri,
                        documentUriHash: result.uniqueId,
                        documentTitle: displayName,
                        documentPosition: results.indexOf(result) + 1,
                        searchQueryUid: engineRef.current?.state?.search?.searchResponseId || "",
                        sourceName: "pokemon-search",
                        actionCause: "documentOpen",
                      });
                      navigate(`/pokemon/${displayName.toLowerCase()}`, {
                        state: { thumbnail: spriteUrl, types, species, generation },
                      });
                    }}
                    className="result-card-grid group cursor-pointer"
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
                    <span className="mt-2 text-sm font-bold capitalize text-foreground">{displayName}</span>
                    {types.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap justify-center gap-1">
                        {types.map((type) => (
                          <span key={type} className="type-badge" data-type={type.toLowerCase()}>
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                    {(species || generation) && (
                      <div className="mt-1.5 flex flex-wrap justify-center gap-1 text-[0.6rem] text-muted-foreground">
                        {species && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">{species}</span>
                        )}
                        {generation && (
                          <span className="rounded-full bg-secondary px-2 py-0.5 font-medium">{generation}</span>
                        )}
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

          {/* Oak's Corner Toggle Button */}
          {!rgaVisible && !oakManuallyOpen && (
            <button
              onClick={() => setOakManuallyOpen(true)}
              className="absolute right-0 top-4 z-10 flex items-center gap-1 rounded-l-lg border border-r-0 border-border bg-card px-2 py-3 text-destructive shadow-md transition-transform hover:scale-105"
              title="Open Oak's Corner"
            >
              <img src={oakAvatar} alt="Oak" className="h-6 w-6 rounded-full" />
            </button>
          )}

          {/* Oak's Corner Slide-out */}
          <aside
            className={`oaks-corner border-l border-border bg-card p-5 overflow-y-auto transition-all duration-300 ease-in-out ${
              rgaVisible || oakManuallyOpen
                ? "w-[35%] opacity-100"
                : "w-0 p-0 opacity-0 overflow-hidden border-l-0"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4 min-w-[200px]">
              <div className="flex items-center gap-2">
                <img
                  src={oakAvatar}
                  alt="Professor Oak"
                  className="h-8 w-8 rounded-full object-cover border-2 border-destructive shadow-sm"
                />
                <h2 className="text-lg font-bold text-destructive tracking-tight whitespace-nowrap">Oak's Corner</h2>
              </div>
              {!rgaVisible && oakManuallyOpen && (
                <button
                  onClick={() => setOakManuallyOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-sm"
                  title="Close"
                >
                  ✕
                </button>
              )}
            </div>
            <atomic-generated-answer heading-level="2" with-hover-card="true" answer-style="step">
              <atomic-generated-answer-copy-button />
              <atomic-generated-answer-feedback />
            </atomic-generated-answer>
          </aside>
        </div>
      </atomic-search-interface>
    </div>
  );
}

export default App;
