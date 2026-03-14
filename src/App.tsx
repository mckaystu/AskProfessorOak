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

const RESULT_TEMPLATE_HTML = `
  <style>
    .result-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      background: #fff;
      transition: box-shadow 0.2s, transform 0.2s;
      text-align: center;
      text-decoration: none;
      color: inherit;
      height: 100%;
    }
    .result-card:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }
    .result-card atomic-result-image {
      height: 7rem;
      width: 7rem;
    }
    .result-card .name {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: capitalize;
    }
    .result-card .types {
      margin-top: 0.375rem;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.25rem;
    }
  </style>
  <atomic-result-link class="result-card">
    <atomic-result-image field="pokemon_thumbnail" fallback="/placeholder.svg"></atomic-result-image>
    <span class="name"><atomic-result-text field="pokemonname"></atomic-result-text></span>
    <span class="types"><atomic-result-multi-value-text field="poketype"></atomic-result-multi-value-text></span>
  </atomic-result-link>
`;

function App() {
  const templateRef = useRef<HTMLTemplateElement>(null);

  useEffect(() => {
    // Set template innerHTML before Coveo initializes
    if (templateRef.current) {
      templateRef.current.innerHTML = RESULT_TEMPLATE_HTML;
    }

    const init = async () => {
      await customElements.whenDefined("atomic-search-interface");
      const searchInterface = document.querySelector("atomic-search-interface") as any;
      if (!searchInterface) return;

      try {
        await searchInterface.initialize({
          accessToken: "xx3824fb63-5208-448c-b651-64d479c921ce",
          organizationId: "stumckaytechnicalsuccesspokemontestmh1o8r76",
        });
        searchInterface.executeFirstSearch();
      } catch (error) {
        console.error("Failed to initialize Coveo Atomic:", error);
      }
    };

    void init();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <img
            src={oakAvatar}
            alt="Professor Oak"
            className="h-12 w-12 rounded-full object-cover border-2 border-primary shadow-sm"
          />
          <h1 className="text-3xl font-bold text-destructive tracking-tight">Ask Professor Oak</h1>
        </div>
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

            <atomic-result-list display="grid" density="compact" image-size="small">
              <atomic-result-template>
                <template ref={templateRef}></template>
              </atomic-result-template>
            </atomic-result-list>

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
