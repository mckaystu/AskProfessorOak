import { useEffect, useRef } from "react";

const CoveoSearchPage = () => {
  const searchInterfaceRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Load Coveo Atomic script dynamically
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://unpkg.com/@coveo/atomic@latest/dist/atomic/atomic.esm.js";
    document.head.appendChild(script);

    // Load Coveo Atomic styles
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/@coveo/atomic@latest/dist/atomic/themes/coveo.css";
    document.head.appendChild(link);

    // Initialize Coveo when script loads
    const initCoveo = async () => {
      await customElements.whenDefined("atomic-search-interface");
      if (searchInterfaceRef.current) {
        const searchInterface = searchInterfaceRef.current as unknown as {
          initialize: (config: { accessToken: string; organizationId: string }) => Promise<void>;
        };
        await searchInterface.initialize({
          accessToken: "xx564559b1-0045-48e1-953c-3addd4ee4323",
          organizationId: "searchuisamples",
        });
      }
    };

    script.onload = () => {
      initCoveo();
    };

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <atomic-search-interface
        ref={searchInterfaceRef}
        search-hub="Search"
        pipeline="default"
        language="en"
        timezone="America/New_York"
        currency="USD"
      >
        <atomic-search-layout>
          <atomic-layout-section section="search">
            <atomic-search-box>
              <atomic-search-box-recent-queries />
              <atomic-search-box-query-suggestions />
            </atomic-search-box>
          </atomic-layout-section>

          <atomic-layout-section section="facets">
            <atomic-facet-manager>
              <atomic-facet field="source" label="Source" />
              <atomic-facet field="objecttype" label="Type" />
              <atomic-facet field="filetype" label="File Type" />
              <atomic-facet field="author" label="Author" />
              <atomic-facet field="year" label="Year" />
            </atomic-facet-manager>
          </atomic-layout-section>

          <atomic-layout-section section="main">
            <atomic-layout-section section="status">
              <atomic-breadbox />
              <atomic-query-summary />
              <atomic-sort-dropdown />
              <atomic-did-you-mean />
            </atomic-layout-section>

            <atomic-layout-section section="results">
              <atomic-result-list>
                <atomic-result-template>
                  <template>
                    <atomic-result-section-visual>
                      <atomic-result-icon />
                    </atomic-result-section-visual>
                    <atomic-result-section-title>
                      <atomic-result-link />
                    </atomic-result-section-title>
                    <atomic-result-section-excerpt>
                      <atomic-result-text field="excerpt" />
                    </atomic-result-section-excerpt>
                    <atomic-result-section-bottom-metadata>
                      <atomic-result-fields-list>
                        <atomic-field-condition if-defined="source">
                          <atomic-result-text field="source" label="Source" />
                        </atomic-field-condition>
                        <atomic-field-condition if-defined="objecttype">
                          <atomic-result-text field="objecttype" label="Type" />
                        </atomic-field-condition>
                        <atomic-field-condition if-defined="author">
                          <atomic-result-text field="author" label="Author" />
                        </atomic-field-condition>
                      </atomic-result-fields-list>
                    </atomic-result-section-bottom-metadata>
                  </template>
                </atomic-result-template>
              </atomic-result-list>
              <atomic-no-results />
            </atomic-layout-section>

            <atomic-layout-section section="pagination">
              <atomic-load-more-results />
            </atomic-layout-section>
          </atomic-layout-section>
        </atomic-search-layout>
      </atomic-search-interface>
    </div>
  );
};

export default CoveoSearchPage;
