import { useEffect, useState, useCallback } from "react";

interface FacetValue {
  value: string;
  numberOfResults: number;
  state: "idle" | "selected" | "excluded";
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  normal:   { bg: "#A8A77A", text: "#fff" },
  fire:     { bg: "#EE8130", text: "#fff" },
  water:    { bg: "#6390F0", text: "#fff" },
  electric: { bg: "#F7D02C", text: "#333" },
  grass:    { bg: "#7AC74C", text: "#fff" },
  ice:      { bg: "#96D9D6", text: "#333" },
  fighting: { bg: "#C22E28", text: "#fff" },
  poison:   { bg: "#A33EA1", text: "#fff" },
  ground:   { bg: "#E2BF65", text: "#fff" },
  flying:   { bg: "#A98FF3", text: "#fff" },
  psychic:  { bg: "#F95587", text: "#fff" },
  bug:      { bg: "#A6B91A", text: "#fff" },
  rock:     { bg: "#B6A136", text: "#fff" },
  ghost:    { bg: "#735797", text: "#fff" },
  dragon:   { bg: "#6F35FC", text: "#fff" },
  dark:     { bg: "#705746", text: "#fff" },
  steel:    { bg: "#B7B7CE", text: "#333" },
  fairy:    { bg: "#D685AD", text: "#fff" },
  stellar:  { bg: "#40B5A5", text: "#fff" },
};

interface TypeFacetProps {
  engine: any;
}

export function TypeFacet({ engine }: TypeFacetProps) {
  const [values, setValues] = useState<FacetValue[]>([]);
  const [controller, setController] = useState<any>(null);

  useEffect(() => {
    if (!engine) return;

    // Dynamic import to avoid SSR issues
    import("@coveo/headless").then(({ buildFacet }) => {
      const facetController = buildFacet(engine, {
        options: {
          field: "poketype",
          numberOfValues: 20,
          facetId: "poketype",
        },
      });

      setController(facetController);

      const unsubscribe = facetController.subscribe(() => {
        const state = facetController.state;
        setValues(
          state.values.map((v: any) => ({
            value: v.value,
            numberOfResults: v.numberOfResults,
            state: v.state,
          }))
        );
      });

      return () => unsubscribe();
    });
  }, [engine]);

  const toggleValue = useCallback(
    (facetValue: FacetValue) => {
      if (!controller) return;
      const stateValues = controller.state.values;
      const match = stateValues.find((v: any) => v.value === facetValue.value);
      if (match) controller.toggleSelect(match);
    },
    [controller]
  );

  if (!values.length) return null;

  return (
    <div className="mb-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Type
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => {
          const key = v.value.toLowerCase();
          const colors = TYPE_COLORS[key] || { bg: "hsl(var(--muted))", text: "hsl(var(--foreground))" };
          const isSelected = v.state === "selected";

          return (
            <button
              key={v.value}
              onClick={() => toggleValue(v)}
              className="type-tile"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                opacity: isSelected ? 1 : 0.55,
                outline: isSelected ? `2px solid ${colors.bg}` : "none",
                outlineOffset: isSelected ? "2px" : "0",
              }}
              title={`${v.value} (${v.numberOfResults})`}
            >
              {v.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
