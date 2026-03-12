declare namespace JSX {
  interface IntrinsicElements {
    "atomic-search-interface": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "search-hub"?: string;
      pipeline?: string;
      language?: string;
      timezone?: string;
      currency?: string;
      numberOfResults?: number;
      "search-engine-options"?: string;
    };
    "atomic-search-layout": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-layout-section": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      section?: string;
    };
    "atomic-search-box": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "suggestion-timeout"?: number;
      "minimum-query-length"?: number;
      "number-of-suggestions"?: number;
      "clear-filters-on-new-search"?: boolean;
      "disable-query-syntax"?: boolean;
      "enable-query-syntax"?: boolean;
      "search-box-option"?: string;
    };
    "atomic-search-box-recent-queries": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-search-box-query-suggestions": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-facet-manager": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-facet": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      field?: string;
      label?: string;
      numberOfValues?: number;
      sortCriteria?: string;
    };
    "atomic-breadbox": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-query-summary": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-sort-dropdown": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-did-you-mean": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-list": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "fields-to-include"?: string;
      imageSize?: string;
      density?: string;
      display?: string;
    };
    "atomic-result-template": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-section-visual": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-section-title": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-section-excerpt": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-section-bottom-metadata": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-icon": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-link": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-result-text": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      field?: string;
      label?: string;
    };
    "atomic-result-fields-list": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-field-condition": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      "if-defined"?: string;
      "if-not-defined"?: string;
    };
    "atomic-no-results": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "atomic-load-more-results": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
