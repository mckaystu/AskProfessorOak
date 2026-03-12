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
    const init = async () => {
      await customElements.whenDefined("atomic-search-interface");

      // Inject the template into atomic-result-template via DOM
      const resultTemplate = document.querySelector("atomic-result-template");
      if (resultTemplate && !resultTemplate.querySelector("template")) {
        const template = document.createElement("template");
        template.innerHTML = `
          <atomic-result-section-visual>
            <atomic-result-image field="pokemon_thumbnail"></atomic-result-image>
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
        `;
        resultTemplate.appendChild(template);
      }

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
              <atomic-result-list display="list" image-size="small">
                <atomic-result-template ref={resultTemplateRef}></atomic-result-template>
              </atomic-result-list>

              <atomic-query-error></atomic-query-error>
              <atomic-no-results></atomic-no-results>
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
