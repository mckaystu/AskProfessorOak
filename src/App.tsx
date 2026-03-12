import { useEffect } from "react";
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
        searchInterface.executeFirstSearch();
      } catch (error) {
        console.error("Failed to initialize Coveo Atomic:", error);
      }
    };

    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* HEADER */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-red-600">Pokedex Search</h1>
      </header>

      <atomic-search-interface pipeline="default" search-hub="MainSearch">
        <atomic-search-layout>
          {/* SEARCH BOX */}
          <atomic-layout-section section="search">
            <atomic-search-box></atomic-search-box>
          </atomic-layout-section>

          {/* STATUS BAR */}
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

          {/* FACETS */}
          <atomic-layout-section section="facets">
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

          {/* RESULTS PANEL */}
          <atomic-layout-section section="main">
            <atomic-result-list display="grid" image-size="large">
              <atomic-result-template>
                <template>
                  <div className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-lg transition-shadow">
                    <atomic-result-section-visual>
                      <atomic-result-image
                        field="pokemon_image_url"
                        class="h-40 w-full object-contain"
                      ></atomic-result-image>
                    </atomic-result-section-visual>

                    <atomic-result-section-title class="mt-4 font-bold text-xl capitalize">
                      <atomic-result-link></atomic-result-link>
                    </atomic-result-section-title>

                    <atomic-result-section-excerpt>
                      <div className="text-sm text-gray-500 my-2">
                        <atomic-result-text field="pokemongeneration"></atomic-result-text>
                      </div>
                      {/* THE COLOR CODED TYPES */}
                      <atomic-result-badge field="poketype"></atomic-result-badge>
                    </atomic-result-section-excerpt>
                  </div>
                </template>
              </atomic-result-template>
            </atomic-result-list>

            <atomic-query-error></atomic-query-error>
            <atomic-no-results></atomic-no-results>
          </atomic-layout-section>

          <atomic-layout-section section="pagination" class="py-8">
            <atomic-pager></atomic-pager>
          </atomic-layout-section>
        </atomic-search-layout>
      </atomic-search-interface>
    </div>
  );
}

export default App;
