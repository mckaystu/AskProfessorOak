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

  useEffect(() => {
    // Inject the result list with template via DOM BEFORE Coveo initializes
    const resultsContainer = document.getElementById("atomic-results-container");
    if (resultsContainer && !resultsContainer.querySelector("atomic-result-list")) {
      resultsContainer.innerHTML = `
        <atomic-result-list display="list" image-size="small">
          <atomic-result-template>
            <template>
              <atomic-result-section-visual>
                <img
                  class="pokemon-thumbnail"
                  src="/placeholder.svg"
                  alt="Pokemon thumbnail"
                  loading="lazy"
                  data-pokemon-image="true"
                />
              </atomic-result-section-visual>
              <atomic-result-section-title>
                <atomic-result-link></atomic-result-link>
              </atomic-result-section-title>
              <atomic-result-section-excerpt>
                <atomic-result-text field="excerpt"></atomic-result-text>
              </atomic-result-section-excerpt>
              <atomic-result-section-bottom-metadata>
                <atomic-result-badge field="poketype"></atomic-result-badge>
              </atomic-result-section-bottom-metadata>
            </template>
          </atomic-result-template>
        </atomic-result-list>
        <atomic-query-error></atomic-query-error>
        <atomic-no-results></atomic-no-results>
      `;
    }

    const spriteCache = new Map<string, string>();

    const getPokemonNameFromCard = (card: Element) => {
      const link = card.querySelector<HTMLAnchorElement>("a[href*='/pokedex/']");
      const href = link?.getAttribute("href") || "";
      const hrefMatch = href.match(/\/pokedex\/([^/?#]+)/i);
      if (hrefMatch?.[1]) return hrefMatch[1].toLowerCase();

      const headingText = (link?.textContent || card.textContent || "").trim();
      const textMatch = headingText.match(/^([A-Za-z0-9-]+)/);
      return textMatch?.[1]?.toLowerCase() ?? null;
    };

    const fetchSpriteUrl = async (name: string) => {
      const cached = spriteCache.get(name);
      if (cached) return cached;

      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error("Failed to fetch sprite");

        const data = await response.json();
        const spriteUrl =
          data?.sprites?.other?.["official-artwork"]?.front_default ||
          data?.sprites?.other?.home?.front_default ||
          data?.sprites?.front_default ||
          "/placeholder.svg";

        spriteCache.set(name, spriteUrl);
        return spriteUrl;
      } catch {
        spriteCache.set(name, "/placeholder.svg");
        return "/placeholder.svg";
      }
    };

    const hydrateResultImages = async () => {
      const resultList = document.querySelector("atomic-result-list") as HTMLElement & {
        shadowRoot?: ShadowRoot | null;
      };
      const queryRoot = resultList?.shadowRoot ?? resultList;
      if (!queryRoot) return;

      const resultCards = Array.from(queryRoot.querySelectorAll("atomic-result"));
      if (!resultCards.length) return;

      await Promise.all(
        resultCards.map(async (card) => {
          const img = card.querySelector<HTMLImageElement>("img.pokemon-thumbnail");
          if (!img) return;

          const pokemonName = getPokemonNameFromCard(card);
          if (!pokemonName) {
            img.src = "/placeholder.svg";
            return;
          }

          if (img.dataset.resultKey === pokemonName) return;

          img.dataset.resultKey = pokemonName;
          img.alt = `${pokemonName} thumbnail`;
          img.src = await fetchSpriteUrl(pokemonName);
        })
      );
    };

    const scheduleHydrateResultImages = () => {
      requestAnimationFrame(() => {
        void hydrateResultImages();
        window.setTimeout(() => {
          void hydrateResultImages();
        }, 120);
      });
    };

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
          const observer = new MutationObserver(() => {
            scheduleHydrateResultImages();
          });

          if (resultsContainer) {
            observer.observe(resultsContainer, { childList: true, subtree: true });
          }

          engine.subscribe(() => {
            const state = engine.state;
            const query = state?.query?.q || "";
            setHasQuery(query.trim().length > 0);
            scheduleHydrateResultImages();
          });
        }
      } catch (error) {
        console.error("Failed to initialize Coveo Atomic:", error);
      }
    };

    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-red-600">Pokedex Search</h1>
      </header>

      <atomic-search-interface pipeline="default" search-hub="MainSearch" fields-to-include='["pokemon_thumbnail","pokemongeneration","poketype"]'>
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
              <atomic-facet
                field="poketype"
                label="Pokemon Type"
                with-search="false"
                display-values-as="checkbox"
              ></atomic-facet>
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
              <div id="atomic-results-container"></div>
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
