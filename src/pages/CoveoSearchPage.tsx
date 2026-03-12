import { useEffect } from "react";

const CoveoSearchPage = () => {
  useEffect(() => {
    // Initialize Coveo Atomic if needed
    const initCoveo = async () => {
      const atomic = await customElements.whenDefined("atomic-search-interface");
      const searchInterface = document.querySelector("atomic-search-interface");
      if (searchInterface) {
        await searchInterface.initialize({
          accessToken: "xx564559b1-0045-48e1-953c-3addd4ee4323",
          organizationId: "searchuisamples",
        });
      }
    };

    initCoveo();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Load Coveo Atomic script and styles */}
      <script
        type="module"
        src="https://unpkg.com/@coveo/atomic@latest/dist/atomic/atomic.esm.js"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/@coveo/atomic@latest/dist/atomic/themes/coveo.css"
      />

      <atomic-search-interface
        search-hub="Search"
        pipeline="default"
        language="en"
        timezone="America/New_York"
        currency="USD"
        numberOfResults={10}
        searchEngineOptions={{
          preprocessRequest: (request) => {
            const body = JSON.parse(request.body as string);
            body.customParam = "value";
            request.body = JSON.stringify(body);
            return request;
          },
        }}
      >
        <atomic-search-layout>
          <atomic-layout-section section="search">
            <atomic-search-box
              suggestion-timeout={1000}
              minimum-query-length={1}
              number-of-suggestions={5}
              clear-filters-on-new-search
              disable-query-syntax
              enable-query-syntax={false}
              search-box-option={{
                highlightOptions: {
                  notMatch: (text) => text.startsWith("@"),
                },
              }}
            >
              <atomic-search-box-recent-queries />
              <atomic-search-box-query-suggestions />
            </atomic-search-box>
          </atomic-layout-section>

          <atomic-layout-section section="facets">
            <atomic-facet-manager>
              <atomic-facet
                field="source"
                label="Source"
                numberOfValues={5}
                sortCriteria="occurrences"
              />
              <atomic-facet
                field="objecttype"
                label="Type"
                numberOfValues={5}
                sortCriteria="occurrences"
              />
              <atomic-facet
                field="filetype"
                label="File Type"
                numberOfValues={5}
                sortCriteria="occurrences"
              />
              <atomic-facet
                field="author"
                label="Author"
                numberOfValues={5}
                sortCriteria="occurrences"
              />
              <atomic-facet
                field="year"
                label="Year"
                numberOfValues={5}
                sortCriteria="occurrences"
              />
              <atomic-facet
                field="month"
                label="Month"
                numberOfValues={5}
                sortCriteria="occurrences"
              />
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
              <atomic-result-list
                fieldsToInclude="source,objecttype,filetype,author,year,month"
                imageSize="small"
                density="normal"
                display="list"
              >
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
                          <atomic-result-text
                            field="source"
                            label="Source"
                          />
                        </atomic-field-condition>
                        <atomic-field-condition if-defined="objecttype">
                          <atomic-result-text
                            field="objecttype"
                            label="Type"
                          />
                        </atomic-field-condition>
                        <atomic-field-condition if-defined="author">
                          <atomic-result-text
                            field="author"
                            label="Author"
                          />
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
