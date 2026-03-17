import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const resultListRef = useRef<HTMLElement>(null);

  // Attach click listener to result cards for navigation
  useEffect(() => {
    const resultList = resultListRef.current;
    if (!resultList) return;

    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const card = target.closest(".pokemon-card") as HTMLElement;
      if (!card) return;

      const atomicResult = card.closest("atomic-result") as any;
      if (!atomicResult?.result) return;

      const raw = atomicResult.result.raw;
      const name = (Array.isArray(raw.pokemonname) ? raw.pokemonname[0] : raw.pokemonname) || atomicResult.result.title;

      navigate(`/pokemon/${name.toLowerCase()}`, {
        state: {
          thumbnail: Array.isArray(raw.pokemon_thumbnail) ? raw.pokemon_thumbnail[0] : raw.pokemon_thumbnail,
          types: raw.poketype,
          species: Array.isArray(raw.pokemonspecies) ? raw.pokemonspecies[0] : raw.pokemonspecies,
          generation: Array.isArray(raw.pokemongeneration) ? raw.pokemongeneration[0] : raw.pokemongeneration,
        },
      });
    };

    resultList.addEventListener("click", handleClick);
    return () => resultList.removeEventListener("click", handleClick);
  }, [navigate]);

  const resultTemplate = `
    <style>
      .pokemon-card {
        text-align: center;
        padding: 1rem;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .pokemon-card:hover {
        transform: scale(1.05);
      }
    </style>
    <div class="pokemon-card">
      <atomic-result-image field="pokemon_thumbnail"></atomic-result-image>
      <atomic-result-text field="pokemonname" class="text-sm font-bold capitalize mt-2" style="display:block;"></atomic-result-text>
      <atomic-result-text field="pokedesc" class="text-xs mt-1" style="display:block; opacity:0.7; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;"></atomic-result-text>
      <div class="mt-2" style="display:flex; flex-wrap:wrap; justify-content:center; gap:4px;">
        <atomic-result-multi-value-text field="poketype" delimiter=" "></atomic-result-multi-value-text>
      </div>
    </div>
  `;

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
              <atomic-search-box placeholder="Search for a Pokémon (e.g., Pika* or 025)...">
                <atomic-search-box-query-suggestions max-with-query="5" max-without-query="3" />
                <atomic-search-box-recent-queries />
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

            <atomic-result-list ref={resultListRef} display="grid" image-size="large">
              <atomic-result-template>
                <template dangerouslySetInnerHTML={{ __html: resultTemplate }} />
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
