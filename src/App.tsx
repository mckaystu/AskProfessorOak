import { useEffect, useRef } from "react";
import oakAvatar from "./assets/professor-oak.png";
import "./App.css";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

function App() {
  const resultListRef = useRef<HTMLElement>(null);

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
          engine.executeFirstSearch();
        }
      } catch (error) {
        console.error("Failed to initialize Coveo Atomic:", error);
      }
    };

    // Inject the template into atomic-result-list since React can't render inside <template>
    if (resultListRef.current) {
      const templateEl = document.createElement("atomic-result-template");
      const tpl = document.createElement("template");
      tpl.innerHTML = `
        <style>
          .result-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
            border: 1px solid hsl(var(--border));
            border-radius: 12px;
            background: hsl(var(--card));
            transition: box-shadow 0.2s, transform 0.2s;
            text-align: center;
            cursor: pointer;
          }
          .result-card:hover {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            transform: translateY(-2px);
          }
          atomic-result-image img {
            height: 112px;
            width: 112px;
            object-fit: contain;
          }
          .result-name {
            margin-top: 8px;
            font-size: 0.875rem;
            font-weight: 700;
            text-transform: capitalize;
            color: hsl(var(--foreground));
          }
          .result-types {
            margin-top: 6px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 4px;
          }
          .result-meta {
            margin-top: 6px;
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 4px;
            font-size: 0.6rem;
            color: hsl(var(--muted-foreground));
          }
          .result-meta span {
            background: hsl(var(--secondary));
            border-radius: 9999px;
            padding: 2px 8px;
            font-weight: 500;
          }
        </style>
        <div class="result-card">
          <atomic-result-image field="pokemon_thumbnail" fallback="/placeholder.svg"></atomic-result-image>
          <atomic-result-link class="result-name"></atomic-result-link>
          <div class="result-types">
            <atomic-result-multi-value-text field="poketype"></atomic-result-multi-value-text>
          </div>
          <div class="result-meta">
            <atomic-field-condition class="result-meta-item" if-defined="pokemonspecies">
              <span><atomic-result-text field="pokemonspecies"></atomic-result-text></span>
            </atomic-field-condition>
            <atomic-field-condition class="result-meta-item" if-defined="pokemongeneration">
              <span><atomic-result-text field="pokemongeneration"></atomic-result-text></span>
            </atomic-field-condition>
          </div>
        </div>
      `;
      templateEl.appendChild(tpl);
      resultListRef.current.appendChild(templateEl);
    }

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
        <div className="flex min-h-[calc(100vh-65px)]">
          {/* Sidebar Facets */}
          <aside className="facet-sidebar w-72 shrink-0 border-r border-border bg-card p-5 overflow-y-auto">
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

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {/* --- RGA COMPONENT --- */}
            <atomic-layout-section section="status">
              <atomic-generated-answer with-hover-card="true" answer-style="step">
                <atomic-generated-answer-copy-button></atomic-generated-answer-copy-button>
                <atomic-generated-answer-feedback></atomic-generated-answer-feedback>
              </atomic-generated-answer>
            </atomic-layout-section>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <atomic-query-summary />
              <atomic-sort-dropdown>
                <atomic-sort-expression label="Relevance" expression="relevancy" />
                <atomic-sort-expression label="Name A–Z" expression="pokemonname ascending" />
                <atomic-sort-expression label="Name Z–A" expression="pokemonname descending" />
              </atomic-sort-dropdown>
            </div>

            <atomic-breadbox className="mb-4" />

            {/* Atomic-native result list */}
            <atomic-result-list
              ref={resultListRef}
              display="grid"
              image-size="small"
              density="compact"
            />

            <atomic-no-results />
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
