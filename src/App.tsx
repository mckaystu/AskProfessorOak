import { useNavigate } from "react-router-dom";
import oakAvatar from "./assets/professor-oak.png";
import "./App.css";

// No more @coveo/headless imports needed for state!

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const TYPE_COLORS: Record<string, string> = {
  Normal: "#A8A77A",
  Fire: "#EE8130",
  Water: "#6390F0",
  Electric: "#F7D02C",
  Grass: "#7AC74C",
  Ice: "#96D9D6",
  Fighting: "#C22E28",
  Poison: "#A33EA1",
  Ground: "#E2BF65",
  Flying: "#A98FF3",
  Psychic: "#F95587",
  Bug: "#A6B91A",
  Rock: "#B6A136",
  Ghost: "#735797",
  Dragon: "#6F35FC",
  Dark: "#705746",
  Steel: "#B7B7CE",
  Fairy: "#D685AD",
  Stellar: "#40B5A5",
};

const needsDarkText = (type: string) => ["Electric", "Ice", "Steel"].includes(type);

function App() {
  const navigate = useNavigate();

  // Helper to extract fields from the Atomic result object safely
  const getRawValue = (result: any, field: string) => {
    const val = result.raw[field];
    return Array.isArray(val) ? val[0] : val;
  };

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

      {/* Pure Atomic Interface: handles its own initialization and URL state */}
      <atomic-search-interface
        pipeline="PKSearch"
        search-hub="pokemon-search"
        reflect-state-in-url="true"
        localization-ca-access-token="xx3824fb63-5208-448c-b651-64d479c921ce"
        organization-id="stumckaytechnicalsuccesspokemontestmh1o8r76"
        fields-to-include='["pokemon_thumbnail","pokemongeneration","poketype","pokemonname","pokemonspecies","pokedesc"]'
      >
        <div className="flex min-h-[calc(100vh-65px)]">
          <aside className="facet-sidebar w-72 shrink-0 border-r border-border bg-card p-5 overflow-y-auto">
            <atomic-facet-manager>
              <atomic-facet field="poketype" label="Type" with-search="false" />
              <atomic-facet field="pokemongeneration" label="Generation" with-search="false" />
              <atomic-facet field="pokemonspecies" label="Species" with-search="false" />
            </atomic-facet-manager>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <atomic-search-box allow-wildcards="true" placeholder="Search for a Pokémon (e.g., Pika* or 025)...">
                <atomic-search-box-query-suggestions />
              </atomic-search-box>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <atomic-query-summary />
              <atomic-sort-dropdown>
                <atomic-sort-expression label="Relevance" expression="relevancy" />
                <atomic-sort-expression label="Name A–Z" expression="pokemonname ascending" />
              </atomic-sort-dropdown>
            </div>

            <atomic-breadbox className="mb-4" />

            {/* Use atomic-result-list with a template instead of manual mapping */}
            <atomic-result-list display="grid" image-size="large">
              <atomic-result-template>
                <template>
                  <style>{`
                    .pokemon-card { text-align: center; padding: 1rem; cursor: pointer; transition: transform 0.2s; }
                    .pokemon-card:hover { transform: scale(1.05); }
                    .type-badge { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; margin: 2px; }
                  `}</style>

                  <div
                    className="pokemon-card"
                    onClick={(e: any) => {
                      // Logic to navigate using the data from the result
                      const result = (e.currentTarget as any).closest("atomic-result").result;
                      const name = getRawValue(result, "pokemonname") || result.title;
                      navigate(`/pokemon/${name.toLowerCase()}`, {
                        state: {
                          thumbnail: getRawValue(result, "pokemon_thumbnail"),
                          types: result.raw.poketype,
                          species: getRawValue(result, "pokemonspecies"),
                          generation: getRawValue(result, "pokemongeneration"),
                        },
                      });
                    }}
                  >
                    <atomic-result-image field="pokemon_thumbnail" />
                    <atomic-result-title className="text-sm font-bold capitalize mt-2" />

                    {/* The new pokedesc field we added to the scraper! */}
                    <atomic-result-text field="pokedesc" className="text-xs text-muted-foreground line-clamp-2" />

                    <div className="mt-2 flex flex-wrap justify-center">
                      <atomic-result-multi-value-text field="poketype">
                        <template>
                          <span className="type-badge" style={{ backgroundColor: "orange", color: "white" }}>
                            <atomic-result-text field="poketype" />
                          </span>
                        </template>
                      </atomic-result-multi-value-text>
                    </div>
                  </div>
                </template>
              </atomic-result-template>
            </atomic-result-list>

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
