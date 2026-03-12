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
  const [spriteUrls, setSpriteUrls] = useState<Record<string, string>>({});
  const spriteCacheRef = useState(() => new Map<string, string>())[0];

  const getPokemonName = (result: any) => {
    const clickUri = result?.clickUri || result?.uri || "";
    const uriMatch = clickUri.match(/\/pokedex\/([^/?#]+)/i);
    if (uriMatch?.[1]) return uriMatch[1].toLowerCase();

    const thumbnailUrl = result?.raw?.pokemon_thumbnail || "";
    const thumbMatch = thumbnailUrl.match(/\/([^/]+)\.(?:png|jpg|jpeg|webp)$/i);
    return thumbMatch?.[1]?.toLowerCase() ?? "pokemon";
  };

  const toPokeApiSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[’'`.]/g, "")
      .replace(/♀/g, "-f")
      .replace(/♂/g, "-m")
      .replace(/é/g, "e")
      .replace(/\s+/g, "-")
      .replace(/:+/g, "")
      .replace(/-+/g, "-");

  const getSecondaryThumbnailUrl = (pokemonName: string) =>
    `https://img.pokemondb.net/sprites/home/normal/${encodeURIComponent(pokemonName)}.png`;

  const resolveSpriteUrl = async (result: any) => {
    const pokemonName = getPokemonName(result);
    const cached = spriteCacheRef.get(pokemonName);
    if (cached) return cached;

    const slug = toPokeApiSlug(pokemonName);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(slug)}`);
      if (response.ok) {
        const data = await response.json();
        const officialArtwork = data?.sprites?.other?.["official-artwork"]?.front_default;
        const defaultSprite = data?.sprites?.front_default;
        const resolved = officialArtwork || defaultSprite;

        if (resolved) {
          spriteCacheRef.set(pokemonName, resolved);
          return resolved;
        }
      }
    } catch {
      // Ignore and fall through to controlled fallbacks.
    }

    const fallback = result?.raw?.pokemon_thumbnail || getSecondaryThumbnailUrl(pokemonName) || "/placeholder.svg";
    spriteCacheRef.set(pokemonName, fallback);
    return fallback;
  };

  const getPokemonType = (result: any) => {
    const type = result?.raw?.poketype;
    if (Array.isArray(type) && type.length > 0) return String(type[0]);
    if (typeof type === "string") return type;
    return "";
  };

  useEffect(() => {
    const init = async () => {
      await customElements.whenDefined("atomic-search-interface");

      const searchInterface = document.querySelector("atomic-search-interface") as any;
      if (!searchInterface) return;

      try {
        await searchInterface.initialize({
          accessToken: "xx4e0a0e64-3530-4114-b061-91e997542bec",
          organizationId: "pw6jnyqt56qcqeodapy2bii2ji4",
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

  useEffect(() => {
    if (!results.length) return;
    let cancelled = false;

    const loadSprites = async () => {
      const entries = await Promise.all(
        results.map(async (result) => {
          const key = String(result?.uniqueId ?? "");
          if (!key) return null;
          const url = await resolveSpriteUrl(result);
          return [key, url] as const;
        })
      );

      if (cancelled) return;

      setSpriteUrls((prev) => {
        const next = { ...prev };
        let changed = false;

        for (const entry of entries) {
          if (!entry) continue;
          const [key, url] = entry;
          if (next[key] !== url) {
            next[key] = url;
            changed = true;
          }
        }

        return changed ? next : prev;
      });
    };

    void loadSprites();

    return () => {
      cancelled = true;
    };
  }, [results]);
}
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-red-600">Pokedex Search</h1>
      </header>

      <atomic-search-interface
        pipeline="default"
        search-hub="MainSearch"
        fields-to-include='["pokemon_thumbnail","pokemongeneration","poketype"]'
      >
        <atomic-search-layout>
          <atomic-layout-section section="search">
            <atomic-search-box></atomic-search-box>
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

                  return (
                    <article key={result.uniqueId} className="result-card flex gap-4">
                      <img
                        src={getThumbnailUrl(result)}
                        alt={`${pokemonName} thumbnail`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-40 w-40 shrink-0 object-contain"
                        onError={(event) => {
                          const target = event.currentTarget;
                          const secondaryUrl = getSecondaryThumbnailUrl(pokemonName);

                          if (target.dataset.fallbackApplied !== "true") {
                            target.dataset.fallbackApplied = "true";
                            target.src = secondaryUrl;
                            return;
                          }

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
  );
}

export default App;

