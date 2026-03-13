import { useEffect, useState } from "react";
import "./App.css";

// Tell TypeScript/React to ignore the custom Atomic tags
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

function App() {
  const [hasQuery, setHasQuery] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const getPokemonName = (result: any) => {
    const clickUri = result?.clickUri || result?.uri || "";
    const uriMatch = clickUri.match(/\/pokedex\/([^/?#]+)/i);
    if (uriMatch?.[1]) return uriMatch[1].toLowerCase();

    const rawThumbnail = result?.raw?.pokemon_thumbnail;
    const thumbnailUrl = Array.isArray(rawThumbnail) && rawThumbnail.length > 0
      ? rawThumbnail[0]
      : (typeof rawThumbnail === "string" ? rawThumbnail : "");
    const thumbMatch = thumbnailUrl.match(/\/([^/]+)\.(?:png|jpg|jpeg|webp)$/i);
    return thumbMatch?.[1]?.toLowerCase() ?? "pokemon";
  };

  const getThumbnailUrl = (result: any) => {
    const rawThumbnail = result?.raw?.pokemon_thumbnail;
    const url = Array.isArray(rawThumbnail) && rawThumbnail.length > 0 
      ? rawThumbnail[0] 
      : (typeof rawThumbnail === "string" ? rawThumbnail : "/placeholder.svg");
    return url;
  };

  const getPokemonType = (result: any) => {
    const type = result?.raw?.poketype;
    if (Array.isArray(type) && type.length > 0) return String(type[0]);
    if (typeof type === "string") return type;
    return "";
  };

  const getDisplayPokemonName = (result: any) => {
    const name = result?.raw?.pokemonname;
    if (Array.isArray(name) && name.length > 0) return String(name[0]);
    if (typeof name === "string") return name;
    return "";
  };

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
        }
      } catch (error) {
        console.error("Failed to initialize Coveo Atomic:", error);
      }
    };

    void init();
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-red-600">Pokedex Search</h1>
      </header>

      <div className="mx-auto max-w-3xl">
        <atomic-search-interface
          pipeline="default"
          search-hub="MainSearch"
          fields-to-include='["pokemon_thumbnail","pokemongeneration","poketype","pokemonname"]'
        >
          <atomic-search-layout>
            <atomic-layout-section section="search">
              <atomic-search-box placeholder="Search for a Pokémon (e.g., Pikachu or 025)..."></atomic-search-box>
            </atomic-layout-section>

          <atomic-layout-section section="facets" class={hasQuery ? "" : "hidden-section"}>
            <atomic-facet-manager>
              <atomic-facet
                field="pokemongeneration"
                label="Generation"
                with-search="false"
                display-values-as="checkbox"
              ></atomic-facet>
              <atomic-facet field="poketype" label="Pokemon Type" with-search="false" display-values-as="checkbox"></atomic-facet>
            </atomic-facet-manager>
          </atomic-layout-section>

          <atomic-layout-section section="main" class={hasQuery ? "" : "hidden-section"}>
            <atomic-layout-section section="status">
              <div className="mb-4 flex items-center justify-between">
                <atomic-query-summary></atomic-query-summary>
                <atomic-sort-dropdown>
                  <atomic-sort-expression label="Relevance" expression="relevancy" />
                  <atomic-sort-expression label="Newest" expression="date descending" />
                </atomic-sort-dropdown>
              </div>
              <atomic-breadbox></atomic-breadbox>
            </atomic-layout-section>

            <atomic-layout-section section="results">
              <div className="space-y-4">
                {results.map((result) => {
                  const pokemonName = getPokemonName(result);
                  const pokemonType = getPokemonType(result);
                  const spriteUrl = getThumbnailUrl(result) || "/placeholder.svg";

                  return (
                    <article key={result.uniqueId} className="result-card flex gap-4">
                      <img
                        src={spriteUrl}
                        alt={`${pokemonName} thumbnail`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-40 w-40 shrink-0 object-contain"
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (!target.src.includes("/placeholder.svg")) {
                            target.src = "/placeholder.svg";
                          }
                        }}
                      />

                      <div className="min-w-0">
                        <a href={result.clickUri} target="_blank" rel="noreferrer" className="pokemon-name block hover:underline">
                          {result.title}
                        </a>
                        <p className="pokemon-description">{result.excerpt}</p>
                        {pokemonType ? <p className="mt-2 text-sm font-semibold text-gray-600">{pokemonType}</p> : null}
                      </div>
                    </article>
                  );
                })}

                {results.length === 0 ? <atomic-no-results></atomic-no-results> : null}
                <atomic-query-error></atomic-query-error>
              </div>
            </atomic-layout-section>

            <atomic-layout-section section="pagination">
              <atomic-pager></atomic-pager>
            </atomic-layout-section>
          </atomic-layout-section>
        </atomic-search-layout>
      </atomic-search-interface>
      </div>
    </div>
  );
}

export default App;

