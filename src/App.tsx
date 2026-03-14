import { useEffect } from "react";
import "./App.css";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

function App() {
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
        fields-to-include='["pokemon_thumbnail","pokemongeneration","poketype","pokemonname","pokemonspecies","pokemonhp"]'
      >
        <div className="flex min-h-[calc(100vh-65px)]">
          {/* Sidebar Facets */}
          <aside className="facet-sidebar w-72 shrink-0 border-r border-border bg-card p-5 overflow-y-auto">
            <atomic-facet-manager>
              <atomic-facet
                field="poketype"
                label="Type"
                with-search="false"
                display-values-as="checkbox"
              />
              <atomic-facet
                field="pokemongeneration"
                label="Generation"
                with-search="false"
                display-values-as="checkbox"
              />
              <atomic-numeric-facet
                field="pokemonhp"
                label="HP"
                with-input="input"
                display-values-as="link"
              >
                <atomic-numeric-range start="0" end="50" label="0–50" />
                <atomic-numeric-range start="51" end="100" label="51–100" />
                <atomic-numeric-range start="101" end="150" label="101–150" />
                <atomic-numeric-range start="151" end="255" label="151+" />
              </atomic-numeric-facet>
            </atomic-facet-manager>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <atomic-search-box placeholder="Search for a Pokémon (e.g., Pikachu or 025)..." />
            </div>

            {/* Status Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <atomic-query-summary />
              <atomic-sort-dropdown>
                <atomic-sort-expression label="Relevance" expression="relevancy" />
                <atomic-sort-expression label="Name A–Z" expression="pokemonname ascending" />
                <atomic-sort-expression label="Name Z–A" expression="pokemonname descending" />
                <atomic-sort-expression label="HP: Low → High" expression="pokemonhp ascending" />
                <atomic-sort-expression label="HP: High → Low" expression="pokemonhp descending" />
              </atomic-sort-dropdown>
            </div>

            <atomic-breadbox className="mb-4" />

            {/* Grid Result List */}
            <atomic-result-list
              display="grid"
              density="comfortable"
              image-size="large"
            >
              <atomic-result-template>
                <template>
                  <style>{`
                    .result-card-grid {
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                      padding: 16px;
                      border: 1px solid hsl(214.3, 31.8%, 91.4%);
                      border-radius: 12px;
                      background: hsl(0, 0%, 100%);
                      transition: box-shadow 0.2s, transform 0.2s;
                      text-align: center;
                      height: 100%;
                    }
                    .result-card-grid:hover {
                      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
                      transform: translateY(-2px);
                    }
                    .pokemon-sprite {
                      width: 120px;
                      height: 120px;
                      object-fit: contain;
                      margin-bottom: 8px;
                    }
                    .pokemon-grid-name {
                      font-weight: 700;
                      font-size: 1.1rem;
                      text-transform: capitalize;
                      margin-bottom: 6px;
                      color: hsl(222.2, 84%, 4.9%);
                    }
                    .pokemon-grid-name a {
                      color: inherit;
                      text-decoration: none;
                    }
                    .pokemon-grid-name a:hover {
                      text-decoration: underline;
                    }
                  `}</style>
                  <div className="result-card-grid">
                    <atomic-result-image
                      field="pokemon_thumbnail"
                      className="pokemon-sprite"
                      fallback="/placeholder.svg"
                    />
                    <div className="pokemon-grid-name">
                      <atomic-result-link />
                    </div>
                    <atomic-result-badge field="poketype" />
                  </div>
                </template>
              </atomic-result-template>
            </atomic-result-list>

            <atomic-no-results />
            <atomic-query-error />

            {/* Pagination */}
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
